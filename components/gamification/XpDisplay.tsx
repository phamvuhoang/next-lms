'use client';

import { Progress } from "@/components/ui/progress";

interface XpDisplayProps {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  xpToNextLevel: number;
}

export const XpDisplay = ({ totalXP, level, currentLevelXP, xpToNextLevel }: XpDisplayProps) => {
  const progress = (currentLevelXP / xpToNextLevel) * 100;

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">Level {level}</h3>
        <p className="text-sm text-gray-600">
          {currentLevelXP} / {xpToNextLevel} XP
        </p>
      </div>
      <Progress value={progress} />
      <p className="text-xs text-right text-gray-500 mt-1">Total XP: {totalXP}</p>
    </div>
  );
};
