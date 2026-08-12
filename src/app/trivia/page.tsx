import { Metadata } from "next";
import { TriviaGame } from "@/components/trivia/TriviaGame";

export const metadata: Metadata = {
  title: "Trivia Electoral 2026 | Juega y Conoce a tus Candidatos",
  description: "Demuestra qué tanto conoces a tus candidatos. Juega a la trivia de Voz Electoral, descubre verdades ocultas y vota informado en las Elecciones 2026.",
  keywords: ["trivia", "elecciones 2026", "candidatos", "política peruana", "votación", "juego", "voz electoral"],
  openGraph: {
    title: "Trivia Electoral 2026 🎮 | Voz Electoral",
    description: "¿Qué tanto conoces a tus candidatos? Juega, descubre las verdades ocultas de los políticos de tu región y vota informado.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trivia Electoral 2026 🎮 | Voz Electoral",
    description: "Juega a la trivia, compite con tus amigos y descubre quiénes son realmente los candidatos de tu distrito.",
  }
};

export default function TriviaPage() {
  return (
    <div className="flex-1 w-full min-h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30rem] h-[30rem] bg-purple-200/30 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto pt-4 pb-6 px-4 sm:px-6 relative z-10">
        
        {/* Contenedor del Juego */}
        <TriviaGame />
        
      </div>
    </div>
  );
}
