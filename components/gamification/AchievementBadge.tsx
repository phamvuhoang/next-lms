'use client';

import { Badge } from "@/components/ui/badge";

interface AchievementBadgeProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
  };
}

export const AchievementBadge = ({ achievement }: AchievementBadgeProps) => {
  return (
    <div className="flex items-center p-4 border rounded-lg">
      <div className="mr-4 text-2xl">{achievement.icon}</div>
      <div>
        <h4 className="font-bold">{achievement.name}</h4>
        <p className="text-sm text-gray-600">{achievement.description}</p>
      </div>
    </div>
  );
};
