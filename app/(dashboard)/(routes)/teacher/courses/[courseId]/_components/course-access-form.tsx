'use client'

import * as z from 'zod'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Course } from '@prisma/client'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

interface CourseAccessFormProps {
  initialData: Course
  courseId: string
}

const formSchema = z.object({
  isFree: z.boolean().default(false),
})

export const CourseAccessForm = ({ initialData, courseId }: CourseAccessFormProps) => {
  const [isEditing, setIsEditing] = useState(false)

  const toggleEdit = () => setIsEditing((current) => !current)

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!initialData.isFree,
    },
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values)
      toast.success('Course updated')
      toggleEdit()
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Course access
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Edit access
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p className={cn('mt-2 text-sm', !initialData.isFree && 'text-slate-500 italic')}>
          {initialData.isFree ? (
            <>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Free Course
              </span>
              <span className="ml-2 text-slate-600">
                Students can enroll without payment
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                Paid Course
              </span>
              <span className="ml-2 text-slate-600">
                Students must purchase to access
              </span>
            </>
          )}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>
                      Check this box if you want to make this course free for all students.
                      Students will be able to enroll without payment and access all free chapters.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
