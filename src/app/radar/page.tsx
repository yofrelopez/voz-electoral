import { Navbar } from "@/components/ui/Navbar";
import { RadarDashboard } from "@/components/RadarDashboard";
import { db } from "@/db/db";
import { candidatos } from "@/db/schema";
import { sql } from "drizzle-orm";

export const revalidate = 3600; // Cache for 1 hour

export default async function RadarPage() {
  // Execute aggregation query
  const rawData = await db.select({
    partido: candidatos.partido_politico,
    listasRegionales: sql<number>`SUM(CASE WHEN ${candidatos.cargo} = 'GOBERNADOR REGIONAL' THEN 1 ELSE 0 END)::int`,
    listasProvinciales: sql<number>`SUM(CASE WHEN ${candidatos.cargo} = 'ALCALDE PROVINCIAL' THEN 1 ELSE 0 END)::int`,
    listasDistritales: sql<number>`SUM(CASE WHEN ${candidatos.cargo} = 'ALCALDE DISTRITAL' THEN 1 ELSE 0 END)::int`,
    totalDistritos: sql<number>`count(distinct ${candidatos.distrito})::int`,
    totalProvincias: sql<number>`count(distinct ${candidatos.provincia})::int`,
    totalSentencias: sql<number>`SUM(CASE WHEN jsonb_array_length(COALESCE(${candidatos.sentencias}->'sentencias_penales', '[]'::jsonb)) > 0 OR jsonb_array_length(COALESCE(${candidatos.sentencias}->'sentencias_obligaciones', '[]'::jsonb)) > 0 THEN 1 ELSE 0 END)::int`,
    candidatosSentenciados: sql<any[]>`
      COALESCE(
        json_agg(
          json_build_object(
            'nombre', "nombre_completo",
            'cargo', "cargo",
            'provincia', "provincia",
            'distrito', "distrito"
          )
        ) FILTER (
          WHERE jsonb_array_length(COALESCE("sentencias"->'sentencias_penales', '[]'::jsonb)) > 0 
          OR jsonb_array_length(COALESCE("sentencias"->'sentencias_obligaciones', '[]'::jsonb)) > 0
        ), 
        '[]'::json
      )
    `
  })
  .from(candidatos)
  .groupBy(candidatos.partido_politico)
  .orderBy(sql`count(*) desc`);

  // Transform data for the charts
  const data = rawData.map(d => ({
    partido: d.partido,
    listasRegionales: d.listasRegionales,
    listasProvinciales: d.listasProvinciales,
    listasDistritales: d.listasDistritales,
    totalListas: d.listasRegionales + d.listasProvinciales + d.listasDistritales,
    distritos: d.totalDistritos,
    provincias: d.totalProvincias,
    sentencias: d.totalSentencias,
    candidatosSentenciados: d.candidatosSentenciados
  }));

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-8">
        
        <div className="mb-4 md:mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Radar de Partidos</h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500 max-w-2xl mx-auto md:mx-0">
            Descubre qué partidos políticos han logrado inscribir mayor cantidad de listas electorales en la región y lideran los rankings de sentencias.
          </p>
        </div>

        <RadarDashboard data={data} />
        
      </div>
    </main>
  );
}
