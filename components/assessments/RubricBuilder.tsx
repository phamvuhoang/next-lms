'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash } from "lucide-react";

interface Criterion {
  description: string;
  points: number;
}

interface RubricBuilderProps {
  initialRubric?: Criterion[];
  onRubricChange: (rubric: Criterion[]) => void;
  isLoading: boolean;
}

export const RubricBuilder = ({ initialRubric = [], onRubricChange, isLoading }: RubricBuilderProps) => {
  const [criteria, setCriteria] = useState<Criterion[]>(initialRubric);

  const addCriterion = () => {
    const newCriterion: Criterion = { description: "", points: 10 };
    setCriteria([...criteria, newCriterion]);
    onRubricChange([...criteria, newCriterion]);
  };

  const updateCriterion = (index: number, field: keyof Criterion, value: any) => {
    const updatedCriteria = criteria.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    setCriteria(updatedCriteria);
    onRubricChange(updatedCriteria);
  };

  const removeCriterion = (index: number) => {
    const updatedCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(updatedCriteria);
    onRubricChange(updatedCriteria);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Grading Rubric</h4>
      {criteria.map((criterion, index) => (
        <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
          <div className="flex-grow space-y-2">
            <Textarea
              value={criterion.description}
              onChange={(e) => updateCriterion(index, "description", e.target.value)}
              placeholder="Criterion description"
              disabled={isLoading}
            />
            <Input
              type="number"
              value={criterion.points}
              onChange={(e) => updateCriterion(index, "points", parseInt(e.target.value))}
              placeholder="Points"
              disabled={isLoading}
              min={0}
            />
          </div>
          <Button variant="destructive" size="sm" onClick={() => removeCriterion(index)} disabled={isLoading}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addCriterion} disabled={isLoading}>
        <PlusCircle className="h-4 w-4 mr-2" /> Add Criterion
      </Button>
    </div>
  );
};