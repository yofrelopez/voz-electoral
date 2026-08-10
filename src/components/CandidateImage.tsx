"use client";

import { Users } from "lucide-react";

export function CandidateImage({ idHojaVida, nombre, className, iconClassName }: { idHojaVida: number; nombre: string; className?: string; iconClassName?: string }) {
  return (
    <div className={className || "relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex-shrink-0 mt-[-40px] md:mt-[-50px] flex items-center justify-center"}>
      <img 
        src={`/fotos/${idHojaVida}.jpg`} 
        alt={nombre}
        className="w-full h-full object-cover object-top"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      <div className="hidden w-full h-full flex-col items-center justify-center bg-slate-100 text-slate-300">
        <Users className={iconClassName || "w-12 h-12 md:w-16 md:h-16"} />
      </div>
    </div>
  );
}
