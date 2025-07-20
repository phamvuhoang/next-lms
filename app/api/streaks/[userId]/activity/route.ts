import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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

    // Users can only access their own activity data
    if (clerkUserId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get activity data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await db.xPTransaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        amount: true,
        reason: true,
        sourceType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group activities by date
    const activityByDate = new Map<string, {
      date: string;
      totalXP: number;
      activities: Array<{
        amount: number;
        reason: string;
        sourceType: string;
        time: string;
      }>;
    }>();

    activities.forEach(activity => {
      const date = activity.createdAt.toISOString().split('T')[0];
      const time = activity.createdAt.toTimeString().split(' ')[0];
      
      if (!activityByDate.has(date)) {
        activityByDate.set(date, {
          date,
          totalXP: 0,
          activities: [],
        });
      }
      
      const dayData = activityByDate.get(date)!;
      dayData.totalXP += activity.amount;
      dayData.activities.push({
        amount: activity.amount,
        reason: activity.reason,
        sourceType: activity.sourceType,
        time,
      });
    });

    // Convert to array and sort by date
    const activityData = Array.from(activityByDate.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      activityData,
      totalDays: activityData.length,
      totalXP: activityData.reduce((sum, day) => sum + day.totalXP, 0),
    });
  } catch (error) {
    // Log error for debugging but don't expose details to client
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 