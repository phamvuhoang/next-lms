'use client';

interface StreakCounterProps {
  currentStreak: number;
}

export const StreakCounter = ({ currentStreak }: StreakCounterProps) => {
  return (
    <div className="flex items-center p-4 bg-orange-100 rounded-lg">
      <div className="mr-4 text-4xl">🔥</div>
      <div>
        <h4 className="text-2xl font-bold">{currentStreak} Day Streak</h4>
        <p className="text-sm text-gray-600">Keep the flame alive!</p>
      </div>
    </div>
  );
};
