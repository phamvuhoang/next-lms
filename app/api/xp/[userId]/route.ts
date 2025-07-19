import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserXP } from "@/lib/services/gamification.service";

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

    // Users can only access their own XP data
    if (clerkUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const userXp = await getUserXP(userId);

    if (!userXp) {
      // Return default values for new users
      return NextResponse.json({
        userId,
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        xpToNextLevel: 100,
        xpTransactions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json(userXp);
  } catch (error) {
    console.error("[USER_XP_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
