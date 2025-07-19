'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash } from "lucide-react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  FILL_IN_THE_BLANK = "FILL_IN_THE_BLANK",
}

interface Question {
  id?: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  order: number;
}

interface QuestionBuilderProps {
  initialQuestions?: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  isLoading: boolean;
}

export const QuestionBuilder = ({ initialQuestions = [], onQuestionsChange, isLoading }: QuestionBuilderProps) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const addQuestion = () => {
    const newQuestion: Question = {
      question: "",
      type: QuestionType.MULTIPLE_CHOICE,
      options: ["Option 1", "Option 2"],
      correctAnswer: "Option 1",
      points: 1,
      order: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
    onQuestionsChange([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === questionIndex && q.options) {
        return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === questionIndex && q.options) {
        const updatedOptions = q.options.map((opt, j) => (j === optionIndex ? value : opt));
        return { ...q, options: updatedOptions };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = questions.map((q, i) => {
      if (i === questionIndex && q.options) {
        const updatedOptions = q.options.filter((_, j) => j !== optionIndex);
        return { ...q, options: updatedOptions };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    onQuestionsChange(updatedQuestions);
  };

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => (
        <div key={q.id || qIndex} className="p-6 border rounded-lg shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Question {qIndex + 1}</h4>
            <Button variant="destructive" size="sm" onClick={() => removeQuestion(qIndex)} disabled={isLoading}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Question Text</label>
            <Textarea
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
              disabled={isLoading}
              placeholder="Enter your question here"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Question Type</label>
            <Select
              value={q.type}
              onValueChange={(value) => updateQuestion(qIndex, "type", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                <SelectItem value={QuestionType.TRUE_FALSE}>True/False</SelectItem>
                <SelectItem value={QuestionType.FILL_IN_THE_BLANK}>Fill-in-the-blank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {q.type === QuestionType.MULTIPLE_CHOICE && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Options</label>
              {q.options?.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    disabled={isLoading}
                    placeholder={`Option ${oIndex + 1}`}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeOption(qIndex, oIndex)} disabled={isLoading}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIndex)} disabled={isLoading}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add Option
              </Button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
            {q.type === QuestionType.MULTIPLE_CHOICE ? (
              <Select
                value={q.correctAnswer as string}
                onValueChange={(value) => updateQuestion(qIndex, "correctAnswer", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  {q.options?.filter(option => option.trim() !== '').map((option, oIndex) => (
                    <SelectItem key={oIndex} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : q.type === QuestionType.TRUE_FALSE ? (
              <RadioGroup
                value={q.correctAnswer as string}
                onValueChange={(value) => updateQuestion(qIndex, "correctAnswer", value)}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`true-${qIndex}`} />
                  <Label htmlFor={`true-${qIndex}`}>True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`false-${qIndex}`} />
                  <Label htmlFor={`false-${qIndex}`}>False</Label>
                </div>
              </RadioGroup>
            ) : (
              <Input
                value={q.correctAnswer as string}
                onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                disabled={isLoading}
                placeholder="Enter correct answer"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Points</label>
            <Input
              type="number"
              value={q.points}
              onChange={(e) => updateQuestion(qIndex, "points", parseInt(e.target.value))}
              disabled={isLoading}
              min={1}
            />
          </div>
        </div>
      ))}
      <Button type="button" onClick={addQuestion} disabled={isLoading}>
        <PlusCircle className="h-4 w-4 mr-2" /> Add Question
      </Button>
    </div>
  );
