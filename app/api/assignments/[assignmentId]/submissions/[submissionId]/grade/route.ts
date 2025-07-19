import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isTeacher } from "@/lib/teacher";
import { db } from "@/lib/db";
import { awardXP } from "@/lib/services/gamification.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string; submissionId: string }> }
) {
  try {
    const { userId } = await auth();
    const { assignmentId, submissionId } = await params;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only teachers can grade assignments
    if (!isTeacher(userId)) {
      return new NextResponse("Forbidden - Teachers only", { status: 403 });
    }

    const { score, feedback } = await req.json();

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return new NextResponse("Invalid score - must be between 0 and 100", { status: 400 });
    }

    // Get the submission with assignment details
    const submission = await db.assignmentSubmission.findUnique({
      where: {
        id: submissionId,
        assignmentId: assignmentId,
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            xpReward: true,
            maxPoints: true,
          }
        }
      }
    });

    if (!submission) {
      return new NextResponse("Submission not found", { status: 404 });
    }

    const updatedSubmission = await db.assignmentSubmission.update({
      where: {
        id: submissionId,
        assignmentId: assignmentId,
      },
      data: {
        score,
        feedback,
        gradedAt: new Date(),
      },
    });

    // Award XP if this is the first time the assignment is being graded
    // and the student achieved a passing score (>= 60%)
    if (!submission.gradedAt && score >= 60) {
      try {
        // Calculate XP based on score (full XP for 100%, proportional for lower scores)
        const xpToAward = Math.floor((score / 100) * submission.assignment.xpReward);
        
        if (xpToAward > 0) {
          await awardXP(
            submission.userId,
            xpToAward,
            `Completed assignment: ${submission.assignment.title}`,
            'assignment',
            assignmentId
          );
        }
      } catch (error) {
        console.error('[XP_AWARD_ERROR]', error);
        // Don't fail the grading if XP awarding fails
      }
    }

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error("[ASSIGNMENT_GRADE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
