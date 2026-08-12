"use client";

import { useState, useEffect } from "react";
import { NivelGeografico } from "@/actions/trivia/types";
import { getDistritosConCandidatos } from "@/actions/candidatos";
import { MapPin, Building2, Building, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareButton } from "@/components/ShareButton";

type Props = {
  onStart: (nivel: NivelGeografico) => void;
};

export function TriviaConfigurator({ onStart }: Props) {
  const [activeTab, setActiveTab] = useState<"REGIONAL" | "PROVINCIAL" | "DISTRITAL">("REGIONAL");
  const [distritos, setDistritos] = useState<string[]>([]);
  const [selectedDistrito, setSelectedDistrito] = useState<string>("");

  useEffect(() => {
    getDistritosConCandidatos().then(setDistritos);
  }, []);

  const handleStart = () => {
    let cargo = "GOBERNADOR REGIONAL";
    if (activeTab === "PROVINCIAL") cargo = "ALCALDE PROVINCIAL";
    if (activeTab === "DISTRITAL") cargo = "ALCALDE DISTRITAL";

    onStart({
      cargo,
      departamento: activeTab === "REGIONAL" ? "LIMA" : undefined,
      distrito: activeTab === "DISTRITAL" ? selectedDistrito : undefined,
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-900/5 border border-white overflow-hidden">
      <div className="p-5 md:p-8 space-y-6">
        <div className="text-center space-y-1.5 mb-2">
          <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest">Paso 1</p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Elige tu campo de batalla</h2>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setActiveTab("REGIONAL")}
            className={cn(
              "flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left group",
              activeTab === "REGIONAL" ? "border-indigo-500 bg-indigo-50/50 shadow-sm" : "border-transparent bg-white hover:border-indigo-100 shadow-sm"
            )}
          >
            <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl transition-all", activeTab === "REGIONAL" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105" : "bg-indigo-50 text-indigo-400 group-hover:bg-indigo-100")}>
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className={cn("font-bold transition-colors", activeTab === "REGIONAL" ? "text-indigo-900" : "text-slate-700")}>Región Lima</p>
              <p className="text-xs text-slate-500">Candidatos a Gobernador</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("PROVINCIAL")}
            className={cn(
              "flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left group",
              activeTab === "PROVINCIAL" ? "border-indigo-500 bg-indigo-50/50 shadow-sm" : "border-transparent bg-white hover:border-indigo-100 shadow-sm"
            )}
          >
            <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl transition-all", activeTab === "PROVINCIAL" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105" : "bg-indigo-50 text-indigo-400 group-hover:bg-indigo-100")}>
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className={cn("font-bold transition-colors", activeTab === "PROVINCIAL" ? "text-indigo-900" : "text-slate-700")}>Provincia de Barranca</p>
              <p className="text-xs text-slate-500">Candidatos a Alcalde Provincial</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("DISTRITAL")}
            className={cn(
              "flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left group",
              activeTab === "DISTRITAL" ? "border-indigo-500 bg-indigo-50/50 shadow-sm" : "border-transparent bg-white hover:border-indigo-100 shadow-sm"
            )}
          >
            <div className={cn("flex items-center justify-center w-12 h-12 rounded-xl transition-all", activeTab === "DISTRITAL" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105" : "bg-indigo-50 text-indigo-400 group-hover:bg-indigo-100")}>
              <Building className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className={cn("font-bold transition-colors", activeTab === "DISTRITAL" ? "text-indigo-900" : "text-slate-700")}>Distritos</p>
              <p className="text-xs text-slate-500">Candidatos a Alcalde Distrital</p>
            </div>
          </button>
        </div>

        {activeTab === "DISTRITAL" && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Selecciona tu distrito:</label>
            <select 
              className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={selectedDistrito}
              onChange={(e) => setSelectedDistrito(e.target.value)}
            >
              <option value="">-- Elige un distrito --</option>
              {distritos.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handleStart}
            disabled={activeTab === "DISTRITAL" && !selectedDistrito}
            className="w-full flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
          >
            <PlayCircle className="w-6 h-6" />
            JUGAR AHORA
          </button>
        </div>

        <div className="flex justify-center pt-2">
          <ShareButton 
            title="Trivia Electoral 2026" 
            text="¿Qué tanto conoces a tus candidatos? Juega a la trivia de Voz Electoral, descubre verdades ocultas y vota informado." 
            label="Compartir Trivia" 
          />
        </div>
      </div>
    </div>
  );
}
