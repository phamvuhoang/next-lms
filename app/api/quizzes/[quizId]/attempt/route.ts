import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { awardXP } from "@/lib/services/gamification.service";

interface Answer {
  questionId: string;
  answer: string | string[];
}

interface QuestionWithCorrectAnswer {
  id: string;
  type: string;
  correctAnswer: any;
  points: number;
  explanation?: string | null;
}

const gradeQuiz = (questions: QuestionWithCorrectAnswer[], answers: Answer[]) => {
  let totalScore = 0;
  let totalPoints = 0;
  const feedback: any[] = [];

  // Create a map for quick answer lookup
  const answerMap = new Map();
  answers.forEach(ans => answerMap.set(ans.questionId, ans.answer));

  questions.forEach(question => {
    totalPoints += question.points;
    const userAnswer = answerMap.get(question.id);
    let isCorrect = false;
    let points = 0;

    if (userAnswer !== undefined) {
      switch (question.type) {
        case 'multiple_choice':
        case 'true_false':
        case 'fill_blank':
          isCorrect = userAnswer === question.correctAnswer;
          points = isCorrect ? question.points : 0;
          break;
        
        case 'multiple_select':
          // For multiple select, compare arrays
          if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer)) {
            const userSet = new Set(userAnswer);
            const correctSet = new Set(question.correctAnswer);
            isCorrect = userSet.size === correctSet.size && 
                       Array.from(userSet).every(x => correctSet.has(x));
            points = isCorrect ? question.points : 0;
          }
          break;

        default:
          // For other question types, do basic string comparison
          isCorrect = String(userAnswer).toLowerCase().trim() === 
                     String(question.correctAnswer).toLowerCase().trim();
          points = isCorrect ? question.points : 0;
      }
    }

    totalScore += points;
    feedback.push({
      questionId: question.id,
      correct: isCorrect,
      points: points,
      maxPoints: question.points,
      explanation: question.explanation || null
    });
  });

  return {
    score: totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0,
    totalPoints,
    pointsEarned: totalScore,
    feedback
  };
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { userId } = await auth();
    const { quizId } = await params;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { answers, timeSpent } = await req.json();

    if (!answers || !Array.isArray(answers)) {
      return new NextResponse("Invalid answers format", { status: 400 });
    }

    // Get quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    if (!quiz.isPublished) {
      return new NextResponse("Quiz is not published", { status: 403 });
    }

    // Check if user has exceeded max attempts
    const existingAttempts = await db.quizAttempt.count({
      where: { userId, quizId }
    });

    if (existingAttempts >= quiz.maxAttempts) {
      return new NextResponse("Maximum attempts exceeded", { status: 400 });
    }

    // Grade the quiz
    const gradingResult = gradeQuiz(quiz.questions, answers);

    // Create quiz attempt record
    const attempt = await db.quizAttempt.create({
      data: {
        userId,
        quizId,
        answers: answers,
        score: gradingResult.score,
        totalPoints: gradingResult.totalPoints,
        timeSpent: timeSpent || null,
      },
    });

    // Award XP if quiz is passed
    const passed = gradingResult.score >= quiz.passingScore;
    let xpAwarded = 0;
    const newAchievements = [];

    if (passed) {
      try {
        // Base XP for completing quiz
        xpAwarded = quiz.xpReward;

        // Bonus XP for perfect score
        if (gradingResult.score === 100) {
          xpAwarded += Math.floor(quiz.xpReward * 0.5); // 50% bonus for perfect score
        }

        const xpResult = await awardXP(
          userId,
          xpAwarded,
          `Completed quiz: ${quiz.title}`,
          'quiz',
          quizId
        );

        // Check if level up occurred for additional celebration
        if (xpResult.levelUp) {
          newAchievements.push({
            type: 'level_up',
            newLevel: xpResult.level
          });
        }
      } catch (error) {
        console.error('[XP_AWARD_ERROR]', error);
        // Don't fail the quiz submission if XP awarding fails
      }
    }

    return NextResponse.json({
      attemptId: attempt.id,
      score: gradingResult.score,
      totalPoints: gradingResult.totalPoints,
      pointsEarned: gradingResult.pointsEarned,
      passed,
      xpAwarded,
      feedback: gradingResult.feedback,
      newAchievements,
      attemptsRemaining: quiz.maxAttempts - existingAttempts - 1
    });

  } catch (error) {
    console.error("[QUIZ_ATTEMPT_POST_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
