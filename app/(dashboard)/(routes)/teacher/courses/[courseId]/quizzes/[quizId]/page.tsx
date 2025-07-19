import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Brain } from 'lucide-react'

import { db } from '@/lib/db'
import { IconBadge } from '@/components/icon-badge'
import { Banner } from '@/components/banner'
import { QuizQuestionBuilder } from './_components/quiz-question-builder'

interface QuizIdPageProps {
  params: Promise<{
    courseId: string
    quizId: string
  }>
}

const QuizIdPage = async ({ params }: QuizIdPageProps) => {
  const resolvedParams = await params
  const { userId } = await auth()

  if (!userId) {
    return redirect('/')
  }

  const quiz = await db.quiz.findUnique({
    where: {
      id: resolvedParams.quizId,
      OR: [
        { courseId: resolvedParams.courseId },
        {
          chapter: {
            courseId: resolvedParams.courseId
          }
        }
      ]
    },
    include: {
      questions: {
        orderBy: {
          order: 'asc',
        },
      },
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
  })

  if (!quiz) {
    return redirect('/')
  }

  // Verify ownership - check both course and chapter ownership
  const courseOwnerId = quiz.course?.createdById || quiz.chapter?.course.createdById
  if (!courseOwnerId || courseOwnerId !== userId) {
    return redirect('/')
  }

  const requiredFields = [quiz.title, quiz.questions.length > 0]
  const totalFields = requiredFields.length
  const completedFields = requiredFields.filter(Boolean).length
  const completionText = `(${completedFields}/${totalFields})`
  const isComplete = requiredFields.every(Boolean)

  // Transform questions to match the QuestionBuilder interface
  const transformedQuestions = quiz.questions.map(q => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: q.options as string[] | undefined,
    correctAnswer: q.correctAnswer as string | string[],
    explanation: q.explanation,
    points: q.points,
    order: q.order
  }))

  return (
    <>
      {!quiz.isPublished && <Banner label="This quiz is unpublished. It will not be visible to students." />}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Quiz Setup</h1>
            <span className="text-sm text-slate-700">Complete all fields {completionText}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Brain} />
              <h2 className="text-xl">Quiz Questions</h2>
            </div>
            <QuizQuestionBuilder
              quizId={quiz.id}
              initialQuestions={transformedQuestions}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default QuizIdPage 