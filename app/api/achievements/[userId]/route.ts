import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { userId } = await params;
    
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Users can only access their own achievements
    if (clerkUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const userAchievements = await db.userAchievement.findMany({
      where: { userId },
      include: { 
        achievement: true 
      },
      orderBy: { unlockedAt: 'desc' }
    });

    // Get all achievements to calculate progress
    const allAchievements = await db.achievement.findMany({
      where: { isActive: true }
    });

    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
    
    // Calculate progress towards locked achievements
    const progressTowards = [];
    for (const achievement of allAchievements) {
      if (!unlockedAchievementIds.has(achievement.id)) {
        const condition = achievement.condition as any;
        let currentProgress = 0;
        const requiredProgress = condition.count;

        switch (condition.type) {
          case 'chapter_completion':
            currentProgress = await db.userProgress.count({
              where: { userId, isCompleted: true },
            });
            break;
          case 'quiz_completion':
            currentProgress = await db.quizAttempt.count({ where: { userId } });
            break;
          case 'perfect_quiz':
            currentProgress = await db.quizAttempt.count({
              where: { userId, score: { gte: 100 } },
            });
            break;
          case 'streak':
            const userStreak = await db.userStreak.findUnique({ where: { userId } });
            currentProgress = userStreak?.currentStreak || 0;
            break;
          case 'level':
            const userXp = await db.userXP.findUnique({ where: { userId } });
            currentProgress = userXp?.level || 0;
            break;
          case 'total_xp':
            const userXpTotal = await db.userXP.findUnique({ where: { userId } });
            currentProgress = userXpTotal?.totalXP || 0;
            break;
        }

        progressTowards.push({
          achievementId: achievement.id,
          achievement,
          currentProgress,
          requiredProgress,
          percentage: Math.min(100, (currentProgress / requiredProgress) * 100),
        });
      }
    }

    return NextResponse.json({ 
      unlockedAchievements: userAchievements,
      progressTowards: progressTowards.slice(0, 5) // Limit to 5 for performance
    });
  } catch (error) {
    console.error("[USER_ACHIEVEMENTS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
