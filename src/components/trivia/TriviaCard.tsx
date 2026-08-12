"use client";

import { useState, useEffect } from "react";
import { TriviaQuestion, TriviaOption } from "@/actions/trivia/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

type Props = {
  questionData: TriviaQuestion;
  onNext: (isCorrect: boolean) => void;
};

export function TriviaCard({ questionData, onNext }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Auto-scroll hacia arriba cuando cambie la pregunta
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [questionData.id]);

  const handleSelect = (option: TriviaOption) => {
    if (isAnswered) return;
    setSelectedId(option.id);
    setIsAnswered(true);
  };

  const handleContinue = () => {
    const selectedOption = questionData.options.find(o => o.id === selectedId);
    onNext(selectedOption?.isCorrect || false);
    setSelectedId(null);
    setIsAnswered(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 animate-in slide-in-from-right-8 duration-300">
      <div className="bg-white/80 backdrop-blur-md p-5 md:p-8 rounded-3xl shadow-sm border border-indigo-50 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/40 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100/40 rounded-full blur-xl -ml-5 -mb-5"></div>
        <h2 className="text-lg md:text-2xl font-bold text-indigo-900 leading-tight relative z-10">
          {questionData.question}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {questionData.options.map((option) => {
          const isSelected = selectedId === option.id;
          const showSuccess = isAnswered && option.isCorrect;
          const showFail = isAnswered && isSelected && !option.isCorrect;
          const showDisabled = isAnswered && !isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              disabled={isAnswered}
              className={cn(
                "relative flex flex-row md:flex-col items-center gap-4 md:gap-0 p-3 md:p-4 rounded-2xl border-2 transition-all text-left md:text-center group overflow-hidden",
                !isAnswered ? "bg-white/90 border-transparent hover:border-indigo-200 hover:bg-white shadow-sm hover:shadow-md cursor-pointer hover:-translate-y-1" : "cursor-default",
                showSuccess ? "border-emerald-400 bg-emerald-50 shadow-md scale-[1.02]" : "",
                showFail ? "border-rose-300 bg-rose-50 shadow-sm" : "",
                showDisabled ? "opacity-50 border-transparent bg-white/50 grayscale" : ""
              )}
            >
              {showSuccess && <CheckCircle2 className="absolute top-2 right-2 md:top-3 md:right-3 text-emerald-500 w-5 h-5 md:w-6 md:h-6 animate-in zoom-in" />}
              {showFail && <XCircle className="absolute top-2 right-2 md:top-3 md:right-3 text-rose-500 w-5 h-5 md:w-6 md:h-6 animate-in zoom-in" />}

              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden md:mb-4 border border-slate-200 bg-slate-100 flex-shrink-0 shadow-sm">
                {option.foto ? (
                  <img src={option.foto} alt={option.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">Sin foto</div>
                )}
              </div>
              <div className="flex-1 flex flex-col md:w-full">
                <h3 className="font-semibold text-slate-700 leading-tight mb-0.5 md:mb-1 text-sm md:text-base line-clamp-2 pr-6 md:pr-0">{option.nombre}</h3>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium md:mb-3 mt-auto line-clamp-1">{option.partido}</p>
                
                {isAnswered && (
                  <div className={cn(
                    "w-full text-[10px] md:text-xs p-1.5 md:p-2 rounded-lg mt-2 md:mt-auto border animate-in fade-in font-medium",
                    option.isCorrect ? "bg-emerald-100/50 border-emerald-200 text-emerald-800" : "bg-slate-100 border-slate-200 text-slate-600"
                  )}>
                    {option.fact}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="flex justify-center mt-6 animate-in slide-in-from-bottom-4 fade-in duration-500 pb-4">
          <button
            onClick={handleContinue}
            className="group relative h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center gap-2 shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></div>
            <span className="relative z-10 flex items-center gap-2">
              Siguiente Pregunta <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
