"use client";

import { useState, useEffect, useTransition } from "react";
import { searchCandidatos, getCabezasDeLista } from "@/actions/candidatos";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Search, MapPin, User, Building, Building2, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = "REGIONAL" | "PROVINCIAL" | "DISTRITAL";

export function BuscadorCandidatos({ initialData }: { initialData: any[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("REGIONAL");
  const [query, setQuery] = useState("");
  const [candidatos, setCandidatos] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  // District state
  const [distritos, setDistritos] = useState<string[]>([]);
  const [selectedDistrito, setSelectedDistrito] = useState<string>("");

  // Advanced Filters
  const [conSentencias, setConSentencias] = useState(false);
  const [ordenarPatrimonio, setOrdenarPatrimonio] = useState(false);

  // Load districts on mount
  useEffect(() => {
    import("@/actions/candidatos").then((m) => {
      m.getDistritosConCandidatos().then((data) => setDistritos(data));
    });
  }, []);

  // Cambiar pestaña o distrito
  useEffect(() => {
    if (query.trim() !== "") return; // Si está buscando, no sobreescribir con pestañas
    
    // Si es distrital pero no hay distrito seleccionado, vaciar la lista (esperar a que elija)
    if (activeTab === "DISTRITAL" && !selectedDistrito) {
      setCandidatos([]);
      return;
    }

    startTransition(async () => {
      const results = await getCabezasDeLista(activeTab, activeTab === "DISTRITAL" ? selectedDistrito : undefined, conSentencias, ordenarPatrimonio);
      setCandidatos(results);
    });
  }, [activeTab, query, selectedDistrito, conSentencias, ordenarPatrimonio]);

  // Búsqueda en vivo (Ignora pestañas)
  useEffect(() => {
    if (query.trim() === "") {
      // Restore tab state when clearing search
      if (activeTab === "DISTRITAL" && !selectedDistrito) {
        setCandidatos([]);
      } else {
        startTransition(async () => {
          const results = await getCabezasDeLista(activeTab, activeTab === "DISTRITAL" ? selectedDistrito : undefined, conSentencias, ordenarPatrimonio);
          setCandidatos(results);
        });
      }
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await searchCandidatos(query, conSentencias, ordenarPatrimonio);
        setCandidatos(results);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, conSentencias, ordenarPatrimonio]);

  return (
    <div className="w-full space-y-8">
      {/* Buscador */}
      <div className="relative max-w-2xl mx-auto mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input 
          type="text" 
          placeholder="Buscar candidato, partido..." 
          className="pl-11 h-11 md:h-12 text-sm md:text-base rounded-full border-slate-200 shadow-sm focus-visible:ring-2 focus-visible:ring-brand-red/20 focus-visible:border-brand-red/40 focus-visible:ring-offset-0 bg-white transition-all hover:border-slate-300"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isPending && (
          <div className="absolute right-4 top-4 h-4 w-4 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
        )}
      </div>

      {/* TABS (Filtros de elección - Segmented Control) */}
      {!query.trim() && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-200/60 p-1 rounded-xl">
            <button 
              onClick={() => { setActiveTab("REGIONAL"); setCandidatos(initialData); }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === "REGIONAL" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Gobierno Regional</span>
              <span className="sm:hidden">Región</span>
            </button>
            <button 
              onClick={() => setActiveTab("PROVINCIAL")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === "PROVINCIAL" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <Building className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Provincia Barranca</span>
              <span className="sm:hidden">Provincia</span>
            </button>
            <button 
              onClick={() => setActiveTab("DISTRITAL")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === "DISTRITAL" 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Distritos</span>
            </button>
          </div>
        </div>
      )}

      {/* Selector de Distritos (solo si la pestaña es DISTRITAL) */}
      {!query.trim() && activeTab === "DISTRITAL" && (
        <div className="flex flex-wrap justify-center gap-2 mb-8 -mt-2 px-2">
          {distritos.map((d) => {
            const formattedName = d.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
            const isActive = selectedDistrito === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDistrito(d)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs md:text-sm transition-all duration-200 border",
                  isActive 
                    ? "bg-brand-red/10 text-brand-red border-brand-red/30 shadow-sm font-semibold" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-medium"
                )}
              >
                {formattedName}
              </button>
            );
          })}
        </div>
      )}

      {/* Título de Resultados Dinámico */}
      {!query.trim() && (
        <h3 className="text-xl font-bold text-slate-800 text-center mb-4">
          {activeTab === "REGIONAL" && "Candidatos a Gobernador Regional"}
          {activeTab === "PROVINCIAL" && "Candidatos a Alcalde Provincial"}
          {activeTab === "DISTRITAL" && "Candidatos a Alcaldes Distritales"}
        </h3>
      )}

      {/* Controles de Filtros Avanzados */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <button
          onClick={() => setConSentencias(!conSentencias)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
            conSentencias 
              ? "bg-red-50 text-red-600 border-red-200 shadow-sm" 
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          )}
        >
          <AlertTriangle className={cn("w-3.5 h-3.5", conSentencias && "text-red-500")} />
          Con Sentencias
        </button>
        
        <button
          onClick={() => setOrdenarPatrimonio(!ordenarPatrimonio)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
            ordenarPatrimonio 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" 
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
          )}
        >
          <TrendingUp className={cn("w-3.5 h-3.5", ordenarPatrimonio && "text-emerald-600")} />
          Mayor Patrimonio
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {candidatos.map((c, index) => {
          // Normalizar nombre de partido para encontrar el logo
          const logoName = c.partido_politico
            .replace(/[^a-zA-Z0-9ñÑ]/g, "_")
            .toUpperCase() + ".jpg";

          return (
            <motion.div
              key={c.id_hoja_vida}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: (index % 10) * 0.05 }}
            >
              <Link href={`/candidato/${c.id_hoja_vida}`}>
                <Card className="flex flex-col h-full overflow-hidden group">
                  <div className="relative w-full aspect-square bg-slate-100/50 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                      <img 
                        src={`/fotos/${c.id_hoja_vida}.jpg`} 
                        alt={c.nombre_completo}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to placeholder if local photo doesn't exist yet
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center">
                        <User className="w-12 h-12 text-slate-300" />
                      </div>
                    {/* Logo Partido Positioned on top */}
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full shadow-md p-1 flex items-center justify-center overflow-hidden border border-white/40 backdrop-blur-md bg-white/80">
                      <img 
                        src={`/simbolos/${logoName}`}
                        alt={c.partido_politico}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                  
                  <CardHeader className="p-3 bg-transparent flex-1 flex flex-col justify-between">
                    <CardTitle className="text-xs md:text-sm font-bold line-clamp-2 leading-snug text-slate-900 mb-1.5 group-hover:text-brand-red transition-colors capitalize">
                      {c.nombre_completo.toLowerCase()}
                    </CardTitle>
                    <div className="space-y-1.5 mt-auto">
                      <div className="flex items-center text-[9px] md:text-[10px] font-semibold text-slate-500 bg-slate-100 w-fit px-1.5 py-0.5 rounded uppercase tracking-wider">
                        <span className="line-clamp-1">{c.cargo}</span>
                      </div>
                      <div className="flex items-center text-[10px] md:text-[11px] text-slate-500 capitalize">
                        <MapPin className="mr-1 h-3 w-3 shrink-0 text-slate-400" />
                        <span className="line-clamp-1">{(c.distrito || c.provincia || c.departamento)?.toLowerCase()}</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
      
      {candidatos.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No se encontraron candidatos.
        </div>
      )}
    </div>
  );
}
