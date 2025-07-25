'use server'

import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Banner } from '@/components/banner'
import { Preview } from '@/components/preview'
import { VideoPlayer } from './_components/video-player'
import { getChapter } from '@/actions/get-chapter'
import CourseEnrollButton from './_components/course-enroll-button'
import { Separator } from '@/components/ui/separator'
import { CourseProgressButton } from './_components/course-progress-button'
import { ChapterQuiz } from '@/components/assessments/ChapterQuiz'
import { Brain } from 'lucide-react'

type Params = Promise<{
  courseId: string
  chapterId: string
}>

type ChapterDetailsProps = {
  params: Params
}

export default async function ChapterDetails({ params }: ChapterDetailsProps) {
  const resolvedParams = await params
  const { userId } = await auth()
  if (!userId) {
    return redirect('/')
  }

  const { chapter, course, muxData, attachments, nextChapter, userProgress, purchase } = await getChapter({
    userId,
    ...resolvedParams,
  })

  if (!chapter || !course) {
    return redirect('/')
  }

  const isLocked = !chapter.isFree && !purchase
  const completedOnEnd = !!purchase && !userProgress?.isCompleted
  const isCompleted = !!userProgress?.isCompleted

  return (
    <div>
      {userProgress?.isCompleted ? <Banner label="You already completed this chapter" variant="success" /> : null}
      {isLocked ? <Banner label="You need to purchase this course to watch this chapter" /> : null}

      <div className="mx-auto flex max-w-4xl flex-col pb-20">
        <div className="p-4">
          <VideoPlayer
            chapterId={chapter.id}
            title={chapter.title}
            courseId={resolvedParams.courseId}
            nextChapterId={nextChapter?.id}
            quizId={chapter.quizzes[0]?.id}
            playbackId={muxData?.playbackId ?? ''}
            isLocked={isLocked}
            completeOnEnd={completedOnEnd}
          />
        </div>

        <div>
          <div className="flex flex-col items-center justify-between p-4 md:flex-row">
            <h2 className="mb-2 text-2xl font-semibold">{chapter.title}</h2>
            {purchase ? (
              <CourseProgressButton
                chapterId={resolvedParams.chapterId}
                courseId={resolvedParams.courseId}
                nextChapterId={nextChapter?.id}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={resolvedParams.courseId}
                price={course.price!}
                isFree={course.isFree}
              />
            )}
          </div>

          <Separator />

          <div>
            <Preview value={chapter.description!} />
          </div>

          {attachments.length ? (
            <>
              <Separator />
              <div className="p-4">
                {attachments.map((attachment) => (
                  <a
                    className="flex w-full items-center rounded-md border bg-sky-200 p-3 text-sky-700 hover:underline"
                    key={attachment.id}
                    target="_blank"
                    href={attachment.url}
                    rel="noreferrer"
                  >
                    {attachment.name}
                  </a>
                ))}
              </div>
            </>
          ) : null}

          {/* Quiz Section - Only show if chapter is completed and user has access */}
          {isCompleted && purchase && chapter.quizzes && chapter.quizzes.length > 0 && (
            <>
              <Separator />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold">Chapter Quiz</h3>
                </div>
                <div className="space-y-4">
                  {chapter.quizzes.map((quiz) => (
                    <ChapterQuiz
                      key={quiz.id}
                      quiz={quiz}
                      chapterId={resolvedParams.chapterId}
                      courseId={resolvedParams.courseId}
                      userId={userId}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
