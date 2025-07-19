'use server'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courseId = params.courseId

    // 1. Check if certificate already exists
    const existingCertificate = await db.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (existingCertificate) {
      return NextResponse.json(existingCertificate)
    }

    // 2. Verify course completion
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { chapters: true },
    })

    if (!course) {
      return new NextResponse('Course not found', { status: 404 })
    }

    const publishedChapterIds = course.chapters.filter((c) => c.isPublished).map((c) => c.id)

    const completedChapters = await db.userProgress.count({
      where: {
        userId,
        chapterId: {
          in: publishedChapterIds,
        },
        isCompleted: true,
      },
    })

    if (completedChapters < publishedChapterIds.length) {
      return new NextResponse('Course not yet completed', { status: 400 })
    }

    // 3. Create the certificate
    const verificationCode = uuidv4()
    const certificateUrl = `/certs/${verificationCode}` // Example URL

    const newCertificate = await db.certificate.create({
      data: {
        userId,
        courseId,
        verificationCode,
        certificateUrl,
      },
    })

    return NextResponse.json(newCertificate)
  } catch (error) {
    console.error('[CERTIFICATE_POST_ERROR]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const courseId = params.courseId

    const certificate = await db.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (!certificate) {
      return new NextResponse('Certificate not found', { status: 404 })
    }

    return NextResponse.json(certificate)
  } catch (error) {
    console.error('[CERTIFICATE_GET_ERROR]', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
