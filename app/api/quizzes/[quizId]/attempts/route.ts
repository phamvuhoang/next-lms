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

    const attempts = await db.quizAttempt.findMany({
      where: {
        quizId,
        userId,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // Get quiz details for additional context
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      select: { maxAttempts: true, passingScore: true }
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // Calculate statistics
    const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
    const averageScore = attempts.length > 0 
      ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length 
      : 0;
    const attemptsRemaining = quiz.maxAttempts - attempts.length;
    const hasPassedQuiz = attempts.some(a => a.score >= quiz.passingScore);

    return NextResponse.json({ 
      attempts,
      bestScore,
      averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
      attemptsRemaining: Math.max(0, attemptsRemaining),
      hasPassedQuiz
    });
  } catch (error) {
    console.error("[QUIZ_ATTEMPTS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}