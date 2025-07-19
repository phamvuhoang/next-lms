import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getLeaderboard } from "@/lib/services/gamification.service";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") as 'weekly' | 'monthly' | 'all-time' || "all-time";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Validate parameters
    if (limit > 100) {
      return new NextResponse("Limit cannot exceed 100", { status: 400 });
    }

    if (!['weekly', 'monthly', 'all-time'].includes(timeframe)) {
      return new NextResponse("Invalid timeframe", { status: 400 });
    }

    const result = await getLeaderboard(timeframe, limit, offset);

    // Find user's rank in the leaderboard
    const userRankData = result.leaderboard.find(entry => entry.userId === userId);
    const userRank = userRankData?.rank || null;

    return NextResponse.json({
      ...result,
      userRank,
      hasMore: result.totalUsers > offset + limit
    });
  } catch (error) {
    console.error("[LEADERBOARD_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
