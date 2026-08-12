export function TriviaProgress({ current, total, score }: { current: number, total: number, score: number }) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="flex justify-between items-end mb-2 px-1">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Pregunta {current} de {total}</span>
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Puntos: {score}</span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
