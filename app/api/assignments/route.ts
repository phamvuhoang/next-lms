import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isTeacher } from "@/lib/teacher";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");
    const status = searchParams.get("status");

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (chapterId) where.chapterId = chapterId;

    const assignments = await db.assignment.findMany({
      where,
      include: {
        _count: {
          select: { submissions: true }
        },
        submissions: {
          where: { userId },
          select: {
            id: true,
            score: true,
            submittedAt: true,
            gradedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add status information for each assignment
    const assignmentsWithStatus = assignments.map(assignment => {
      const userSubmission = assignment.submissions[0];
      let assignmentStatus = 'not_started';
      
      if (userSubmission) {
        if (userSubmission.gradedAt) {
          assignmentStatus = 'graded';
        } else {
          assignmentStatus = 'submitted';
        }
      } else if (assignment.dueDate && new Date() > assignment.dueDate) {
        assignmentStatus = 'overdue';
      } else {
        assignmentStatus = 'available';
      }

      return {
        ...assignment,
        submissionCount: assignment._count.submissions,
        userSubmission,
        status: assignmentStatus
      };
    });

    // Filter by status if requested
    const filteredAssignments = status 
      ? assignmentsWithStatus.filter(a => a.status === status)
      : assignmentsWithStatus;

    return NextResponse.json({ 
      assignments: filteredAssignments
    });
  } catch (error) {
    console.error("[ASSIGNMENTS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only teachers can create assignments
    if (!isTeacher(userId)) {
      return new NextResponse("Forbidden - Teachers only", { status: 403 });
    }

    const values = await req.json();

    // Basic validation
    if (!values.title || typeof values.title !== 'string') {
      return new NextResponse("Title is required", { status: 400 });
    }

    if (!values.description || typeof values.description !== 'string') {
      return new NextResponse("Description is required", { status: 400 });
    }

    if (values.maxPoints && (typeof values.maxPoints !== 'number' || values.maxPoints <= 0)) {
      return new NextResponse("Invalid max points", { status: 400 });
    }

    if (values.dueDate && isNaN(new Date(values.dueDate).getTime())) {
      return new NextResponse("Invalid due date", { status: 400 });
    }

    const assignment = await db.assignment.create({ 
      data: {
        ...values,
        dueDate: values.dueDate ? new Date(values.dueDate) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENTS_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
