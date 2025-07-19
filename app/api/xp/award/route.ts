import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { awardXP } from "@/lib/services/gamification.service";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    
    // This endpoint is for internal use only, so we need to verify the request
    // In a production environment, you'd want to add additional security measures
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId, amount, reason, sourceType, sourceId } = await req.json();

    if (!userId || !amount || !reason || !sourceType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const result = await awardXP(userId, amount, reason, sourceType, sourceId);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("[XP_AWARD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
