"use client";

import { Share2, RefreshCcw } from "lucide-react";

export function TriviaResult({ score, total, onRestart }: { score: number, total: number, onRestart: () => void }) {
  const percentage = score / total;
  
  let title = "¡Necesitas informarte más!";
  let message = "Parece que no conoces muy bien a tus candidatos. ¡Revisa sus hojas de vida en Voz Electoral antes de votar!";
  let emoji = "📚";

  if (percentage >= 0.6) {
    title = "¡Nada mal!";
    message = "Conoces algunas cosas oscuras de tus candidatos, pero aún hay sorpresas.";
    emoji = "👀";
  }
  if (percentage === 1) {
    title = "¡Maestro Electoral!";
    message = "Te sabes todos los secretos y verdades incómodas de los candidatos. ¡Estás listo para votar!";
    emoji = "🏆";
  }

  const shareText = `Acabo de sacar ${score}/${total} en la Trivia de Verdades Ocultas de mis candidatos en Voz Electoral. ¿Crees que puedes superarme? 🎮🔥 Juega aquí:`;
  const shareUrl = "https://voz-electoral.pe/trivia"; // Reemplazar con URL real

  const handleShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-900/10 border border-white overflow-hidden text-center p-6 md:p-10 animate-in zoom-in-95 duration-500">
      
      <div className="relative inline-block mt-0 mb-3 md:mb-6">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl animate-pulse opacity-20"></div>
        <div className="relative text-5xl md:text-7xl animate-bounce drop-shadow-md">{emoji}</div>
      </div>
      
      <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-2 md:mb-3">
        {title}
      </h2>
      
      <p className="text-slate-500 mb-5 md:mb-8 font-medium text-xs md:text-base leading-relaxed px-2">
        {message}
      </p>
      
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 md:mb-8 border border-white shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/50 rounded-full blur-xl -mr-10 -mt-10"></div>
        <p className="text-[10px] md:text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1 md:mb-2 relative z-10">Tu Puntaje Final</p>
        <div className="text-5xl md:text-6xl font-black text-indigo-700 relative z-10 drop-shadow-sm">
          {score} <span className="text-2xl md:text-3xl text-indigo-300 font-bold">/ {total}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleShare}
          className="group w-full h-12 md:h-14 bg-gradient-to-r from-[#25D366] to-[#1DA851] hover:from-[#20bd5a] hover:to-[#179646] text-white rounded-full font-bold text-sm md:text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:-translate-y-1"
        >
          <Share2 className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
          Retar por WhatsApp
        </button>
        
        <button
          onClick={onRestart}
          className="w-full h-12 md:h-14 bg-white border-2 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-full font-bold text-sm md:text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
        >
          <RefreshCcw className="w-4 h-4 md:w-5 md:h-5" />
          Volver a jugar
        </button>
      </div>
    </div>
  );
}
