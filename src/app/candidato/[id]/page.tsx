import { getCandidatoById, getEquipoByExpediente } from "@/actions/candidatos";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { CandidateImage } from "@/components/CandidateImage";
import { CandidateTabs } from "@/components/CandidateTabs";
import { ShareButton } from "@/components/ShareButton";

import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const data = await getCandidatoById(parseInt(params.id));
  
  if (!data) return { title: 'Candidato No Encontrado' };
  
  const { candidato } = data;
  const nombreCompleto = candidato.nombre_completo;
  const titulo = `${nombreCompleto} - ${candidato.partido_politico}`;
  const descripcion = `Conoce la hoja de vida, historial y plan de gobierno de ${nombreCompleto} (${candidato.partido_politico}) en Voz Electoral 2026.`;
  
  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      images: [
        {
          url: `/og/candidato/${params.id}.png?t=${Date.now()}`,
          width: 1200,
          height: 630,
          type: "image/png",
        }
      ],
    },
  };
}

export default async function CandidatoProfile(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const data = await getCandidatoById(parseInt(params.id));

  if (!data) {
    notFound();
  }

  const { candidato, planGobierno } = data;

  // Traer al equipo
  const equipo = candidato.expediente ? await getEquipoByExpediente(candidato.expediente, candidato.id_hoja_vida) : [];

  // Helpers para parsear JSONB
  const edu = candidato.formacion_academica as any;
  const exp = (candidato.experiencia_laboral as any[]) || [];
  const bienes = (candidato.bienes_y_rentas) as any;
  const sentencias = candidato.sentencias as any;
  const cargosPoliticos = candidato.cargos_y_renuncias as any;

  const sentenciasPenales = sentencias?.sentencias_penales || [];
  const sentenciasObligaciones = sentencias?.sentencias_obligaciones || [];
  const tieneSentencias = sentenciasPenales.length > 0 || sentenciasObligaciones.length > 0;

  // Separar el equipo: destacamos a los 2 primeros (ej. Teniente Alcalde o Vicegobernador)
  const equipoDestacado = equipo.slice(0, 2);
  const equipoResto = equipo.slice(2);

  const capitalize = (str: string | null) => {
    if (!str) return "";
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const nombreCapitalizado = capitalize(candidato.nombre_completo);

  // Sumar ingresos y bienes
  const totalIngresos = bienes?.ingresos?.reduce((acc: number, val: any) => {
    return acc + (val.remuBrutaPublico || 0) + (val.remuBrutaPrivado || 0) + (val.rentaIndividualPublico || 0) + (val.rentaIndividualPrivado || 0) + (val.otroIngresoPublico || 0) + (val.otroIngresoPrivado || 0);
  }, 0) || 0;

  const totalMuebles = bienes?.bienes_muebles?.reduce((acc: number, val: any) => acc + (val.valor || 0), 0) || 0;
  const totalInmuebles = bienes?.bienes_inmuebles?.reduce((acc: number, val: any) => acc + (val.autovaluo || 0), 0) || 0;

  const logoName = candidato.partido_politico
    .replace(/[^a-zA-Z0-9ñÑ]/g, "_")
    .toUpperCase() + ".jpg";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans pb-20">
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 pt-4 md:pt-6 space-y-6 md:space-y-8">
        
        <div className="space-y-3 md:space-y-4">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-brand-red transition-colors font-medium">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Volver
            </Link>
            <ShareButton 
              title={`${nombreCapitalizado} - Voz Electoral 2026`} 
              text={`Conoce la hoja de vida y plan de gobierno de ${nombreCapitalizado} (${candidato.partido_politico}) en Voz Electoral 2026.`} 
            />
          </div>

          {/* Encabezado del Candidato */}
          <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            {/* Foto del Candidato con Logo de Partido */}
            <div className="relative">
              <CandidateImage idHojaVida={candidato.id_hoja_vida} nombre={nombreCapitalizado} />
              <div className="absolute -bottom-3 -right-3 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg p-1.5 bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={`/simbolos/${logoName}`}
                  alt={candidato.partido_politico}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
            </div>
            
          <div className="space-y-2.5 mt-2 md:mt-0 md:ml-4">
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">{candidato.partido_politico}</Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {nombreCapitalizado}
            </h1>
            <div className="text-base text-slate-600 font-medium">
              Postula para: <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded ml-1 uppercase text-sm tracking-wider">{candidato.cargo}</span>
            </div>
            <p className="text-slate-500 text-sm flex items-center justify-center md:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {capitalize(candidato.departamento)} {candidato.provincia ? ` / ${capitalize(candidato.provincia)}` : ""} {candidato.distrito ? ` / ${capitalize(candidato.distrito)}` : ""}
            </p>
          </div>
        </div>
        </div>

        {/* Tabs de Contenido (Client Component) */}
        <CandidateTabs candidato={candidato} planGobierno={planGobierno} equipo={equipo} />

      </main>
    </div>
  );
}

function UserPlaceholder() {
  return (
    <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
