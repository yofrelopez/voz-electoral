import { getCabezasDeLista } from "@/actions/candidatos";
import { BuscadorCandidatos } from "@/components/BuscadorCandidatos";

export default async function Home() {
  // Traemos los Gobernadores Regionales pre-renderizados en el servidor
  const initialData = await getCabezasDeLista("REGIONAL");

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans">
      <main className="flex-1 w-full max-w-6xl mx-auto py-6 md:py-10 px-4 sm:px-6">
        {/* Buscador Principal (Directo al Grano) */}
        <section className="space-y-6">
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
