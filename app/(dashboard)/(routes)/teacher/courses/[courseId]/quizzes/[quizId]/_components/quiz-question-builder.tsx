'use client'

import { useCallback, useEffect, useState } from 'react'
import { QuestionBuilder } from '@/components/assessments/QuestionBuilder'

// Use the same enum as QuestionBuilder
enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  FILL_IN_THE_BLANK = "FILL_IN_THE_BLANK",
}

interface Question {
  id?: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  order: number;
}

interface QuizQuestion extends Question {
  explanation?: string | null;
}

interface QuizQuestionBuilderProps {
  quizId: string
  initialQuestions: QuizQuestion[]
}

export const QuizQuestionBuilder = ({ quizId, initialQuestions }: QuizQuestionBuilderProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions)
  const [isSaving, setIsSaving] = useState(false)

  // Debounced save function
  const debouncedSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (questionsToSave: QuizQuestion[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          // Only save if there are valid questions
          const validQuestions = questionsToSave.filter(q => 
            q.question.trim() && q.type && q.points > 0
          )
          
          if (validQuestions.length === 0) return

          setIsSaving(true)
          try {
            await fetch(`/api/quizzes/${quizId}/questions`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ questions: validQuestions }),
            })
          } catch (error) {
            console.error('Failed to update questions:', error)
          } finally {
            setIsSaving(false)
          }
        }, 1000) // 1 second debounce
      }
    })(),
    [quizId]
  )

  const handleQuestionsChange = (newQuestions: QuizQuestion[]) => {
    setQuestions(newQuestions)
    debouncedSave(newQuestions)
  }

  return (
    <QuestionBuilder
      initialQuestions={questions}
      onQuestionsChange={handleQuestionsChange}
      isLoading={isSaving}
    />
  )
} 