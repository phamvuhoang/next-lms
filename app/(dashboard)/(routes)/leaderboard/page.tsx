import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default async function LeaderboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/');
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">
            Compete with other learners and track your progress
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            XP Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Leaderboard />
        </CardContent>
      </Card>
    </div>
  );
} 