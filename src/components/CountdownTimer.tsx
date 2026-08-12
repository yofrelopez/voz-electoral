"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function CountdownTimer() {
  // Target date: October 4, 2026 (Peruvian Regional and Municipal Elections)
  const targetDate = new Date("2026-10-04T08:00:00").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const calculateTimeLeft = () => {
      const difference = targetDate - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Evitar hydration mismatch
  if (!isClient) {
    return (
      <div className="flex justify-center mb-6 w-full">
        <div className="h-9 w-64 bg-slate-200/50 rounded-full animate-pulse"></div>
      </div>
    ); 
  }

  return (
    <div className="flex justify-center mb-6 w-full animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="inline-flex items-center justify-center gap-3 sm:gap-4 bg-white/80 backdrop-blur-md border border-slate-200/80 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-1.5 text-slate-500 pr-3 sm:pr-4 border-r border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase">Elecciones: 4 Oct</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm sm:text-base font-bold text-slate-800 tabular-nums">{timeLeft.days}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium lowercase">d</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm sm:text-base font-bold text-slate-800 tabular-nums">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium lowercase">h</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm sm:text-base font-bold text-slate-800 tabular-nums">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium lowercase">m</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm sm:text-base font-bold text-brand-red tabular-nums">{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className="text-[9px] sm:text-[10px] text-brand-red/60 font-medium lowercase">s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
