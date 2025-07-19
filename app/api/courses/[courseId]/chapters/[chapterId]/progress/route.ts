import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { awardXP } from '@/lib/services/gamification.service'

type Progress = Promise<{
  courseId: string
  chapterId: string
}>

export async function PUT(req: NextRequest, { params }: { params: Progress }) {
  try {
    const { chapterId, courseId } = await params
    const { userId } = await auth()
    const { isCompleted } = await req.json()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get existing progress to check if this is a new completion
    const existingProgress = await db.userProgress.findUnique({
      where: { userId_chapterId: { userId, chapterId } },
    })

    const userProgress = await db.userProgress.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      update: { isCompleted },
      create: { userId, chapterId, isCompleted },
    })

    // Award XP if chapter is being completed for the first time
    if (isCompleted && (!existingProgress || !existingProgress.isCompleted)) {
      try {
        // Get chapter data to determine XP reward
        const chapter = await db.chapter.findUnique({
          where: { id: chapterId },
          select: { xpReward: true, title: true }
        })

        if (chapter) {
          await awardXP(
            userId, 
            chapter.xpReward, 
            `Completed chapter: ${chapter.title}`, 
            'chapter', 
            chapterId
          )
        }
      } catch (error) {
        console.error('[XP_AWARD_ERROR]', error)
        // Don't fail the progress update if XP awarding fails
      }
    }

    return NextResponse.json(userProgress)
  } catch (error) {
    console.error('[PROGRESS_UPDATE_ERROR]', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
