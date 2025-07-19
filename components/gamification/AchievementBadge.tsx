'use client';

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AchievementBadgeProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
  };
  progress?: {
    currentProgress: number;
    requiredProgress: number;
    percentage: number;
  };
}

export const AchievementBadge = ({ achievement, progress }: AchievementBadgeProps) => {
  return (
    <div className="flex items-center p-4 border rounded-lg">
      <div className="mr-4 text-2xl">{achievement.icon}</div>
      <div className="flex-grow">
        <h4 className="font-bold">{achievement.name}</h4>
        <p className="text-sm text-gray-600">{achievement.description}</p>
        {progress && (
          <div className="mt-2">
            <Progress value={progress.percentage} />
            <p className="text-xs text-right mt-1">
              {progress.currentProgress} / {progress.requiredProgress}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
