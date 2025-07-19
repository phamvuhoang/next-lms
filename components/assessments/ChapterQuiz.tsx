'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, CheckCircle, Clock, Trophy } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Quiz {
  id: string
  title: string
  description?: string | null
  timeLimit?: number | null
  maxAttempts: number
  xpReward: number
  _count: {
    questions: number
  }
}

interface ChapterQuizProps {
  quiz: Quiz
  chapterId: string
  courseId: string
  userId: string
}

export const ChapterQuiz = ({ quiz, chapterId, courseId, userId }: ChapterQuizProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const startQuiz = async () => {
    try {
      setIsLoading(true)
      // Navigate to the quiz taking page
      router.push(`/courses/${courseId}/chapters/${chapterId}/quiz/${quiz.id}`)
    } catch (error) {
      toast.error('Failed to start quiz')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <CardTitle>{quiz.title}</CardTitle>
        </div>
        {quiz.description && (
          <CardDescription>{quiz.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {quiz._count.questions} questions
            </div>
            {quiz.timeLimit && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {quiz.timeLimit} min
              </div>
            )}
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {quiz.xpReward} XP
            </div>
          </div>
        </div>
        <Button 
          onClick={startQuiz} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Starting...' : 'Start Quiz'}
        </Button>
      </CardContent>
    </Card>
  )
} 