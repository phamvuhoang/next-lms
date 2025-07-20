'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  freezesUsed: number;
  freezesAvailable: number;
}

interface ActivityData {
  date: string;
  totalXP: number;
  activities: Array<{
    amount: number;
    reason: string;
    sourceType: string;
    time: string;
  }>;
}

interface StreakCounterProps {
  userId: string;
}

export const StreakCounter = ({ userId }: StreakCounterProps) => {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [isApplyingFreeze, setIsApplyingFreeze] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchStreakData = useCallback(async () => {
    try {
      const [streakResponse, activityResponse] = await Promise.all([
        axios.get(`/api/streaks/${userId}`),
        axios.get(`/api/streaks/${userId}/activity`)
      ]);
      
      setStreakData(streakResponse.data);
      setActivityData(activityResponse.data.activityData || []);
    } catch (error) {
      // Silently handle error and fallback to generated names
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  const applyStreakFreeze = async () => {
    if (!streakData || streakData.freezesAvailable <= 0) return;
    
    setIsApplyingFreeze(true);
    try {
      const { data } = await axios.post(`/api/streaks/${userId}/freeze`);
      setStreakData(prev => prev ? {
        ...prev,
        freezesAvailable: data.freezesRemaining,
        freezesUsed: prev.freezesUsed + 1
      } : null);
      setShowFreezeModal(false);
    } catch (error) {
      // Silently handle error
    } finally {
      setIsApplyingFreeze(false);
    }
  };

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29); // Show last 30 days

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const isActivityDay = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return activityData.some(day => day.date === dateString);
  };

  const getActivityXP = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayData = activityData.find(day => day.date === dateString);
    return dayData?.totalXP || 0;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center p-4 bg-orange-100 rounded-lg">
        <div className="mr-4 text-4xl">🔥</div>
        <div>
          <h4 className="text-2xl font-bold">Loading...</h4>
        </div>
      </div>
    );
  }

  if (!streakData) {
    return (
      <div className="flex items-center p-4 bg-orange-100 rounded-lg">
        <div className="mr-4 text-4xl">🔥</div>
        <div>
          <h4 className="text-2xl font-bold">0 Day Streak</h4>
          <p className="text-sm text-gray-600">Start learning to build your streak!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Streak Display */}
      <div className="flex items-center justify-between p-4 bg-orange-100 rounded-lg">
        <div className="flex items-center">
          <div className="mr-4 text-4xl">🔥</div>
          <div>
            <h4 className="text-2xl font-bold">{streakData.currentStreak} Day Streak</h4>
            <p className="text-sm text-gray-600">
              Longest: {streakData.longestStreak} days
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Freeze Badge */}
          <Badge variant="secondary" className="flex items-center gap-1">
            <Snowflake className="h-3 w-3" />
            {streakData.freezesAvailable}
          </Badge>
          
          {/* Calendar Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Calendar
          </Button>
          
          {/* Freeze Button */}
          {streakData.freezesAvailable > 0 && (
            <Dialog open={showFreezeModal} onOpenChange={setShowFreezeModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Snowflake className="h-4 w-4 mr-1" />
                  Use Freeze
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Use Streak Freeze</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    Using a streak freeze will protect your current {streakData.currentStreak}-day streak 
                    if you miss a day of learning.
                  </p>
                  <p className="text-sm text-gray-600">
                    You have {streakData.freezesAvailable} freeze(s) remaining.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowFreezeModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={applyStreakFreeze}
                      disabled={isApplyingFreeze}
                    >
                      {isApplyingFreeze ? 'Applying...' : 'Use Freeze'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {showCalendar && (
        <div className="p-4 bg-white border rounded-lg">
          <h5 className="font-semibold mb-3">Activity Calendar (Last 30 Days)</h5>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 p-1">
                {day}
              </div>
            ))}
                         {generateCalendarDays().map((date, index) => {
               const xp = getActivityXP(date);
               return (
                 <div
                   key={index}
                   className={`
                     aspect-square p-1 text-xs flex flex-col items-center justify-center rounded relative
                     ${isToday(date) 
                       ? 'bg-blue-500 text-white font-bold' 
                       : isActivityDay(date)
                       ? 'bg-orange-500 text-white'
                       : 'bg-gray-100 text-gray-400'
                     }
                   `}
                   title={isActivityDay(date) ? `${xp} XP earned on ${date.toLocaleDateString()}` : ''}
                 >
                   <span>{date.getDate()}</span>
                   {isActivityDay(date) && xp > 0 && (
                     <span className="text-[10px] opacity-75">{xp}</span>
                   )}
                 </div>
               );
             })}
          </div>
                      <div className="flex items-center justify-center space-x-4 mt-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span>Activity</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span>Today</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-100 rounded" />
              <span>No Activity</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
