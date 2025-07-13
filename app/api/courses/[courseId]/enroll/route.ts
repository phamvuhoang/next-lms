import { currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const resolvedParams = await params
    const user = await currentUser()
    
    if (!user || !user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const course = await db.course.findUnique({ 
      where: { 
        id: resolvedParams.courseId, 
        isPublished: true,
        isFree: true // Only allow enrollment for free courses
      } 
    })
    
    if (!course) {
      return new NextResponse('Course not found or not available for free enrollment', { status: 404 })
    }

    // Check if user is already enrolled
    const existingPurchase = await db.purchase.findUnique({
      where: { 
        userId_courseId: { 
          userId: user.id, 
          courseId: resolvedParams.courseId 
        } 
      },
    })

    if (existingPurchase) {
      return new NextResponse('Already enrolled', { status: 400 })
    }

    // Create free enrollment (purchase record with no payment)
    const enrollment = await db.purchase.create({
      data: {
        userId: user.id,
        courseId: resolvedParams.courseId,
      },
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.log('[COURSE_ENROLL]', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
