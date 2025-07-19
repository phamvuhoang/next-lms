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
    const published = searchParams.get("published");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Validate parameters
    if (limit > 100) {
      return new NextResponse("Limit cannot exceed 100", { status: 400 });
    }

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (chapterId) where.chapterId = chapterId;
    if (published) where.isPublished = published === "true";

    const quizzes = await db.quiz.findMany({
      where,
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await db.quiz.count({ where });

    return NextResponse.json({ 
      quizzes: quizzes.map(quiz => ({
        ...quiz,
        questionCount: quiz._count.questions
      })),
      total, 
      hasMore: total > offset + limit 
    });
  } catch (error) {
    console.error("[QUIZZES_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only teachers can create quizzes
    if (!isTeacher(userId)) {
      return new NextResponse("Forbidden - Teachers only", { status: 403 });
    }

    const values = await req.json();

    // Basic validation
    if (!values.title || typeof values.title !== 'string') {
      return new NextResponse("Title is required", { status: 400 });
    }

    if (values.timeLimit && (typeof values.timeLimit !== 'number' || values.timeLimit <= 0)) {
      return new NextResponse("Invalid time limit", { status: 400 });
    }

    if (values.maxAttempts && (typeof values.maxAttempts !== 'number' || values.maxAttempts <= 0)) {
      return new NextResponse("Invalid max attempts", { status: 400 });
    }

    if (values.passingScore && (typeof values.passingScore !== 'number' || values.passingScore < 0 || values.passingScore > 100)) {
      return new NextResponse("Invalid passing score", { status: 400 });
    }

    const quiz = await db.quiz.create({ 
      data: {
        ...values,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("[QUIZZES_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
