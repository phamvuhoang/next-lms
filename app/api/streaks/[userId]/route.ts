import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserStreak } from "@/lib/services/gamification.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { userId } = await params;
    
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Users can only access their own streak data
    if (clerkUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const userStreak = await getUserStreak(userId);

    if (!userStreak) {
      // Return default values for new users
      return NextResponse.json({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        freezesUsed: 0,
        freezesAvailable: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json(userStreak);
  } catch (error) {
    // Log error for debugging but don't expose details to client
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
