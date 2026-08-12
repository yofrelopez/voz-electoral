"use client";

import { useState, useEffect } from "react";
import { NivelGeografico, TriviaQuestion } from "@/actions/trivia/types";
import { getTriviaSession } from "@/actions/trivia";
import { TriviaConfigurator } from "./TriviaConfigurator";
import { TriviaCard } from "./TriviaCard";
import { TriviaProgress } from "./TriviaProgress";
import { TriviaResult } from "./TriviaResult";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";

type GameState = "CONFIG" | "LOADING" | "PLAYING" | "RESULT";

export function TriviaGame() {
  const [gameState, setGameState] = useState<GameState>("CONFIG");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-scroll global cuando cambia de fase el juego
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [gameState]);

  const handleStart = async (nivel: NivelGeografico) => {
    setGameState("LOADING");
    setErrorMsg("");
    try {
      const session = await getTriviaSession(nivel);
      if (session.length === 0) {
        setErrorMsg("No hay suficientes datos para armar la trivia en esta ubicación. ¡Intenta con otra!");
        setGameState("CONFIG");
        return;
      }
      setQuestions(session);
      setCurrentIndex(0);
      setScore(0);
      setGameState("PLAYING");
    } catch (err) {
      setErrorMsg("Ocurrió un error al cargar la trivia. Intenta nuevamente.");
      setGameState("CONFIG");
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setScore(s => s + 1);
    
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(c => c + 1);
    } else {
      setGameState("RESULT");
    }
  };

  const handleRestart = () => {
    setGameState("CONFIG");
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
  };

  return (
    <div className="w-full">
      {/* Encabezado dinámico */}
      <div className="mb-2 md:mb-4 relative">
        {gameState === "CONFIG" ? (
          <Link 
            href="/" 
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver al catálogo
          </Link>
        ) : (
          <button 
            onClick={handleRestart}
            className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Abandonar partida
          </button>
        )}
        
        {gameState === "CONFIG" && (
          <div className="text-center space-y-1.5 mb-6 animate-in fade-in slide-in-from-top-2">
            <div className="inline-block px-3 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-1">
              Mini Juego
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight drop-shadow-sm">
              Verdades Ocultas
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto text-xs md:text-sm font-normal leading-relaxed">
              Demuestra qué tanto conoces a los políticos de tu zona. Te retamos a adivinar los patrimonios, sentencias y secretos mejor guardados.
            </p>
          </div>
        )}
      </div>

      {gameState === "CONFIG" && (
        <div className="space-y-4">
          <TriviaConfigurator onStart={handleStart} />
          {errorMsg && (
            <div className="max-w-lg mx-auto bg-red-50 text-brand-red p-4 rounded-xl border border-red-100 text-center text-sm font-medium animate-in slide-in-from-bottom-2">
              {errorMsg}
            </div>
          )}
        </div>
      )}

      {gameState === "LOADING" && (
        <div className="w-full max-w-lg mx-auto bg-white/80 backdrop-blur-xl p-12 rounded-3xl shadow-xl shadow-indigo-900/5 border border-white flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="relative mt-4">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl animate-pulse opacity-20"></div>
            <div className="relative bg-gradient-to-tr from-indigo-50 to-purple-100 border-2 border-white w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl animate-bounce shadow-indigo-500/20">
              <span className="text-4xl animate-pulse">🕵️</span>
            </div>
          </div>
          <div className="space-y-2 pb-4">
            <h3 className="text-xl font-bold text-slate-800">Revisando hojas de vida...</h3>
            <p className="text-sm text-slate-500 font-medium">Buscando patrimonios y verdades ocultas</p>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto mt-4 overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full w-full origin-left animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {gameState === "PLAYING" && questions.length > 0 && (
        <div className="w-full">
          <TriviaProgress current={currentIndex + 1} total={questions.length} score={score} />
          <TriviaCard 
            key={questions[currentIndex].id} // Fuerza un re-render completo al cambiar
            questionData={questions[currentIndex]} 
            onNext={handleAnswer} 
          />
        </div>
      )}

      {gameState === "RESULT" && (
        <TriviaResult score={score} total={questions.length} onRestart={handleRestart} />
      )}
    </div>
  );
}
