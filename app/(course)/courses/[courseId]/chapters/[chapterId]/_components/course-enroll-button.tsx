'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'

type CourseEnrollButtonProps = {
  price: number
  courseId: string
  isFree?: boolean
}

export default function CourseEnrollButton({ price, courseId, isFree = false }: CourseEnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onClick = async () => {
    try {
      setIsLoading(true)

      if (isFree) {
        // Free course enrollment
        await axios.post(`/api/courses/${courseId}/enroll`)
        toast.success('Successfully enrolled in course!')
        router.refresh()
      } else {
        // Paid course checkout
        const response = await axios.post(`/api/courses/${courseId}/checkout`)
        window.location.assign(response.data.url)
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data || 'Something went wrong!'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button className="w-full md:w-auto" size="sm" onClick={onClick} disabled={isLoading}>
      {isFree ? 'Enroll for Free' : `Enroll for ${formatPrice(price)}`}
    </Button>
  )
}
