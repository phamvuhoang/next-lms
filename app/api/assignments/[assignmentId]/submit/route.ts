import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { userId } = await auth();
    const { assignmentId } = await params;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content, fileUrls } = await req.json();

    // Validate assignment exists and is published
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return new NextResponse("Assignment not found", { status: 404 });
    }

    if (!assignment.isPublished) {
      return new NextResponse("Assignment is not published", { status: 403 });
    }

    // Check if assignment is past due date (if late submissions not allowed)
    if (assignment.dueDate && !assignment.allowLateSubmission) {
      const now = new Date();
      if (now > assignment.dueDate) {
        return new NextResponse("Assignment is past due date", { status: 400 });
      }
    }

    // Check if user has already submitted
    const existingSubmission = await db.assignmentSubmission.findUnique({
      where: { userId_assignmentId: { userId, assignmentId } },
    });

    if (existingSubmission) {
      // Update existing submission
      const updatedSubmission = await db.assignmentSubmission.update({
        where: { userId_assignmentId: { userId, assignmentId } },
        data: {
          content,
          fileUrls: fileUrls || [],
          submittedAt: new Date(), // Update submission time
          // Reset grading if previously graded
          score: null,
          feedback: null,
          gradedAt: null,
        },
      });

      return NextResponse.json({
        submissionId: updatedSubmission.id,
        submittedAt: updatedSubmission.submittedAt,
        status: "resubmitted",
        message: "Assignment resubmitted successfully!",
      });
    } else {
      // Create new submission
      const submission = await db.assignmentSubmission.create({
        data: {
          assignmentId,
          userId,
          content,
          fileUrls: fileUrls || [],
        },
      });

      return NextResponse.json({
        submissionId: submission.id,
        submittedAt: submission.submittedAt,
        status: "submitted",
        message: "Assignment submitted successfully!",
      });
    }
  } catch (error) {
    console.error("[ASSIGNMENT_SUBMIT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
