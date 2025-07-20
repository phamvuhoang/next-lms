'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalXP: number;
  level: number;
  userId: string;
}

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`/api/xp/leaderboard?timeframe=${timeframe}`);
        setLeaderboard(data.leaderboard);
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe]);

  return (
    <Tabs defaultValue="all-time" onValueChange={(value: string) => setTimeframe(value as 'weekly' | 'monthly' | 'all-time')}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="all-time">All-Time</TabsTrigger>
      </TabsList>
      <TabsContent value={timeframe}>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.rank}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.totalXP}</TableCell>
                  <TableCell>{user.level}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TabsContent>
    </Tabs>
  );
};
