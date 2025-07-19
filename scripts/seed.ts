const { PrismaClient } = require('@prisma/client')

const database = new PrismaClient()

async function main() {
  try {
    // Seed categories first
    const existingCategories = await database.category.count();
    
    if (existingCategories === 0) {
      await database.category.createMany({
        data: [
          { name: 'Computer Science' },
          { name: 'Music' },
          { name: 'Fitness' },
          { name: 'Photography' },
          { name: 'Accounting' },
          { name: 'Engineering' },
          { name: 'Filming' },
        ],
      });
      console.log('Successfully seeded categories!');
    } else {
      console.log(`${existingCategories} categories already exist. Skipping category seed.`);
    }

    // Check if achievements already exist
    const existingAchievements = await database.achievement.count();
    
    if (existingAchievements > 0) {
      console.log(`${existingAchievements} achievements already exist. Skipping achievement seed.`);
      return;
    }

    // Seed achievements
    await database.achievement.createMany({
      data: [
        // Learning Achievements
        {
          name: "First Steps",
          description: "Complete your first chapter",
          icon: "🎯",
          category: "learning",
          condition: { type: "chapter_completion", count: 1 },
          xpReward: 25,
          isActive: true
        },
        {
          name: "Getting Started",
          description: "Complete 5 chapters",
          icon: "📚",
          category: "learning", 
          condition: { type: "chapter_completion", count: 5 },
          xpReward: 50,
          isActive: true
        },
        {
          name: "Knowledge Seeker",
          description: "Complete 25 chapters",
          icon: "🔍",
          category: "learning",
          condition: { type: "chapter_completion", count: 25 },
          xpReward: 100,
          isActive: true
        },
        {
          name: "Scholar",
          description: "Complete 50 chapters",
          icon: "🎓",
          category: "learning",
          condition: { type: "chapter_completion", count: 50 },
          xpReward: 200,
          isActive: true
        },
        {
          name: "Master Learner",
          description: "Complete 100 chapters",
          icon: "👨‍🎓",
          category: "learning",
          condition: { type: "chapter_completion", count: 100 },
          xpReward: 500,
          isActive: true
        },

        // Course Completion Achievements
        {
          name: "Course Graduate",
          description: "Complete your first course",
          icon: "🏆",
          category: "learning",
          condition: { type: "course_completion", count: 1 },
          xpReward: 100,
          isActive: true
        },
        {
          name: "Multi-Disciplinary",
          description: "Complete 3 courses",
          icon: "🌟",
          category: "learning",
          condition: { type: "course_completion", count: 3 },
          xpReward: 250,
          isActive: true
        },
        {
          name: "Expert",
          description: "Complete 10 courses",
          icon: "💎",
          category: "learning",
          condition: { type: "course_completion", count: 10 },
          xpReward: 750,
          isActive: true
        },

        // Consistency Achievements (Streaks)
        {
          name: "Consistent Learner",
          description: "Maintain a 3-day learning streak",
          icon: "🔥",
          category: "consistency",
          condition: { type: "streak", count: 3 },
          xpReward: 50,
          isActive: true
        },
        {
          name: "Dedicated Student",
          description: "Maintain a 7-day learning streak",
          icon: "⚡",
          category: "consistency",
          condition: { type: "streak", count: 7 },
          xpReward: 100,
          isActive: true
        },
        {
          name: "Habit Former",
          description: "Maintain a 30-day learning streak",
          icon: "💪",
          category: "consistency",
          condition: { type: "streak", count: 30 },
          xpReward: 300,
          isActive: true
        },
        {
          name: "Unstoppable",
          description: "Maintain a 100-day learning streak",
          icon: "🚀",
          category: "consistency",
          condition: { type: "streak", count: 100 },
          xpReward: 1000,
          isActive: true
        },

        // Excellence Achievements (Quiz Performance)
        {
          name: "Quiz Master",
          description: "Complete 10 quizzes",
          icon: "🧠",
          category: "excellence",
          condition: { type: "quiz_completion", count: 10 },
          xpReward: 75,
          isActive: true
        },
        {
          name: "Perfect Score",
          description: "Get 100% on a quiz",
          icon: "⭐",
          category: "excellence",
          condition: { type: "perfect_quiz", count: 1 },
          xpReward: 100,
          isActive: true
        },
        {
          name: "Perfectionist",
          description: "Get 100% on 5 quizzes",
          icon: "🌟",
          category: "excellence",
          condition: { type: "perfect_quiz", count: 5 },
          xpReward: 300,
          isActive: true
        },
        {
          name: "Quiz Champion",
          description: "Get 100% on 25 quizzes",
          icon: "👑",
          category: "excellence",
          condition: { type: "perfect_quiz", count: 25 },
          xpReward: 750,
          isActive: true
        },

        // Level-based Achievements
        {
          name: "Rising Star",
          description: "Reach level 5",
          icon: "🌠",
          category: "learning",
          condition: { type: "level", count: 5 },
          xpReward: 100,
          isActive: true
        },
        {
          name: "Advanced Learner",
          description: "Reach level 10",
          icon: "🎖️",
          category: "learning",
          condition: { type: "level", count: 10 },
          xpReward: 250,
          isActive: true
        },
        {
          name: "Expert Level",
          description: "Reach level 25",
          icon: "💫",
          category: "learning",
          condition: { type: "level", count: 25 },
          xpReward: 500,
          isActive: true
        },

        // XP-based Achievements
        {
          name: "XP Collector",
          description: "Earn 1,000 XP",
          icon: "💰",
          category: "learning",
          condition: { type: "total_xp", count: 1000 },
          xpReward: 100,
          isActive: true
        },
        {
          name: "XP Hoarder",
          description: "Earn 5,000 XP",
          icon: "💎",
          category: "learning",
          condition: { type: "total_xp", count: 5000 },
          xpReward: 250,
          isActive: true
        },
        {
          name: "XP Legend",
          description: "Earn 25,000 XP",
          icon: "🏅",
          category: "learning",
          condition: { type: "total_xp", count: 25000 },
          xpReward: 1000,
          isActive: true
        }
      ],
    })

    console.log('Successfully seeded achievements!');
    console.log('🟢 Seed script completed successfully! 🟢');
  } catch (error) {
    console.log('🔴 Error seeding the database 🔴', error)
  } finally {
    await database.$disconnect()
  }
}

main()
