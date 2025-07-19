import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkAndAwardAchievements } from "@/lib/services/gamification.service";

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId, eventType, eventData } = await req.json();

    if (!userId || !eventType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Users can only check achievements for themselves
    if (clerkUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const newAchievements = await checkAndAwardAchievements(userId, eventType, eventData);

    return NextResponse.json({ 
      newAchievements,
      count: newAchievements.length 
    });
  } catch (error) {
    console.error("[ACHIEVEMENT_CHECK_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
