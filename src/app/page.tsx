import { getCabezasDeLista } from "@/actions/candidatos";
import { BuscadorCandidatos } from "@/components/BuscadorCandidatos";
import { CountdownTimer } from "@/components/CountdownTimer";
import Link from "next/link";

export default async function Home() {
  // Traemos los Gobernadores Regionales pre-renderizados en el servidor
  const initialData = await getCabezasDeLista("REGIONAL");

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans">
      <main className="flex-1 w-full max-w-6xl mx-auto py-6 md:py-10 px-4 sm:px-6">
        {/* Buscador Principal (Directo al Grano) */}
        <section className="space-y-6">
          <CountdownTimer />
          
          {/* Banner Trivia CTA (Estilo Píldora Sutil) */}
          <div className="flex justify-center mt-[-12px] mb-8">
            <Link href="/trivia" className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md hover:bg-slate-50 border border-slate-200/80 px-4 py-1.5 rounded-full shadow-sm hover:shadow transition-all group animate-in fade-in slide-in-from-top-4 duration-500">
              <span className="text-sm">🎮</span>
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-brand-red transition-colors">Juega la Trivia Electoral</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>

          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Catálogo de Candidatos
            </h1>
            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
              Busca, explora y analiza la hoja de vida oficial de los postulantes de Lima Provincias y Barranca.
            </p>
          </div>
          
          <BuscadorCandidatos initialData={initialData} />
        </section>
      </main>
    </div>
  );
}
