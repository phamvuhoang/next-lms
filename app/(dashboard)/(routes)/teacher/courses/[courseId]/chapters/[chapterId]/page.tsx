import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Brain } from 'lucide-react'

import { db } from '@/lib/db'
import { IconBadge } from '@/components/icon-badge'
import { Banner } from '@/components/banner'
import { ChapterTitleForm } from './_components/chapter-title-form'
import { ChapterDescriptionForm } from './_components/chapter-description-form'
import { ChapterAccessForm } from './_components/chapter-access-form'
import { ChapterVideoForm } from './_components/chapter-video-form'
import { ChapterActions } from './_components/chapter-actions'
import { QuizForm } from '../../_components/quiz-form'

interface ChapterIdPageProps {
  params: Promise<{
    courseId: string
    chapterId: string
  }>
}

const ChapterIdPage = async ({ params }: ChapterIdPageProps) => {
  const resolvedParams = await params
  const { userId } = await auth()

  if (!userId) {
    return redirect('/')
  }

  const chapter = await db.chapter.findUnique({
    where: {
      id: resolvedParams.chapterId,
      courseId: resolvedParams.courseId,
    },
    include: {
      muxData: true,
      quizzes: {
        include: {
          _count: {
            select: { questions: true }
          }
        }
      }
    },
  })

  if (!chapter) {
    return redirect('/')
  }

  const requiredFields = [chapter.title, chapter.description, chapter.videoUrl]

  const totalFields = requiredFields.length
  const completedFields = requiredFields.filter(Boolean).length

  const completionText = `(${completedFields}/${totalFields})`

  const isComplete = requiredFields.every(Boolean)

  return (
    <>
      {!chapter.isPublished && (
        <Banner variant="warning" label="This chapter is unpublished. It will not be visible in the course" />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Chapter Creation</h1>
            <span className="text-sm text-slate-700">Complete all fields {completionText}</span>
          </div>
          <ChapterActions disabled={!isComplete} courseId={resolvedParams.courseId} chapterId={resolvedParams.chapterId} isPublished={chapter.isPublished} />
        </div>
        <div className="grid grid-cols-1 gap-6 mt-16">
          <div className="flex items-center gap-x-2">
            <IconBadge icon={Brain} />
            <h2 className="text-xl">Customize your chapter</h2>
          </div>
          <ChapterTitleForm initialData={chapter} courseId={resolvedParams.courseId} chapterId={resolvedParams.chapterId} />
          <ChapterDescriptionForm initialData={chapter} courseId={resolvedParams.courseId} chapterId={resolvedParams.chapterId} />
          <ChapterAccessForm initialData={chapter} courseId={resolvedParams.courseId} chapterId={resolvedParams.chapterId} />
          <ChapterVideoForm initialData={chapter} courseId={resolvedParams.courseId} chapterId={resolvedParams.chapterId} />
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Brain} />
              <h2 className="text-xl">Chapter quizzes</h2>
            </div>
            <QuizForm 
              initialData={chapter} 
              courseId={resolvedParams.courseId} 
              chapterId={resolvedParams.chapterId} 
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default ChapterIdPage
