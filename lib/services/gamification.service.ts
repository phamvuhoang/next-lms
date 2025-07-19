import { db } from "@/lib/db";
import { updateDailyGoalProgress } from "./daily-goal.service";

// XP thresholds for each level (Duolingo-inspired exponential curve)
const calculateXPForLevel = (level: number): number => {
  return Math.pow(level, 2) * 100;
};

const calculateLevelFromXP = (totalXP: number): number => {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
};

const calculateCurrentLevelXP = (totalXP: number, level: number): number => {
  const previousLevelXP = level > 1 ? calculateXPForLevel(level - 1) : 0;
  return totalXP - previousLevelXP;
};

const calculateXPToNextLevel = (totalXP: number, level: number): number => {
  const nextLevelXP = calculateXPForLevel(level);
  const currentLevelXP = calculateCurrentLevelXP(totalXP, level);
  const xpNeededForCurrentLevel = calculateXPForLevel(level) - (level > 1 ? calculateXPForLevel(level - 1) : 0);
  return xpNeededForCurrentLevel - currentLevelXP;
};

export const awardXP = async (userId: string, amount: number, reason: string, sourceType: string, sourceId?: string) => {
  // Get or create user XP record
  let userXp = await db.userXP.findUnique({
    where: { userId },
  });

  const oldTotalXP = userXp?.totalXP || 0;
  const newTotalXP = oldTotalXP + amount;
  
  const oldLevel = userXp?.level || 1;
  const newLevel = calculateLevelFromXP(newTotalXP);
  const currentLevelXP = calculateCurrentLevelXP(newTotalXP, newLevel);
  
  // Update or create user XP
  userXp = await db.userXP.upsert({
    where: { userId },
    create: { 
      userId, 
      totalXP: newTotalXP, 
      level: newLevel, 
      currentLevelXP: currentLevelXP 
    },
    update: { 
      totalXP: newTotalXP, 
      level: newLevel, 
      currentLevelXP: currentLevelXP 
    },
  });

  // Create XP transaction
  await db.xPTransaction.create({
    data: { userId, amount, reason, sourceType, sourceId },
  });

  // Check for level up
  const levelUp = newLevel > oldLevel;
  
  // Check for achievements
  await checkAndAwardAchievements(userId, sourceType, { 
    sourceId, 
    newTotalXP, 
    newLevel, 
    levelUp 
  });

  // Update streak if it's a learning activity
  if (sourceType === 'chapter' || sourceType === 'quiz' || sourceType === 'assignment') {
    await updateUserStreak(userId);
    await updateDailyGoalProgress(userId, amount);
  }

  return {
    ...userXp,
    levelUp,
    xpToNextLevel: calculateXPToNextLevel(newTotalXP, newLevel)
  };
};

export const getUserXP = async (userId: string) => {
  const userXp = await db.userXP.findUnique({
    where: { userId },
    include: {
      xpTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!userXp) {
    return null;
  }

  return {
    ...userXp,
    xpToNextLevel: calculateXPToNextLevel(userXp.totalXP, userXp.level),
  };
};

export const getLeaderboard = async (timeframe: 'weekly' | 'monthly' | 'all-time' = 'all-time', limit = 50, offset = 0) => {
  if (timeframe === 'all-time') {
    const leaderboard = await db.userXP.findMany({
      orderBy: { totalXP: 'desc' },
      take: limit,
      skip: offset,
    });

    const totalUsers = await db.userXP.count();

    return {
      leaderboard: leaderboard.map((user, index) => ({
        ...user,
        rank: offset + index + 1,
      })),
      totalUsers,
    };
  } else {
    const now = new Date();
    let startDate: Date;

    if (timeframe === 'weekly') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else { // monthly
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const xpByTimeframe = await db.xPTransaction.groupBy({
      by: ['userId'],
      _sum: {
        amount: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: limit,
      skip: offset,
    });

    const userIds = xpByTimeframe.map(item => item.userId);
    const users = await db.userXP.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
    });

    const userMap = new Map(users.map(user => [user.userId, user]));

    const leaderboard = xpByTimeframe.map((item, index) => {
      const user = userMap.get(item.userId);
      return {
        ...user,
        totalXP: item._sum.amount || 0,
        rank: offset + index + 1,
      };
    });

    const totalUsers = await db.xPTransaction.count({
        where: {
            createdAt: {
                gte: startDate,
            },
        },
        distinct: ['userId'],
    });

    return {
      leaderboard,
      totalUsers
    };
  }
};

export const checkAndAwardAchievements = async (userId: string, eventType: string, eventData: any) => {
  // Get all active achievements
  const achievements = await db.achievement.findMany({
    where: { isActive: true },
  });

  // Get user's existing achievements
  const userAchievements = await db.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });

  const existingAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
  const newAchievements = [];

  for (const achievement of achievements) {
    // Skip if user already has this achievement
    if (existingAchievementIds.has(achievement.id)) {
      continue;
    }

    // Check if achievement condition is met
    const conditionMet = await checkAchievementCondition(userId, achievement, eventType, eventData);
    
    if (conditionMet) {
      // Award achievement
      await db.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award XP for achievement if specified
      if (achievement.xpReward > 0) {
        await awardXP(userId, achievement.xpReward, `Achievement: ${achievement.name}`, 'achievement', achievement.id);
      }

      newAchievements.push(achievement);
    }
  }

  return newAchievements;
};

const checkAchievementCondition = async (userId: string, achievement: any, eventType: string, eventData: any): Promise<boolean> => {
  const condition = achievement.condition;
  
  switch (condition.type) {
    case 'chapter_completion':
      if (eventType === 'chapter') {
        const completedChapters = await db.userProgress.count({
          where: { userId, isCompleted: true },
        });
        return completedChapters >= condition.count;
      }
      break;

    case 'course_completion':
      if (eventType === 'course') {
        const completedCourses = await db.purchase.count({
          where: { userId },
        });
        // TODO: Add proper course completion tracking
        return completedCourses >= condition.count;
      }
      break;

    case 'quiz_completion':
      if (eventType === 'quiz') {
        const quizAttempts = await db.quizAttempt.count({
          where: { userId },
        });
        return quizAttempts >= condition.count;
      }
      break;

    case 'perfect_quiz':
      if (eventType === 'quiz') {
        const perfectQuizzes = await db.quizAttempt.count({
          where: { 
            userId, 
            score: { gte: 100 } 
          },
        });
        return perfectQuizzes >= condition.count;
      }
      break;

    case 'streak':
      if (eventType === 'chapter' || eventType === 'quiz' || eventType === 'assignment') {
        const userStreak = await db.userStreak.findUnique({
          where: { userId },
        });
        return userStreak ? userStreak.currentStreak >= condition.count : false;
      }
      break;

    case 'level':
      return eventData.newLevel >= condition.count;

    case 'total_xp':
      return eventData.newTotalXP >= condition.count;

    default:
      return false;
  }

  return false;
};

export const updateUserStreak = async (userId: string) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  let userStreak = await db.userStreak.findUnique({
    where: { userId },
  });

  if (!userStreak) {
    // Create new streak record
    userStreak = await db.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: todayStart,
      },
    });
  } else {
    const lastActivityDate = userStreak.lastActivityDate;
    
    if (lastActivityDate) {
      const lastActivityStart = new Date(lastActivityDate.getFullYear(), lastActivityDate.getMonth(), lastActivityDate.getDate());
      const daysDifference = Math.floor((todayStart.getTime() - lastActivityStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference === 0) {
        // Same day, no update needed
        return userStreak;
      } else if (daysDifference === 1) {
        // Consecutive day, increment streak
        const newStreak = userStreak.currentStreak + 1;
        userStreak = await db.userStreak.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(userStreak.longestStreak, newStreak),
            lastActivityDate: todayStart,
          },
        });
      } else {
        // Streak broken, reset to 1
        userStreak = await db.userStreak.update({
          where: { userId },
          data: {
            currentStreak: 1,
            lastActivityDate: todayStart,
          },
        });
      }
    } else {
      // First activity, set streak to 1
      userStreak = await db.userStreak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(userStreak.longestStreak, 1),
          lastActivityDate: todayStart,
        },
      });
    }
  }

  return userStreak;
};

export const getUserStreak = async (userId: string) => {
  return await db.userStreak.findUnique({
    where: { userId },
  });
};

export const useStreakFreeze = async (userId: string) => {
  const userStreak = await db.userStreak.findUnique({
    where: { userId },
  });

  if (!userStreak || userStreak.freezesAvailable <= 0) {
    throw new Error('No streak freezes available');
  }

  return await db.userStreak.update({
    where: { userId },
    data: {
      freezesAvailable: { decrement: 1 },
      freezesUsed: { increment: 1 },
    },
  });
};
