'use client';

import { useState } from 'react';
import { MCQQuestion } from '@/lib/types';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface QuizCardProps {
  question: MCQQuestion;
  index: number;
}

export default function QuizCard({ question, index }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const isAnswered = selected !== null;
  const isCorrect = selected === question.correct_answer;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
      {/* Question */}
      <div className="flex gap-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-xs font-bold text-violet-300">
          {index + 1}
        </span>
        <p className="text-sm font-medium text-white leading-relaxed">{question.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 pl-10">
        {question.options.map((option) => {
          let style = 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10';

          if (isAnswered) {
            if (option.label === question.correct_answer) {
              style = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
            } else if (option.label === selected) {
              style = 'border-red-500/40 bg-red-500/10 text-red-300';
            } else {
              style = 'border-white/5 bg-white/[0.02] text-slate-500';
            }
          }

          return (
            <button
              key={option.label}
              id={`option-${index}-${option.label}`}
              onClick={() => !isAnswered && setSelected(option.label)}
              disabled={isAnswered}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${style} disabled:cursor-default`}
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                {option.label}
              </span>
              {option.text}

              {isAnswered && option.label === question.correct_answer && (
                <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400 flex-shrink-0" />
              )}
              {isAnswered && option.label === selected && !isCorrect && (
                <XCircle className="ml-auto h-4 w-4 text-red-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Result + Explanation */}
      {isAnswered && (
        <div className="pl-10 space-y-2">
          <div className={`flex items-center gap-2 text-sm font-medium ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCorrect ? (
              <><CheckCircle2 className="h-4 w-4" /> Correct!</>
            ) : (
              <><XCircle className="h-4 w-4" /> Incorrect — correct answer: <span className="text-emerald-400">{question.correct_answer}</span></>
            )}
          </div>

          <button
            id={`explanation-toggle-${index}`}
            onClick={() => setShowExplanation((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition-colors"
          >
            {showExplanation ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showExplanation ? 'Hide' : 'Show'} explanation
          </button>

          {showExplanation && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300 leading-relaxed">
              {question.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
