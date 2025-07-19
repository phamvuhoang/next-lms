'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
}

interface QuizPlayerProps {
  quizId: string;
  questions: Question[];
  onSubmit: (answers: any[]) => void;
  isLoading: boolean;
}

export const QuizPlayer = ({ quizId, questions, onSubmit, isLoading }: QuizPlayerProps) => {
  const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setCurrentAnswers((prev) => {
      const existingAnswerIndex = prev.findIndex((ans) => ans.questionId === questionId);
      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prev];
        updatedAnswers[existingAnswerIndex] = { questionId, answer };
        return updatedAnswers;
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  const handleSubmit = () => {
    onSubmit(currentAnswers);
  };

  return (
    <div className="space-y-6">
      {questions.map((q, index) => (
        <div key={q.id} className="p-6 border rounded-lg shadow-sm space-y-4">
          <h4 className="text-lg font-semibold">{index + 1}. {q.question}</h4>

          {q.type === "multiple_choice" && q.options && (
            <RadioGroup
              onValueChange={(value) => handleAnswerChange(q.id, value)}
              disabled={isLoading}
            >
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${q.id}-${oIndex}`} />
                  <Label htmlFor={`${q.id}-${oIndex}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {q.type === "true_false" && (
            <RadioGroup
              onValueChange={(value) => handleAnswerChange(q.id, value)}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${q.id}-true`} />
                <Label htmlFor={`${q.id}-true`}>True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${q.id}-false`} />
                <Label htmlFor={`${q.id}-false`}>False</Label>
              </div>
            </RadioGroup>
          )}

          {q.type === "fill_blank" && (
            <Input
              placeholder="Your answer"
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              disabled={isLoading}
            />
          )}
        </div>
      ))}
      <Button onClick={handleSubmit} disabled={isLoading}>
        Submit Quiz
      </Button>
    </div>
  );
};
