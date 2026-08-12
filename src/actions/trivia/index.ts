"use server";

import { NivelGeografico, TriviaQuestion } from "./types";
import { 
  generarPreguntaPatrimonio, 
  generarPreguntaSentencias, 
  generarPreguntaEducacion,
  generarPreguntaProfesionales,
  generarPreguntaJovenes,
  generarPreguntaReeleccion,
  generarPreguntaOcupacion,
  generarPreguntaNivelAcademico
} from "./generators";

export async function getTriviaSession(nivel: NivelGeografico): Promise<TriviaQuestion[]> {
  const session: TriviaQuestion[] = [];
  const MAX_INTENTOS = 20; // Reducimos intentos porque ahora somos más eficientes descartando
  let intentos = 0;

  const allGenerators = [
    // Preguntas "raras" duplicadas para mayor probabilidad de selección inicial
    { fn: generarPreguntaSentencias, category: 'alerta', deterministic: false, type: 'sentencias' },
    { fn: generarPreguntaSentencias, category: 'alerta', deterministic: false, type: 'sentencias' },
    { fn: generarPreguntaOcupacion, category: 'positivo', deterministic: true, type: 'ocupacion' },
    { fn: generarPreguntaOcupacion, category: 'positivo', deterministic: true, type: 'ocupacion' },
    
    // Preguntas estándar
    { fn: generarPreguntaEducacion, category: 'alerta', deterministic: false, type: 'educacion' },
    { fn: generarPreguntaReeleccion, category: 'alerta', deterministic: true, type: 'reeleccion' },
    { fn: generarPreguntaProfesionales, category: 'positivo', deterministic: true, type: 'profesionales' },
    { fn: generarPreguntaJovenes, category: 'positivo', deterministic: true, type: 'jovenes' },
    { fn: generarPreguntaPatrimonio, category: 'neutral', deterministic: false, type: 'patrimonio' },
    { fn: generarPreguntaNivelAcademico, category: 'positivo', deterministic: false, type: 'nivel_academico' },
  ];

  const failedFns = new Set<Function>();

  while (session.length < 5 && intentos < MAX_INTENTOS) {
    let counts = {
      alerta: session.filter(q => ['sentencias', 'educacion', 'reeleccion'].includes(q.type)).length,
      positivo: session.filter(q => ['profesionales', 'jovenes', 'ocupacion', 'nivel_academico'].includes(q.type)).length,
      neutral: session.filter(q => ['patrimonio'].includes(q.type)).length,
    };

    // Filtramos los generadores que ya fallaron (no hay datos en este distrito)
    let pool = allGenerators.filter(g => !failedFns.has(g.fn));

    // Filtramos los generadores cuyo tipo ya está en la sesión (para que no se repitan temas)
    pool = pool.filter(g => !session.some(q => q.type === g.type));

    // Lógica de cuotas (Equilibrio Forzado)
    let quotaPool = [];
    if (counts.alerta < 2) quotaPool.push(...pool.filter(g => g.category === 'alerta'));
    if (counts.positivo < 2) quotaPool.push(...pool.filter(g => g.category === 'positivo'));
    if (counts.neutral < 1) quotaPool.push(...pool.filter(g => g.category === 'neutral'));

    if (quotaPool.length > 0) {
      pool = quotaPool;
    }

    if (pool.length === 0) break; // Si no hay más generadores posibles, salimos

    const randomGen = pool[Math.floor(Math.random() * pool.length)];
    const pregunta = await randomGen.fn(nivel);
    
    if (!pregunta) {
      // Falló por falta de datos o empates. Lo marcamos para no volver a intentarlo inútilmente.
      failedFns.add(randomGen.fn);
    } else {
      // Para los no-deterministas que pueden repetirse, evitamos que salga exactamente el mismo ganador
      const correctOptionId = pregunta.options.find(o => o.isCorrect)?.id;
      const isDuplicateWinner = session.some(p => p.type === pregunta.type && p.options.find(o => o.isCorrect)?.id === correctOptionId);
      
      if (!isDuplicateWinner) {
        session.push(pregunta);
      }
    }
    
    intentos++;
  }

  // Shuffle final
  session.sort(() => Math.random() - 0.5);

  return session;
}
