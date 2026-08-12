import { cn } from "@/lib/utils";

interface CandidateWealthBadgeProps {
  candidato: any;
  visible: boolean;
}

export function CandidateWealthBadge({ candidato, visible }: CandidateWealthBadgeProps) {
  if (!visible) return null;

  const bienes = candidato.bienes_rentas || candidato.bienes_y_rentas;
  if (!bienes) return null;

  const totalIngresos =
    bienes.ingresos?.reduce((acc: number, val: any) => {
      return (
        acc +
        (val.remuBrutaPublico || 0) +
        (val.remuBrutaPrivado || 0) +
        (val.rentaIndividualPublico || 0) +
        (val.rentaIndividualPrivado || 0) +
        (val.otroIngresoPublico || 0) +
        (val.otroIngresoPrivado || 0)
      );
    }, 0) || 0;

  const totalMuebles =
    bienes.bienes_muebles?.reduce((acc: number, val: any) => acc + (val.valor || 0), 0) || 0;
  
  const totalInmuebles =
    bienes.bienes_inmuebles?.reduce((acc: number, val: any) => acc + (val.autovaluo || 0), 0) || 0;

  const total = totalIngresos + totalMuebles + totalInmuebles;

  if (total === 0) return null;

  // Formato abreviado K/M
  const formatAmount = (num: number) => {
    if (num >= 1000000) {
      return `S/ ${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (num >= 1000) {
      return `S/ ${(num / 1000).toFixed(0)}K`;
    }
    return `S/ ${num}`;
  };

  return (
    <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
      <div className="flex items-center gap-1 bg-emerald-50/90 backdrop-blur-md border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md shadow-sm">
        <span className="text-[10px] md:text-xs font-extrabold tracking-tight">{formatAmount(total)}</span>
      </div>
    </div>
  );
}
