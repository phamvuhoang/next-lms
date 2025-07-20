'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StreakCounter } from "./StreakCounter";
import { AchievementBadge } from "./AchievementBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Flame, Star } from "lucide-react";

interface UserXPData {
  userId: string;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  xpTransactions: any[];
}

interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  freezesAvailable: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface UserAchievement {
  id: string;
  unlockedAt: string;
  achievement: Achievement;
}

import { DailyGoalDisplay } from "./DailyGoalDisplay";

export const DashboardGamification = () => {
  const { user } = useUser();
  const router = useRouter();
  const [xpData, setXpData] = useState<UserXPData | null>(null);
  const [, setStreakData] = useState<UserStreak | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [progressTowards, setProgressTowards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchGamificationData = async () => {
      try {
        setLoading(true);

        // Fetch XP data
        const xpResponse = await fetch(`/api/xp/${user.id}`);
        if (xpResponse.ok) {
          const xpResult = await xpResponse.json();
          setXpData(xpResult);
        }

        // Fetch streak data
        const streakResponse = await fetch(`/api/streaks/${user.id}`);
        if (streakResponse.ok) {
          const streakResult = await streakResponse.json();
          setStreakData(streakResult);
        }

        // Fetch achievements
        const achievementsResponse = await fetch(`/api/achievements/${user.id}`);
        if (achievementsResponse.ok) {
          const achievementsResult = await achievementsResponse.json();
          setAchievements(achievementsResult.unlockedAchievements || []);
          setProgressTowards(achievementsResult.progressTowards || []);
        }
      } catch (error) {
        // Silently handle error
      } finally {
        setLoading(false);
      }
    };

    fetchGamificationData();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const recentAchievements = achievements
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* XP & Level Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Level & XP</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              Level {xpData?.level || 1}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {xpData?.totalXP || 0} total XP
            </p>
            {xpData && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-blue-600 mb-1">
                  <span>{xpData.currentLevelXP} XP</span>
                  <span>{xpData.xpToNextLevel} to next level</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(xpData.currentLevelXP / (xpData.currentLevelXP + xpData.xpToNextLevel)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Goal Card */}
        <DailyGoalDisplay />

        {/* Achievements Card */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {achievements.length}
            </div>
            <p className="text-xs text-yellow-600">
              Badges earned
            </p>
            <div className="flex gap-1 mt-2">
              {recentAchievements.slice(0, 3).map((achievement) => (
                <span key={achievement.id} className="text-lg" title={achievement.achievement.name}>
                  {achievement.achievement.icon}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Leaderboard</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              Top 10%
            </div>
            <p className="text-xs text-purple-600">
              Your ranking
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full text-xs"
              onClick={() => router.push('/leaderboard')}
            >
              View Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Streak Section */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-orange-600" />
              Learning Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakCounter userId={user.id} />
          </CardContent>
        </Card>
      )}

      {/* Achievements In Progress */}
      {progressTowards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-600" />
              Achievements in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {progressTowards.map((progress) => (
                <AchievementBadge
                  key={progress.achievementId}
                  achievement={progress.achievement}
                  progress={progress}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((userAchievement) => (
                <div key={userAchievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{userAchievement.achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {userAchievement.achievement.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 