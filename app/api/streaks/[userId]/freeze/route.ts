import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { applyStreakFreeze } from "@/lib/services/gamification.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    const { userId } = await params;
    
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Users can only use streak freeze for themselves
    if (clerkUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedStreak = await applyStreakFreeze(userId);

    return NextResponse.json({
      success: true,
      freezesRemaining: updatedStreak.freezesAvailable,
      message: "Streak freeze applied successfully!",
    });
  } catch (error) {
    console.error("[STREAK_FREEZE_ERROR]", error);
    
    if (error instanceof Error && error.message === 'No streak freezes available') {
      return new NextResponse("No streak freezes available", { status: 400 });
    }
    
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
