'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { QuizPlayer } from '@/components/assessments/QuizPlayer'
import { toast } from 'react-hot-toast'

interface QuizPageProps {
  params: Promise<{
    courseId: string
    chapterId: string
    quizId: string
  }>
}

const QuizPage = ({ params }: QuizPageProps) => {
  const [quiz, setQuiz] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [attemptsRemaining, setAttemptsRemaining] = useState(0)
  const router = useRouter()
  const { userId } = useAuth()

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const resolvedParams = await params

        if (!userId) {
          router.push('/')
          return
        }

        // Fetch quiz data
        const response = await fetch(`/api/quizzes/${resolvedParams.quizId}`)
        if (!response.ok) {
          throw new Error('Failed to load quiz')
        }

        const quizData = await response.json()
        setQuiz(quizData)
        setAttemptsRemaining(quizData.attemptsRemaining)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading quiz:', error)
        toast.error('Failed to load quiz')
        router.back()
      }
    }

    loadQuiz()
  }, [params, router, userId])

  const handleSubmit = async (answers: any[]) => {
    try {
      const resolvedParams = await params

      if (!userId) {
        toast.error('You must be logged in to submit a quiz')
        return
      }

      const response = await fetch(`/api/quizzes/${resolvedParams.quizId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const result = await response.json()
      toast.success(`Quiz completed! Score: ${result.score}%`)
      
      // Redirect back to chapter page
      router.push(`/courses/${resolvedParams.courseId}/chapters/${resolvedParams.chapterId}`)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="text-center">Loading quiz...</div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="text-center">Quiz not found</div>
      </div>
    )
  }

  if (attemptsRemaining === 0) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="text-center">No attempts remaining for this quiz</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-muted-foreground mt-2">{quiz.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>{quiz.questions?.length || 0} questions</span>
          {quiz.timeLimit && <span>{quiz.timeLimit} minutes</span>}
          <span>{attemptsRemaining} attempts remaining</span>
        </div>
      </div>

      <QuizPlayer
        quizId={quiz.id}
        questions={quiz.questions || []}
        onSubmit={handleSubmit}
        isLoading={false}
      />
    </div>
  )
}

export default QuizPage 