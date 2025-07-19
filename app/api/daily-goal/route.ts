'use server'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getOrCreateDailyGoal } from '@/lib/services/daily-goal.service'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const dailyGoal = await getOrCreateDailyGoal(userId)

    return NextResponse.json(dailyGoal)
  } catch (error) {
    console.error('[DAILY_GOAL_GET_ERROR]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
