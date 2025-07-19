'use client';

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  timeLimit: z.number().int().min(1).optional(),
  maxAttempts: z.number().int().min(1).default(3),
  passingScore: z.number().int().min(0).max(100).default(70),
  xpReward: z.number().int().min(0).default(25),
});

interface QuizFormProps {
  initialData?: z.infer<typeof formSchema>;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
}

export const QuizForm = ({ initialData, onSubmit, isLoading }: QuizFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz Title</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="e.g. 'JavaScript Basics Quiz'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea disabled={isLoading} placeholder="e.g. 'Test your knowledge of JavaScript fundamentals'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="timeLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Limit (minutes)</FormLabel>
              <FormControl>
                <Input type="number" disabled={isLoading} placeholder="e.g. 30" {...field} onChange={event => field.onChange(parseInt(event.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maxAttempts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Attempts</FormLabel>
              <FormControl>
                <Input type="number" disabled={isLoading} placeholder="e.g. 3" {...field} onChange={event => field.onChange(parseInt(event.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passingScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passing Score (%)</FormLabel>
              <FormControl>
                <Input type="number" disabled={isLoading} placeholder="e.g. 70" {...field} onChange={event => field.onChange(parseInt(event.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="xpReward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>XP Reward</FormLabel>
              <FormControl>
                <Input type="number" disabled={isLoading} placeholder="e.g. 25" {...field} onChange={event => field.onChange(parseInt(event.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {initialData ? "Save changes" : "Create Quiz"}
        </Button>
      </form>
    </Form>
  );
};
