"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Briefcase, GraduationCap, Building, AlertTriangle, Shield, CheckCircle2, FileText, Users, Download, ChevronRight, ChevronDown, Sparkles } from "lucide-react";
import { TeamDashboard } from "./TeamDashboard";
import Link from "next/link";
import { CandidateImage } from "@/components/CandidateImage";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type Tab = "perfil" | "plan" | "equipo";

export function CandidateTabs({ 
  candidato, 
  planGobierno, 
  equipo 
}: { 
  candidato: any; 
  planGobierno: any; 
  equipo: any[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("perfil");
  const [openDims, setOpenDims] = useState<Record<string, boolean>>({});

  const edu = candidato.formacion_academica as any;
  const exp = (candidato.experiencia_laboral as any[]) || [];
  const bienes = (candidato.bienes_rentas || candidato.bienes_y_rentas) as any;
  const sentencias = candidato.sentencias as any;
  const cargosPoliticos = candidato.cargos_y_renuncias as any;

  const sentenciasPenales = sentencias?.sentencias_penales || [];
  const sentenciasObligaciones = sentencias?.sentencias_obligaciones || [];
  const tieneSentencias = sentenciasPenales.length > 0 || sentenciasObligaciones.length > 0;

  const isRegional = candidato?.cargo?.toUpperCase().includes('GOBERNADOR') || candidato?.cargo?.toUpperCase().includes('CONSEJERO');

  const destacados = equipo.filter(eq => {
    const c = eq.cargo?.toUpperCase() || '';
    return c.includes('VICEGOBERNADOR') || c.includes('TENIENTE ALCALDE');
  });
  
  const titulares = equipo.filter(eq => {
    const c = eq.cargo?.toUpperCase() || '';
    return (c.includes('CONSEJERO') || c.includes('REGIDOR')) && !c.includes('ACCESITARIO') && !destacados.includes(eq);
  });

  let startIndexTitulares = 1;
  if (!isRegional && destacados.length === 0 && titulares.length > 0) {
    const primerRegidor = titulares.shift(); // Extraer el número 1
    if (primerRegidor) {
      primerRegidor.cargoManual = "TENIENTE ALCALDE (REGIDOR N° 1)";
      destacados.push(primerRegidor);
      startIndexTitulares = 2; // El resto empieza en 2
    }
  }

  const accesitarios = equipo.filter(eq => {
    const c = eq.cargo?.toUpperCase() || '';
    return c.includes('ACCESITARIO');
  });

  const formatUbicacion = () => {
    const cargo = candidato?.cargo?.toUpperCase() || '';
    const ubi = candidato?.distrito || candidato?.provincia || candidato?.departamento || '';
    if (!ubi) return '';
    if (cargo.includes('GOBERNADOR') || cargo.includes('CONSEJERO')) return `Región ${ubi}`;
    if (cargo.includes('PROVINCIAL')) return `Provincia de ${ubi}`;
    if (cargo.includes('DISTRITAL')) return `Distrito de ${ubi}`;
    if (ubi.toUpperCase() === 'LIMA') return 'Región Lima'; // Fallback for Lima just in case
    return ubi;
  };

  const capitalize = (str: string) => {
    if (!str) return "";
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const totalIngresos = bienes?.ingresos?.reduce((acc: number, val: any) => {
    return acc + (val.remuBrutaPublico || 0) + (val.remuBrutaPrivado || 0) + (val.rentaIndividualPublico || 0) + (val.rentaIndividualPrivado || 0) + (val.otroIngresoPublico || 0) + (val.otroIngresoPrivado || 0);
  }, 0) || 0;

  const totalMuebles = bienes?.bienes_muebles?.reduce((acc: number, val: any) => acc + (val.valor || 0), 0) || 0;
  const totalInmuebles = bienes?.bienes_inmuebles?.reduce((acc: number, val: any) => acc + (val.autovaluo || 0), 0) || 0;

  return (
    <div className="w-full space-y-6">
      
      {/* Navegación de Pestañas */}
      <div className="border-b border-slate-200 w-full">
        <div className="grid grid-cols-3 w-full">
          <button
            onClick={() => setActiveTab("perfil")}
            className={cn(
              "pb-4 text-xs md:text-sm font-semibold transition-all relative whitespace-nowrap text-center",
              activeTab === "perfil" ? "text-brand-red" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Hoja de Vida
            {activeTab === "perfil" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red rounded-t-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("plan")}
            className={cn(
              "pb-4 text-xs md:text-sm font-semibold transition-all relative whitespace-nowrap text-center",
              activeTab === "plan" ? "text-brand-red" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Plan de Gob.
            {activeTab === "plan" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red rounded-t-full" />
            )}
          </button>

          {equipo.length > 0 ? (
            <button
              onClick={() => setActiveTab("equipo")}
              className={cn(
                "pb-4 text-xs md:text-sm font-semibold transition-all relative whitespace-nowrap text-center flex justify-center items-center gap-1",
                activeTab === "equipo" ? "text-brand-red" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <span>{isRegional ? 'Consejeros' : 'Regidores'}</span>
              <span className="bg-slate-100 text-slate-600 text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full">{equipo.length}</span>
              {activeTab === "equipo" && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red rounded-t-full" />
              )}
            </button>
          ) : (
            <div className="pb-4"></div> /* Espaciador si no hay equipo para mantener el grid-cols-3 (opcional, aunque lo ideal es que siempre ocupe el espacio, o si no hay equipo cambiar a cols-2) */
          )}
        </div>
      </div>

      {/* Contenido de Pestañas */}
      <div className="pt-2">
        <AnimatePresence mode="wait">
          
          {/* PESTAÑA 1: PERFIL */}
          {activeTab === "perfil" && (
            <motion.div 
              key="perfil"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 md:space-y-8"
            >
              {/* Alerta de Sentencias */}
              {tieneSentencias ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 md:p-6 rounded-r-lg shadow-sm flex flex-col md:flex-row gap-4 items-start">
                  <div className="bg-red-100 p-2 rounded-full shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-red-800 font-bold text-lg mb-2">Registra Sentencias Declaradas</h3>
                    <div className="space-y-3 mt-3">
                      {sentenciasPenales.map((s: any, i: number) => (
                        <div key={`penal-${i}`} className="bg-white/60 p-4 rounded-md border border-red-200/50">
                          <span className="font-bold text-red-800 text-sm block mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Penal: {s.txDelitoPenal || s.delitoPenal}
                          </span>
                          <span className="text-slate-600 text-xs leading-relaxed block">Fallo: {s.txFalloPenal || s.falloPenal} {s.txModalidad ? `(${s.txModalidad})` : ''}</span>
                        </div>
                      ))}
                      {sentenciasObligaciones.map((s: any, i: number) => (
                        <div key={`obli-${i}`} className="bg-white/60 p-4 rounded-md border border-red-200/50">
                          <span className="font-bold text-red-800 text-sm block mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Obligación ({s.txMateriaSentencia || s.materiaSentencia})
                          </span>
                          <span className="text-slate-600 text-xs leading-relaxed block">Fallo: {s.txFalloObliga || s.falloObliga}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-center gap-3 text-emerald-700 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium">No registra sentencias penales ni de obligaciones declaradas.</span>
                </div>
              )}

              {/* Bienes y Rentas (Visualización Detallada) */}
              <Card className="border-slate-200 overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-slate-600" />
                    <CardTitle className="text-lg">Patrimonio Declarado</CardTitle>
                  </div>
                </CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  <div className="p-4 sm:p-6 text-center">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Ingresos Anuales</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">S/ {totalIngresos.toLocaleString()}</p>
                  </div>
                  <div className="p-4 sm:p-6 text-center">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Autos (Muebles)</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">S/ {totalMuebles.toLocaleString()}</p>
                  </div>
                  <div className="p-4 sm:p-6 text-center">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Casas (Inmuebles)</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">S/ {totalInmuebles.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50">
                  <details className="group">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 transition-colors font-semibold text-sm text-slate-700">
                      <span>Detalle de Ingresos ({bienes?.ingresos?.length || 0} registros)</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                      {bienes?.ingresos?.length > 0 ? bienes.ingresos.map((ing: any, i: number) => (
                        <div key={i} className="text-sm flex flex-col gap-1 pb-3 border-b last:border-0 border-slate-100">
                          <div className="flex justify-between"><span className="text-slate-500">Sector Público:</span> <span className="font-medium">S/ {((ing.remuBrutaPublico || 0) + (ing.rentaIndividualPublico || 0) + (ing.otroIngresoPublico || 0)).toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Sector Privado:</span> <span className="font-medium">S/ {((ing.remuBrutaPrivado || 0) + (ing.rentaIndividualPrivado || 0) + (ing.otroIngresoPrivado || 0)).toLocaleString()}</span></div>
                        </div>
                      )) : <p className="text-sm text-slate-500 italic">No declara ingresos detallados.</p>}
                    </div>
                  </details>
                  
                  <details className="group">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 transition-colors font-semibold text-sm text-slate-700">
                      <span>Bienes Inmuebles ({bienes?.bienes_inmuebles?.length || 0} registros)</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                      {bienes?.bienes_inmuebles?.length > 0 ? bienes.bienes_inmuebles.map((inm: any, i: number) => (
                        <div key={i} className="text-sm flex flex-col pb-3 border-b last:border-0 border-slate-100">
                          <span className="font-bold text-slate-700">{capitalize(inm.tipoBienInmueble)}</span>
                          <span className="text-slate-600 my-1">{capitalize(inm.inmuebleDireccion)}</span>
                          <div className="flex justify-between mt-1 text-xs">
                            <span className="text-slate-500">Partida: {inm.partidaSunarp || "N/A"}</span>
                            <span className="font-bold text-brand-red">Valor: S/ {(inm.autovaluo || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      )) : <p className="text-sm text-slate-500 italic">No declara bienes inmuebles.</p>}
                    </div>
                  </details>

                  <details className="group">
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-100 transition-colors font-semibold text-sm text-slate-700">
                      <span>Bienes Muebles (Vehículos) ({bienes?.bienes_muebles?.length || 0} registros)</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                      {bienes?.bienes_muebles?.length > 0 ? bienes.bienes_muebles.map((mueb: any, i: number) => (
                        <div key={i} className="text-sm flex flex-col pb-3 border-b last:border-0 border-slate-100">
                          <span className="font-bold text-slate-700">{mueb.caracteristica || "Vehículo"}</span>
                          <div className="flex justify-between mt-1 text-xs">
                            <span className="text-slate-500">Placa: {mueb.placa || "N/A"}</span>
                            <span className="font-bold text-brand-red">Valor: S/ {(mueb.valor || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      )) : <p className="text-sm text-slate-500 italic">No declara bienes muebles.</p>}
                    </div>
                  </details>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Educación */}
                <Card className="border-slate-200">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-slate-600" />
                      <CardTitle className="text-lg">Formación Académica</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {edu?.educacionUniversitaria?.map((u: any, i: number) => (
                      <div key={i} className="flex flex-col">
                        <span className="font-semibold text-slate-900">{capitalize(u.carreraUni)}</span>
                        <span className="text-sm text-slate-600">{capitalize(u.universidad)}</span>
                        {u.concluidoEduUni === "SI" && <Badge variant="secondary" className="w-fit mt-1 text-[10px]">Concluido</Badge>}
                      </div>
                    ))}
                    {(!edu?.educacionUniversitaria || edu.educacionUniversitaria.length === 0) && (
                      <div className="bg-slate-50 rounded-lg p-4 text-center border border-dashed border-slate-200">
                        <span className="text-slate-500 text-sm">No registra educación universitaria.</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Experiencia */}
                <Card className="border-slate-200">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-slate-600" />
                      <CardTitle className="text-lg">Experiencia Laboral</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {exp?.slice(0, 3).map((e: any, i: number) => (
                      <div key={i} className="flex flex-col border-l-2 border-brand-red/30 pl-4 py-1">
                        <span className="font-semibold text-slate-900">{capitalize(e.ocupacionProfesion)}</span>
                        <span className="text-sm text-slate-600">{capitalize(e.centroTrabajo)}</span>
                        <span className="text-xs text-slate-400">{e.anioTrabajoDesde} - {e.anioTrabajoHasta || 'Presente'}</span>
                      </div>
                    ))}
                    {(!exp || exp.length === 0) && (
                      <div className="bg-slate-50 rounded-lg p-4 text-center border border-dashed border-slate-200">
                        <span className="text-slate-500 text-sm">No registra experiencia laboral.</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Trayectoria Política (Cargos y Renuncias) */}
                <Card className="border-slate-200 md:col-span-2">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-slate-600" />
                      <CardTitle className="text-lg">Trayectoria Política</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {cargosPoliticos?.cargos_eleccion?.length > 0 ? (
                      cargosPoliticos.cargos_eleccion.map((c: any, i: number) => (
                        <div key={`elec-${i}`} className="flex flex-col border-l-2 border-brand-red/30 pl-4 py-1">
                          <span className="font-semibold text-slate-900">{capitalize(c.cargoEleccion)}</span>
                          <span className="text-sm text-slate-600">{capitalize(c.orgPolCargoElec)}</span>
                          <span className="text-xs text-slate-400">{c.anioCargoElecDesde} - {c.anioCargoElecHasta}</span>
                        </div>
                      ))
                    ) : cargosPoliticos?.cargos_partidarios?.length > 0 ? (
                      cargosPoliticos.cargos_partidarios.map((c: any, i: number) => (
                        <div key={`part-${i}`} className="flex flex-col border-l-2 border-slate-300 pl-4 py-1">
                          <span className="font-semibold text-slate-900">{capitalize(c.cargoPartidario)}</span>
                          <span className="text-sm text-slate-600">{capitalize(c.orgPolCargoPartidario)}</span>
                          <span className="text-xs text-slate-400">{c.anioCargoPartiDesde} - {c.anioCargoPartiHasta}</span>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-50 rounded-lg p-4 text-center border border-dashed border-slate-200">
                        <span className="text-slate-500 text-sm">No registra cargos políticos previos.</span>
                      </div>
                    )}
                    {cargosPoliticos?.renuncias?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-700 mb-3">Renuncias Efectuadas</h4>
                        {cargosPoliticos.renuncias.map((r: any, i: number) => (
                          <div key={`ren-${i}`} className="flex flex-col border-l-2 border-slate-300 pl-4 py-1 mb-2">
                            <span className="font-semibold text-slate-900">{capitalize(r.orgPolRenuncia)}</span>
                            <span className="text-sm text-slate-600">Año de renuncia: {r.anioRenunciaOp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Información Adicional */}
              {candidato.info_adicional?.length > 0 && (
                <Card className="border-slate-200 mt-6 bg-slate-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Información Adicional Declarada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {candidato.info_adicional.map((info: any, i: number) => (
                      <div key={`info-${i}`} className="text-sm text-slate-600 bg-white p-3 rounded border border-slate-100 shadow-sm">
                        {info.infoAdicional}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Botón Descargar Hoja de Vida PDF */}
              {candidato.hoja_vida_url && (
                <div className="mt-8 flex justify-center">
                  <a 
                    href={candidato.hoja_vida_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Hoja de Vida (PDF)
                  </a>
                </div>
              )}
            </motion.div>
          )}

          {/* PESTAÑA 2: PLAN DE GOBIERNO */}
          {activeTab === "plan" && (
            <motion.div 
              key="plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {planGobierno ? (
                <div className="space-y-6">
                  
                  {/* Botón Descarga Plan */}
                  {candidato.plan_gobierno_url && (
                    <div className="flex justify-end mb-2">
                      <a 
                        href={candidato.plan_gobierno_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 hover:text-brand-red hover:bg-brand-red/5 rounded-md transition-colors font-medium border border-transparent hover:border-brand-red/20"
                      >
                        <Download className="w-4 h-4" />
                        Ver PDF Original
                      </a>
                    </div>
                  )}

                  {/* Resumen IA (Fase 2) */}
                  <Card className="border-brand-red/20 border-2 shadow-sm bg-gradient-to-br from-white to-brand-red/5">
                    <CardHeader className="border-b border-brand-red/10 pb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-red" />
                        <CardTitle className="text-lg text-brand-red-dark">Resumen Rápido (IA)</CardTitle>
                      </div>
                      <CardDescription>Lo más importante del plan extraído por inteligencia artificial.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {planGobierno.resumen_ia ? (
                        <div className="prose prose-sm max-w-none text-slate-700">
                          <ReactMarkdown
                            components={{
                              p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                              ul: ({node, ...props}) => <ul className="space-y-4 mb-4" {...props} />,
                              li: ({node, ...props}) => (
                                <li className="flex items-start gap-3">
                                  <div className="mt-1 bg-brand-red/10 p-1.5 rounded-full shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-brand-red" />
                                  </div>
                                  <span className="leading-relaxed" {...props} />
                                </li>
                              ),
                              strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />
                            }}
                          >
                            {planGobierno.resumen_ia}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="animate-pulse space-y-6">
                          <div className="space-y-3">
                            <div className="h-4 bg-brand-red/20 rounded w-1/4"></div>
                            <div className="h-3 bg-brand-red/10 rounded w-full"></div>
                            <div className="h-3 bg-brand-red/10 rounded w-5/6"></div>
                          </div>
                        </div>
                      )}
                      <div className="mt-6 flex items-center justify-between text-sm text-slate-500 italic bg-white/50 p-4 rounded-lg border border-brand-red/10">
                        <span>Recomendamos contrastar con el documento oficial del JNE.</span>
                        <span className="px-2 py-1 bg-brand-red/10 rounded-md border border-brand-red/20 text-xs font-semibold text-brand-red">IA</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Formato Resumen Oficial del JNE */}
                  <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span> Formato Resumen Oficial (JNE)
                  </h3>

                  {['social', 'institucional', 'economica', 'territorial_ambiental'].map((dim) => {
                    const data = planGobierno[`dimension_${dim}`];
                    const isEmpty = !data || data.length === 0;
                    const isOpen = openDims[dim] || false;
                    
                    return (
                      <Card key={dim} className="border-slate-200 shadow-sm overflow-hidden mb-4">
                        <button 
                          onClick={() => setOpenDims(prev => ({ ...prev, [dim]: !prev[dim] }))}
                          className="w-full bg-slate-100/80 hover:bg-slate-200/70 transition-colors px-5 py-4 flex items-center justify-between outline-none group"
                        >
                          <h4 className="font-bold text-slate-700 uppercase tracking-wide text-sm text-left">Dimensión {dim.replace('_', ' ')}</h4>
                          <div className="bg-white rounded-full p-1 shadow-sm border border-slate-200 group-hover:border-slate-300 transition-colors">
                            {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden border-t border-slate-200 origin-top"
                            >
                              {isEmpty ? (
                                <div className="p-6 text-center bg-white">
                                  <p className="text-slate-500 text-sm italic">El candidato o su partido político no registró información estructurada en esta dimensión ante el JNE.</p>
                                </div>
                              ) : (
                                <div className="divide-y divide-slate-100">
                                  {data.map((item: any, idx: number) => (
                                  <div key={idx} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white hover:bg-slate-50 transition-colors">
                                    <div className="space-y-4">
                                      <div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Problemas Identificados:</span>
                                        <p className="text-sm text-slate-800 font-medium leading-relaxed">{item.txPgProblema}</p>
                                      </div>
                                      <div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Indicador:</span>
                                        <p className="text-sm text-slate-700">{item.txPgIndicador}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Objetivo:</span>
                                        <p className="text-sm text-slate-800 font-bold leading-relaxed">{item.txPgObjetivo}</p>
                                      </div>
                                      <div>
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Meta:</span>
                                        <p className="text-sm text-brand-red font-semibold">{item.txPgMeta}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-12 text-center border border-dashed border-slate-200 flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700">No hay plan de gobierno disponible</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">Este candidato no ha presentado un plan de gobierno o pertenece a una lista que no lo requiere para su cargo específico.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* PESTAÑA 3: EQUIPO */}
          {activeTab === "equipo" && equipo.length > 0 && (
            <motion.div 
              key="equipo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-end mb-1 sm:mb-2 -mt-3 sm:mt-1">
                <TeamDashboard 
                  equipo={equipo} 
                  partido={candidato?.partido_politico} 
                  ubicacion={formatUbicacion()} 
                />
              </div>
              <Card className="border-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3 pt-4 px-5 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base md:text-lg text-slate-800 flex items-center gap-2">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-brand-red" />
                      {isRegional ? 'Fórmula y Consejeros' : 'Regidores'}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm mt-1">
                      {isRegional ? 'Candidato a Vicegobernador y lista de Consejeros Regionales.' : 'Lista de candidatos a Regidores (incluyendo Teniente Alcalde).'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-white whitespace-nowrap ml-4">
                    {equipo.length} Total
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-8">
                  
                  {/* Destacados (Vicegobernador / Teniente Alcalde) */}
                  {destacados.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Fórmula / Principal</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {destacados.map((eq: any) => (
                          <Link key={eq.id_hoja_vida} href={`/candidato/${eq.id_hoja_vida}`}>
                            <div className="p-4 border-2 border-brand-red/10 rounded-xl hover:border-brand-red/40 hover:bg-slate-50 transition-all flex items-center gap-4 group bg-white shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">N° 1</div>
                              <CandidateImage 
                                idHojaVida={eq.id_hoja_vida} 
                                nombre={eq.nombre_completo}
                                className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200 relative"
                                iconClassName="w-8 h-8"
                              />
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-sm md:text-base font-bold text-slate-900 truncate group-hover:text-brand-red transition-colors capitalize">{eq.nombre_completo.toLowerCase()}</span>
                                <span className="text-[10px] font-bold text-brand-red truncate bg-brand-red/5 w-fit px-2 py-0.5 rounded mt-1 uppercase">{eq.cargoManual || eq.cargo}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Titulares (Consejeros / Regidores) */}
                  {titulares.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Titulares</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {titulares.map((eq: any, index: number) => {
                          const numero = isRegional ? index + 1 : index + startIndexTitulares;
                          return (
                          <Link key={eq.id_hoja_vida} href={`/candidato/${eq.id_hoja_vida}`}>
                            <div className="p-3 border border-slate-200 rounded-lg hover:border-brand-red/30 hover:bg-slate-50 transition-colors flex items-center gap-3 group bg-white relative">
                              <div className="absolute top-0 left-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg rounded-tl-lg group-hover:bg-brand-red/10 group-hover:text-brand-red transition-colors">
                                N° {numero}
                              </div>
                              <CandidateImage 
                                idHojaVida={eq.id_hoja_vida} 
                                nombre={eq.nombre_completo}
                                className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200 relative mt-2 md:mt-0"
                                iconClassName="w-5 h-5"
                              />
                              <div className="flex flex-col overflow-hidden w-full mt-2 md:mt-0">
                                <span className="text-xs font-bold text-slate-800 truncate capitalize group-hover:text-brand-red transition-colors">{eq.nombre_completo.toLowerCase()}</span>
                                <span className="text-[10px] text-slate-500 font-medium truncate uppercase">
                                  {eq.cargo}
                                  {eq.cargo?.toUpperCase().includes('CONSEJERO') && eq.provincia ? ` - ${eq.provincia}` : ''}
                                </span>
                              </div>
                            </div>
                          </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Accesitarios */}
                  {accesitarios.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Accesitarios</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {accesitarios.map((eq: any) => (
                          <Link key={eq.id_hoja_vida} href={`/candidato/${eq.id_hoja_vida}`}>
                            <div className="p-2 border border-slate-100 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-2.5 group bg-slate-50/50 grayscale hover:grayscale-0 opacity-80 hover:opacity-100">
                              <CandidateImage 
                                idHojaVida={eq.id_hoja_vida} 
                                nombre={eq.nombre_completo}
                                className="w-9 h-9 rounded-full overflow-hidden bg-white flex-shrink-0 flex items-center justify-center border border-slate-200 relative"
                                iconClassName="w-4 h-4 text-slate-400"
                              />
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-[11px] font-semibold text-slate-700 truncate capitalize">{eq.nombre_completo.toLowerCase()}</span>
                                <span className="text-[9px] text-slate-400 truncate uppercase">
                                  {eq.cargo}
                                  {eq.cargo?.toUpperCase().includes('CONSEJERO') && eq.provincia ? ` - ${eq.provincia}` : ''}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
