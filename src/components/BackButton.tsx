"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="inline-flex items-center text-sm text-slate-500 hover:text-brand-red transition-colors font-medium cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4 mr-1.5" />
      Volver
    </button>
  );
}
