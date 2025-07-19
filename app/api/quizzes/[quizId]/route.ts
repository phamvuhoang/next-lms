import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { userId } = await auth();
    const { quizId } = await params;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { 
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            question: true,
            options: true,
            points: true,
            order: true,
            explanation: true,
            // Don't include correctAnswer in the response for security
          }
        }
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // Get user's attempts for this quiz
    const userAttempts = await db.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        score: true,
        completedAt: true,
      }
    });

    return NextResponse.json({
      ...quiz,
      userAttempts,
      attemptsRemaining: Math.max(0, quiz.maxAttempts - userAttempts.length)
    });
  } catch (error) {
    console.error("[QUIZ_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { userId } = await auth();
    const { quizId } = await params;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();

    // Verify quiz ownership - check both course and chapter ownership
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: {
          select: {
            createdById: true,
          },
        },
        chapter: {
          select: {
            course: {
              select: {
                createdById: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    const courseOwnerId = quiz.course?.createdById || quiz.chapter?.course.createdById;
    if (!courseOwnerId || courseOwnerId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedQuiz = await db.quiz.update({
      where: { id: quizId },
      data: {
        ...values,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("[QUIZ_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
