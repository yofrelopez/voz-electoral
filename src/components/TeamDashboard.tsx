"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { Share2, Download, Users, Briefcase, Calendar, AlertTriangle, X, BarChart3, CheckCircle2 } from "lucide-react";

export function TeamDashboard({ equipo, partido, ubicacion }: { equipo: any[], partido?: string, ubicacion?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Computar Estadísticas
  const stats = useMemo(() => {
    let conSentencias = 0;
    let conExpPolitica = 0;
    let jovenes = 0;
    const politicos: { nombre: string, cargo: string }[] = [];

    equipo.forEach((eq) => {
      const dp = eq.datos_personales || {};
      
      // Sentencias
      const sentencias = eq.sentencias || {};
      const penales = sentencias.sentencias_penales || [];
      const obligaciones = sentencias.sentencias_obligaciones || [];
      if (penales.length > 0 || obligaciones.length > 0) {
        conSentencias++;
      }

      // Experiencia
      const cargos = eq.cargos_y_renuncias || {};
      let tieneExp = false;
      let ultimoCargo = "";
      if (cargos.cargos_eleccion?.length > 0) {
        tieneExp = true;
        ultimoCargo = cargos.cargos_eleccion[0].cargoEleccion;
      } else if (cargos.cargos_partidarios?.length > 0) {
        tieneExp = true;
        ultimoCargo = cargos.cargos_partidarios[0].cargoPartidario;
      }
      
      if (tieneExp) {
        conExpPolitica++;
        politicos.push({ nombre: eq.nombre_completo, cargo: ultimoCargo });
      }

      // Edad (Cuota Joven = menores de 30 años)
      if (dp.feNacimiento) {
        const parts = dp.feNacimiento.split("/");
        if (parts.length === 3) {
          const year = parseInt(parts[2], 10);
          if (year > 1900) {
            const edad = 2026 - year;
            if (edad < 30) jovenes++;
          }
        }
      }
    });

    return {
      conSentencias,
      conExpPolitica,
      jovenes,
      politicos,
      total: equipo.length
    };
  }, [equipo]);

  const handleShare = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    
    try {
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await toPng(containerRef.current, { 
        cacheBust: true,
        backgroundColor: "#ffffff",
        style: {
          padding: "24px",
          borderRadius: "16px",
          transform: "scale(1)",
        },
        pixelRatio: 2 // Alta calidad
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `radiografia-${partido || "lista"}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Radiografía Electoral",
          text: `Mira la radiografía de la lista de ${partido || "este partido"}`,
          files: [file]
        });
      } else {
        const link = document.createElement("a");
        link.download = `radiografia-${partido || "lista"}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Error al exportar imagen", err);
      alert("Hubo un error al generar la imagen.");
    } finally {
      setIsExporting(false);
    }
  };

  if (equipo.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        <BarChart3 className="w-4 h-4 text-brand-red" />
        <span>Estadísticas</span>
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
          <div className="bg-white shadow-2xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:max-w-2xl overflow-hidden relative flex flex-col">
            
            {/* Header Sticky */}
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-brand-red" />
                  Radiografía Electoral
                </h3>
                <p className="text-sm text-slate-500 mt-1 truncate max-w-[250px] sm:max-w-md">{partido}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Scrollable (Este es el que se exporta) */}
            <div className="overflow-y-auto p-4 md:p-6 flex-1 bg-slate-50">
              <div ref={containerRef} className="bg-white rounded-xl p-6 border border-slate-100 space-y-6">
                
                {/* Export Header solo visible en la imagen final si quisieramos, pero lo dejamos clean */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Análisis de la Lista</h2>
                    <p className="text-base sm:text-xl font-black text-brand-red uppercase leading-tight">{partido}</p>
                    {ubicacion && <p className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase mt-1">{ubicacion}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Integrantes</p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-800 leading-none mt-1">{stats.total}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                  
                  {/* Cuota Joven */}
                  <div className="bg-blue-50/50 rounded-xl p-3 sm:p-5 border border-blue-100 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg text-blue-600">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">Cuota Joven</p>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 mt-1">
                      <p className="text-2xl sm:text-4xl font-black text-slate-800 leading-none">{stats.jovenes}</p>
                      <p className="text-[10px] sm:text-sm font-semibold text-slate-500 leading-tight">cand. <br className="hidden sm:block"/>&lt; 30 años</p>
                    </div>
                  </div>

                  {/* Semáforo de Sentencias */}
                  <div className={`rounded-xl p-3 sm:p-5 border flex flex-col justify-center ${
                    stats.conSentencias > 0 
                      ? "bg-red-50 border-red-200" 
                      : "bg-emerald-50 border-emerald-200"
                  }`}>
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${stats.conSentencias > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {stats.conSentencias > 0 ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" /> : <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </div>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight">Sentencias</p>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 mt-1">
                      <p className={`text-2xl sm:text-4xl font-black leading-none ${stats.conSentencias > 0 ? "text-red-700" : "text-emerald-700"}`}>
                        {stats.conSentencias}
                      </p>
                      <p className="text-[10px] sm:text-sm font-semibold text-slate-500 leading-tight">
                        cand. <br className="hidden sm:block"/>alertas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Experiencia Política */}
                <div className="bg-purple-50/30 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experiencia Política</h4>
                    </div>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-none font-bold">
                      {stats.conExpPolitica} candidatos
                    </Badge>
                  </div>
                  
                  {stats.politicos.length > 0 ? (
                    <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-200">
                      {stats.politicos.map((pol, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm gap-1">
                          <span className="text-sm font-bold text-slate-700 capitalize">{pol.nombre.toLowerCase()}</span>
                          <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded truncate max-w-[200px] uppercase">
                            {pol.cargo}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white rounded-lg border border-slate-100 mt-4">
                      <p className="text-slate-500 text-sm font-medium">Lista de total renovación</p>
                      <p className="text-xs text-slate-400 mt-1">Ninguno registra cargos políticos previos.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Footer Sticky */}
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end sticky bottom-0 z-10 rounded-b-2xl">
              <button 
                onClick={handleShare}
                disabled={isExporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 shadow-md"
              >
                {isExporting ? <span className="animate-pulse">Generando Imagen...</span> : (
                  <>
                    {typeof navigator !== "undefined" && !!navigator.share ? <Share2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    Compartir Radiografía
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
// Solo para compilar si no tienes Badge exportado así en este archivo:
// Importamos localmente un componente Badge simple si falla la importación arriba
function Badge({ children, className }: any) {
  return <span className={`px-2 py-0.5 rounded text-[10px] ${className}`}>{children}</span>;
}
