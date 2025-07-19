'use client'

import * as z from 'zod'
import axios from 'axios'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Loader2, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { Course, Chapter, Quiz } from '@prisma/client'
import { cn } from '@/lib/utils'

interface QuizFormProps {
  initialData: (Course | Chapter) & {
    quizzes: (Quiz & {
      _count?: {
        questions: number;
      };
    })[];
  }
  courseId: string
  chapterId?: string
}

const formSchema = z.object({
  title: z.string().min(1),
})

export const QuizForm = ({ initialData, courseId, chapterId }: QuizFormProps) => {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const router = useRouter()

  const onCreateQuiz = async () => {
    try {
      setIsCreating(true)
      const response = await axios.post(`/api/quizzes`, {
        title: 'New Quiz',
        courseId: chapterId ? undefined : courseId,
        chapterId: chapterId,
      })

      router.push(`/teacher/courses/${courseId}/quizzes/${response.data.id}`)
      toast.success('Quiz created')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  const onPublish = async (quizId: string) => {
    try {
      setIsUpdating(true)
      await axios.patch(`/api/quizzes/${quizId}`, {
        isPublished: true,
      })
      toast.success('Quiz published')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsUpdating(false)
    }
  }

  const onUnpublish = async (quizId: string) => {
    try {
      setIsUpdating(true)
      await axios.patch(`/api/quizzes/${quizId}`, {
        isPublished: false,
      })
      toast.success('Quiz unpublished')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        {chapterId ? 'Chapter Quizzes' : 'Course Quizzes'}
        <Button onClick={onCreateQuiz} variant="ghost" disabled={isCreating}>
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4 mr-2" />
          )}
          Add Quiz
        </Button>
      </div>
      <div className={cn('text-sm mt-2', !initialData.quizzes.length && 'text-slate-500 italic')}>
        {!initialData.quizzes.length && 'No quizzes'}
        {initialData.quizzes.map((quiz) => (
          <div key={quiz.id} className="flex items-center gap-x-2 bg-slate-200 border rounded-md mb-4 p-3">
            <Brain className="h-4 w-4" />
            <div className="flex-1">
              <div className="text-base font-medium">{quiz.title}</div>
              <div className="text-xs text-muted-foreground">
                {quiz.isPublished ? 'Published' : 'Draft'} • {quiz._count?.questions || 0} questions
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <Button
                onClick={() => router.push(`/teacher/courses/${courseId}/quizzes/${quiz.id}`)}
                variant="ghost"
                className="h-8"
              >
                Edit
              </Button>
              <Button
                onClick={() => (quiz.isPublished ? onUnpublish(quiz.id) : onPublish(quiz.id))}
                variant={quiz.isPublished ? 'outline' : 'secondary'}
                className="h-8"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : quiz.isPublished ? (
                  'Unpublish'
                ) : (
                  'Publish'
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 