'use server'

import { db } from "@/lib/db";

const BASE_GOAL = 50;

export const getOrCreateDailyGoal = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dailyGoal = await db.dailyGoal.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (!dailyGoal) {
    // Simple goal for now, can be made adaptive later
    dailyGoal = await db.dailyGoal.create({
      data: {
        userId,
        date: today,
        targetXP: BASE_GOAL,
      },
    });
  }

  return dailyGoal;
};

export const updateDailyGoalProgress = async (userId: string, xpGained: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyGoal = await getOrCreateDailyGoal(userId);

  if (dailyGoal.isCompleted) {
    return dailyGoal;
  }

  const newCurrentXP = dailyGoal.currentXP + xpGained;
  const isCompleted = newCurrentXP >= dailyGoal.targetXP;

  return await db.dailyGoal.update({
    where: { id: dailyGoal.id },
    data: {
      currentXP: newCurrentXP,
      isCompleted,
    },
  });
};
