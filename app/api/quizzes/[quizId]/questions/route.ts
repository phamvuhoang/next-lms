import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

interface Question {
  id?: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string | null;
  points: number;
  order: number;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { userId } = await auth();
    const { quizId } = await params;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if request has content
    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return new NextResponse("Content-Type must be application/json", { status: 400 });
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("[JSON_PARSE_ERROR]", error);
      return new NextResponse("Invalid JSON in request body", { status: 400 });
    }

    const { questions } = body;

    if (!questions || !Array.isArray(questions)) {
      return new NextResponse("Invalid questions format - must be an array", { status: 400 });
    }

    // Validate each question
    for (const question of questions) {
      if (!question.question || !question.type || typeof question.points !== 'number') {
        return new NextResponse("Invalid question format - missing required fields", { status: 400 });
      }
    }

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

    // Start a transaction to update questions
    await db.$transaction(async (tx) => {
      // Delete existing questions
      await tx.question.deleteMany({
        where: { quizId },
      });

      // Create new questions
      const questionsToCreate = questions.map((q: Question) => ({
        quizId,
        question: q.question,
        type: q.type as any, // Cast to any to avoid enum type conflicts
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
        order: q.order,
      }));

      await tx.question.createMany({
        data: questionsToCreate,
      });
    });

    return NextResponse.json({
      message: "Questions updated successfully",
    });
  } catch (error) {
    console.error("[QUESTIONS_UPDATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 