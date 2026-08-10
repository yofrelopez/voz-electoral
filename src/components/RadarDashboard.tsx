"use client";

import React, { useRef, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toPng } from "html-to-image";
import { Download, Share2, AlertTriangle, Users, Map, Trophy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export function RadarDashboard({ data }: { data: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("movilizacion");
  const [showAllParties, setShowAllParties] = useState(false);
  
  // Use a smaller YAxis width on mobile
  const [yAxisWidth, setYAxisWidth] = useState(130);
  const [isMobile, setIsMobile] = useState(true);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 640;
      setIsMobile(mobile);
      setYAxisWidth(mobile ? 130 : 250);
    };
    handleResize(); // initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sort data for each view
  const topMovilizacion = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.totalListas - a.totalListas);
    return showAllParties ? sorted : sorted.slice(0, 10);
  }, [data, showAllParties]);

  const topSentencias = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.sentencias - a.sentencias);
    return showAllParties ? sorted : sorted.slice(0, 10);
  }, [data, showAllParties]);

  // Calculate dynamic height
  const currentDataLength = activeTab === "movilizacion" ? topMovilizacion.length : topSentencias.length;
  const chartHeight = showAllParties ? (currentDataLength * (isMobile ? 60 : 50) + 100) : (isMobile ? 650 : 500);

  const handleExport = async (share: boolean = false) => {
    if (!containerRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(containerRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff"
      });
      
      if (share && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `radar-electoral.png`, { type: 'image/png' });
        
        // Copiar enlace al portapapeles como respaldo
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (e) {
          console.log("No se pudo copiar al portapapeles automáticamente");
        }

        await navigator.share({
          title: 'Radar Electoral',
          text: `Mira el ranking de partidos políticos en Voz Electoral 2026\n\n${window.location.href}`,
          url: window.location.href,
          files: [file]
        });
      } else {
        const link = document.createElement("a");
        link.download = `radar-electoral.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error("Error exporting image", err);
    } finally {
      setIsExporting(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    const stopEvent = (e: any) => {
      e.stopPropagation();
      if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
        e.nativeEvent.stopImmediatePropagation();
      }
    };

    if (active && payload && payload.length) {
      if (activeTab === "movilizacion") {
        const total = payload.reduce((acc: number, item: any) => acc + (item.value || 0), 0);
        return (
          <div 
            onPointerDown={stopEvent}
            onPointerMove={stopEvent}
            onPointerUp={stopEvent}
            onTouchStart={stopEvent}
            onTouchMove={stopEvent}
            onTouchEnd={stopEvent}
            onMouseDown={stopEvent}
            onMouseMove={stopEvent}
            onMouseUp={stopEvent}
            onClick={stopEvent}
            className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs sm:text-sm border border-slate-700 max-w-[200px] sm:min-w-[200px] whitespace-normal"
          >
            <p className="font-bold mb-2 border-b border-slate-700 pb-2 leading-tight">{label}</p>
            <p className="text-white font-black text-base sm:text-lg mb-2">Total: {total} Listas</p>
            <div className="space-y-1 text-[10px] sm:text-xs">
              {payload.map((item: any, idx: number) => {
                if (item.value > 0) {
                  return (
                    <div key={idx} className="flex justify-between items-center gap-4">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        {item.name}
                      </span>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        );
      }

      if (activeTab === "sentencias") {
        const data = payload[0].payload;
        return (
          <div 
            onPointerDown={stopEvent}
            onPointerMove={stopEvent}
            onPointerUp={stopEvent}
            onTouchStart={stopEvent}
            onTouchMove={stopEvent}
            onTouchEnd={stopEvent}
            onMouseDown={stopEvent}
            onMouseMove={stopEvent}
            onMouseUp={stopEvent}
            onClick={stopEvent}
            className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs sm:text-sm border border-slate-700 max-w-[220px] sm:max-w-[280px] whitespace-normal"
          >
            <p className="font-bold mb-2 border-b border-slate-700 pb-2 leading-tight text-slate-200">{label}</p>
            <p className="text-white font-black text-base sm:text-lg mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              {data.sentencias} {data.sentencias === 1 ? 'Candidato' : 'Candidatos'}
            </p>
            {data.candidatosSentenciados && data.candidatosSentenciados.length > 0 && (
              <div className="space-y-2 mt-3 max-h-[160px] overflow-y-auto pr-2 pointer-events-auto">
                {data.candidatosSentenciados.map((c: any, idx: number) => (
                  <div key={idx} className="bg-slate-800/80 p-2 rounded-md border border-slate-700/50">
                    <p className="font-bold text-[10px] sm:text-xs text-red-400 leading-tight mb-0.5">{c.nombre}</p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">
                      {c.cargo} {c.distrito ? `(${c.distrito})` : c.provincia ? `(${c.provincia})` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      return null;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Filtros (Tabs) */}
        <div className="flex w-full md:w-auto p-1 bg-slate-100/80 rounded-lg">
            <button 
              onClick={() => setActiveTab("movilizacion")}
              className={`flex-1 md:flex-none flex justify-center items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${activeTab === 'movilizacion' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users className="w-3.5 h-3.5 hidden sm:block" /> Listas Inscritas
            </button>
            <button 
              onClick={() => setActiveTab("sentencias")}
              className={`flex-1 md:flex-none flex justify-center items-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-md transition-all ${activeTab === 'sentencias' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5 hidden sm:block" /> Sentencias
            </button>
        </div>
        
        {/* Acciones (Exportar) */}
        <div className="flex items-center justify-end gap-1 sm:gap-3 w-full md:w-auto">
          <button
            onClick={() => handleExport(false)}
            disabled={isExporting}
            title="Descargar"
            className="flex items-center justify-center gap-1.5 p-2 sm:px-2 sm:py-1 text-slate-500 hover:text-slate-900 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Descargar</span>
          </button>
          <button
            onClick={() => handleExport(true)}
            disabled={isExporting}
            title="Compartir"
            className="flex items-center justify-center gap-1.5 p-2 sm:px-2 sm:py-1 text-slate-500 hover:text-brand-red rounded-md text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Share2 className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Compartir</span>
          </button>
        </div>
      </div>

      {/* Exportable Container */}
      <div ref={containerRef} className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-slate-200">
        
        {/* Header inside export */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{showAllParties ? "Todos los Partidos" : "Top 10 Partidos"}</h2>
            </div>
            <h3 className="text-lg sm:text-3xl font-black text-slate-900 leading-tight">
              {activeTab === "movilizacion" && "Capacidad de Movilización"}
              {activeTab === "sentencias" && "Ranking Rojo de Sentencias"}
            </h3>
            <p className="text-[10px] sm:text-sm text-slate-500 mt-0.5 max-w-sm">
              {activeTab === "movilizacion" && "Partidos con la mayor cantidad de listas inscritas en la región."}
              {activeTab === "sentencias" && "Partidos que acumulan la mayor cantidad de candidatos con sentencias declaradas."}
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <img src="/logo-horizontal.png" alt="Voz Electoral" className="h-8 opacity-50" />
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: chartHeight, WebkitTapHighlightColor: 'transparent' }} className="w-full transition-all duration-500 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none">
          <ResponsiveContainer width="100%" height="100%" className="outline-none">
            <BarChart
              data={
                activeTab === "movilizacion" ? topMovilizacion : topSentencias
              }
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              style={{ outline: 'none' }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="partido" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                width={yAxisWidth}
              />
              <Tooltip 
                cursor={false} 
                content={<CustomTooltip />} 
                allowEscapeViewBox={{ x: false, y: true }}
                wrapperStyle={{ zIndex: 50, pointerEvents: 'auto' }}
                position={isMobile ? { x: 80 } : undefined}
              />
              
              {activeTab === "movilizacion" ? (
                <>
                  <Bar dataKey="listasRegionales" name="Lista Regional" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} barSize={32} activeBar={false} />
                  <Bar dataKey="listasProvinciales" name="Listas Provinciales" stackId="a" fill="#1e3a8a" radius={[0, 0, 0, 0]} barSize={32} activeBar={false} />
                  <Bar dataKey="listasDistritales" name="Listas Distritales" stackId="a" fill="#64748b" radius={[0, 4, 4, 0]} barSize={32} activeBar={false} />
                </>
              ) : (
                <Bar 
                  dataKey="sentencias"
                  name="Candidatos con sentencias"
                  radius={[0, 4, 4, 0]} 
                  barSize={32}
                  activeBar={false}
                >
                  {
                    topSentencias.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill="#ef4444" 
                      />
                    ))
                  }
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Toggle Button Inside Export Container */}
        <div className="flex justify-center mt-2 mb-2">
          <button
            onClick={() => setShowAllParties(!showAllParties)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full text-[11px] sm:text-xs font-semibold transition-colors"
          >
            {showAllParties ? "Ocultar resto (Top 10)" : "Ver todos los partidos inscritos"}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={showAllParties ? "rotate-180 transition-transform" : "transition-transform"}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
        
        {/* Footer inside export */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
          <p>Fuente: Jurado Nacional de Elecciones (JNE)</p>
          <p>Generado en Voz Electoral 2026</p>
        </div>

      </div>
    </div>
  );
}
