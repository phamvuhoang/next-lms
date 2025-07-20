'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target } from "lucide-react";

interface DailyGoal {
  targetXP: number;
  currentXP: number;
  isCompleted: boolean;
}

export const DailyGoalDisplay = () => {
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDailyGoal = async () => {
      try {
        const { data } = await axios.get("/api/daily-goal");
        setDailyGoal(data);
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyGoal();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            <span>Daily Goal</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!dailyGoal) {
    return null;
  }

  const progress = Math.min(100, (dailyGoal.currentXP / dailyGoal.targetXP) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          <span>Daily Goal</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Earn {dailyGoal.targetXP} XP today to keep up your streak!
        </p>
        <Progress value={progress} />
        <p className="text-right text-sm font-semibold mt-1">
          {dailyGoal.currentXP} / {dailyGoal.targetXP} XP
        </p>
        {dailyGoal.isCompleted && (
          <p className="text-center text-green-600 font-semibold mt-2">Goal Completed!</p>
        )}
      </CardContent>
    </Card>
  );
};