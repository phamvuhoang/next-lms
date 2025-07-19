'use client';

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string().optional(),
});

interface Criterion {
  description: string;
  points: number;
}

interface GradingInterfaceProps {
  initialData?: z.infer<typeof formSchema>;
  rubric?: Criterion[];
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
}

export const GradingInterface = ({ initialData, rubric, onSubmit, isLoading }: GradingInterfaceProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  return (
    <div className="space-y-8">
      {rubric && rubric.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-2">Grading Rubric</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Criterion</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rubric.map((criterion, index) => (
                <TableRow key={index}>
                  <TableCell>{criterion.description}</TableCell>
                  <TableCell className="text-right">{criterion.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Score (0-100)</FormLabel>
                <FormControl>
                  <Input type="number" disabled={isLoading} placeholder="e.g. 95" {...field} onChange={event => field.onChange(parseInt(event.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="feedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feedback</FormLabel>
                <FormControl>
                  <Textarea disabled={isLoading} placeholder="Provide detailed feedback here..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            Submit Grade
          </Button>
        </form>
      </Form>
    </div>
  );
};
