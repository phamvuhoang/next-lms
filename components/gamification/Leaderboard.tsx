'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LeaderboardProps {
  leaderboard: {
    rank: number;
    username: string;
    xp: number;
    level: number;
  }[];
}

export const Leaderboard = ({ leaderboard }: LeaderboardProps) => {
  return (
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
          <TableRow key={user.rank}>
            <TableCell>{user.rank}</TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.xp}</TableCell>
            <TableCell>{user.level}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
