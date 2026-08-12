import { db } from "@/db/db";
import { candidatos } from "@/db/schema";
import { sql, and, eq, ne, isNotNull } from "drizzle-orm";
import { NivelGeografico, TriviaOption, TriviaQuestion } from "./types";

// Helper para construir los filtros geográficos
function buildGeoFilters(nivel: NivelGeografico) {
  const filters = [eq(candidatos.cargo, nivel.cargo)];
  if (nivel.departamento) filters.push(eq(candidatos.departamento, nivel.departamento));
  if (nivel.provincia) filters.push(eq(candidatos.provincia, nivel.provincia));
  if (nivel.distrito) filters.push(eq(candidatos.distrito, nivel.distrito));
  return filters;
}

// Fragmento SQL para calcular patrimonio
const sqlPatrimonio = sql`
  (
    SELECT COALESCE(SUM((i->>'remuBrutaPublico')::numeric + (i->>'remuBrutaPrivado')::numeric + (i->>'rentaIndividualPublico')::numeric + (i->>'rentaIndividualPrivado')::numeric + (i->>'otroIngresoPublico')::numeric + (i->>'otroIngresoPrivado')::numeric), 0)
    FROM jsonb_array_elements(COALESCE(${candidatos.bienes_y_rentas}->'ingresos', '[]'::jsonb)) AS i
  )
  +
  (
    SELECT COALESCE(SUM((m->>'valor')::numeric), 0)
    FROM jsonb_array_elements(COALESCE(${candidatos.bienes_y_rentas}->'bienes_muebles', '[]'::jsonb)) AS m
  )
  +
  (
    SELECT COALESCE(SUM((inm->>'autovaluo')::numeric), 0)
    FROM jsonb_array_elements(COALESCE(${candidatos.bienes_y_rentas}->'bienes_inmuebles', '[]'::jsonb)) AS inm
  )
`;

export async function generarPreguntaPatrimonio(nivel: NivelGeografico): Promise<TriviaQuestion | null> {
  const filters = buildGeoFilters(nivel);
  
  // Buscar 3 candidatos al azar que compitan entre sí
  const result = await db.select({
    id: candidatos.id_hoja_vida,
    nombre: candidatos.nombre_completo,
    partido: candidatos.partido_politico,
    foto: candidatos.foto_url,
    patrimonio: sqlPatrimonio,
  })
  .from(candidatos)
  .where(and(...filters))
  .orderBy(sql`RANDOM()`)
  .limit(3);

  if (result.length < 3) return null; // No hay suficientes oponentes

  // Determinar quién tiene el mayor patrimonio
  const sorted = [...result].sort((a, b) => Number(b.patrimonio) - Number(a.patrimonio));
  const winner = sorted[0];

  // Si todos tienen 0, la pregunta no tiene gracia, la abortamos.
  if (Number(winner.patrimonio) === 0) return null;

  const formatter = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 });

  const options: TriviaOption[] = result.map(c => ({
    id: c.id,
    nombre: c.nombre,
    partido: c.partido,
    foto: c.foto,
    isCorrect: c.id === winner.id,
    fact: `Patrimonio total declarado: ${formatter.format(Number(c.patrimonio))}`
  }));

  // Desordenar las opciones
  options.sort(() => Math.random() - 0.5);

  const ubicacionStr = nivel.distrito || nivel.provincia || nivel.departamento || "tu región";
  const cargoStr = nivel.cargo.toLowerCase().includes("alcalde") ? "a la alcaldía" : "al cargo";

  return {
    id: `patrimonio-${Date.now()}`,
    type: "patrimonio",
    question: `¿Cuál de estos candidatos ${cargoStr} de ${ubicacionStr} declaró el mayor patrimonio?`,
    options
  };
}

export async function generarPreguntaSentencias(nivel: NivelGeografico): Promise<TriviaQuestion | null> {
  const filters = buildGeoFilters(nivel);
  
  // Buscar 1 candidato CON sentencias
  const conSentencia = await db.select({
    id: candidatos.id_hoja_vida,
    nombre: candidatos.nombre_completo,
    partido: candidatos.partido_politico,
    foto: candidatos.foto_url,
    sentenciasData: candidatos.sentencias,
  })
  .from(candidatos)
  .where(and(
    ...filters,
    sql`(jsonb_array_length(COALESCE(${candidatos.sentencias}->'sentencias_penales', '[]'::jsonb)) > 0 OR jsonb_array_length(COALESCE(${candidatos.sentencias}->'sentencias_obligaciones', '[]'::jsonb)) > 0)`
  ))
  .orderBy(sql`RANDOM()`)
  .limit(1);

  if (conSentencia.length === 0) return null; // Qué bueno, nadie tiene sentencias aquí.

  // Buscar 2 candidatos SIN sentencias para rellenar
  const sinSentencia = await db.select({
    id: candidatos.id_hoja_vida,
    nombre: candidatos.nombre_completo,
    partido: candidatos.partido_politico,
    foto: candidatos.foto_url,
  })
  .from(candidatos)
  .where(and(
    ...filters,
    sql`(jsonb_array_length(COALESCE(${candidatos.sentencias}->'sentencias_penales', '[]'::jsonb)) = 0 AND jsonb_array_length(COALESCE(${candidatos.sentencias}->'sentencias_obligaciones', '[]'::jsonb)) = 0)`,
    ne(candidatos.id_hoja_vida, conSentencia[0].id)
  ))
  .orderBy(sql`RANDOM()`)
  .limit(2);

  if (sinSentencia.length < 2) return null;

  const winner = conSentencia[0];
  const sData: any = winner.sentenciasData || {};
  const nPenales = sData.sentencias_penales?.length || 0;
  const nOblig = sData.sentencias_obligaciones?.length || 0;
  let factText = "";
  if (nPenales > 0) factText += `Tiene ${nPenales} sentencia(s) penal(es). `;
  if (nOblig > 0) factText += `Tiene ${nOblig} sentencia(s) por obligaciones.`;

  const options: TriviaOption[] = [
    {
      id: winner.id,
      nombre: winner.nombre,
      partido: winner.partido,
      foto: winner.foto,
      isCorrect: true,
      fact: factText.trim()
    },
    ...sinSentencia.map(c => ({
      id: c.id,
      nombre: c.nombre,
      partido: c.partido,
      foto: c.foto,
      isCorrect: false,
      fact: "No registra sentencias declaradas."
    }))
  ];

  options.sort(() => Math.random() - 0.5);

  return {
    id: `sentencias-${Date.now()}`,
    type: "sentencias",
    question: `¿Cuál de estos oponentes tiene sentencias declaradas ante el JNE?`,
    options
  };
}

export async function generarPreguntaEducacion(nivel: NivelGeografico): Promise<TriviaQuestion | null> {
  const filters = buildGeoFilters(nivel);
  
  // Buscar 1 candidato SIN estudios universitarios concluidos
  const sinEstudios = await db.select({
    id: candidatos.id_hoja_vida,
    nombre: candidatos.nombre_completo,
    partido: candidatos.partido_politico,
    foto: candidatos.foto_url,
  })
  .from(candidatos)
  .where(and(
    ...filters,
    sql`NOT EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(${candidatos.formacion_academica}->'educacionUniversitaria', '[]'::jsonb)) AS eu WHERE (eu->>'concluidoEduUni') IN ('1', 'SI', 'si'))`
  ))
  .orderBy(sql`RANDOM()`)
  .limit(1);

  if (sinEstudios.length === 0) return null;

  // Buscar 2 candidatos CON estudios universitarios
  const conEstudios = await db.select({
    id: candidatos.id_hoja_vida,
    nombre: candidatos.nombre_completo,
    partido: candidatos.partido_politico,
    foto: candidatos.foto_url,
    formacion: candidatos.formacion_academica
  })
  .from(candidatos)
  .where(and(
    ...filters,
    sql`EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(${candidatos.formacion_academica}->'educacionUniversitaria', '[]'::jsonb)) AS eu WHERE (eu->>'concluidoEduUni') IN ('1', 'SI', 'si'))`,
    ne(candidatos.id_hoja_vida, sinEstudios[0].id)
  ))
  .orderBy(sql`RANDOM()`)
  .limit(2);

  if (conEstudios.length < 2) return null;

  const options: TriviaOption[] = [
    {
      id: sinEstudios[0].id,
      nombre: sinEstudios[0].nombre,
      partido: sinEstudios[0].partido,
      foto: sinEstudios[0].foto,
      isCorrect: true,
      fact: "No registra estudios universitarios concluidos."
    },
    ...conEstudios.map(c => {
      const fData: any = c.formacion || {};
      const unis: any[] = fData.educacionUniversitaria || [];
      const terminada = unis.find((u: any) => String(u.concluidoEduUni) === "1" || String(u.concluidoEduUni).toUpperCase() === "SI");
      const carrera = terminada ? terminada.carreraUni : "Estudios universitarios";
      return {
        id: c.id,
        nombre: c.nombre,
        partido: c.partido,
        foto: c.foto,
        isCorrect: false,
        fact: `Sí tiene estudios: ${carrera}`
      }
    })
  ];

  options.sort(() => Math.random() - 0.5);

  return {
    id: `educacion-${Date.now()}`,
    type: "educacion",
    question: `¿Cuál de estos candidatos NO registra estudios universitarios concluidos?`,
    options
  };
}

export async function generarPreguntaProfesionales(nivel: NivelGeografico): Promise<TriviaQuestion | null> {
  const filters = buildGeoFilters(nivel);
  
  const cabezas = await db.select({
    id: candidatos.id_hoja_vida,
    nombre: candidatos.nombre_completo,
    partido: candidatos.partido_politico,
    foto: candidatos.foto_url,
  }).from(candidatos).where(and(...filters));

  if (cabezas.length < 3) return null;

  const cargoEquipo = nivel.cargo.includes("GOBERNADOR") ? "CONSEJERO REGIONAL" : "REGIDOR";

  let locFilters = [sql`cargo LIKE ${'%' + cargoEquipo + '%'}`];
  if (nivel.departamento) locFilters.push(eq(candidatos.departamento, nivel.departamento));
  if (nivel.provincia) locFilters.push(eq(candidatos.provincia, nivel.provincia));
  if (nivel.distrito) locFilters.push(eq(candidatos.distrito, nivel.distrito));

  const todosMiembros = await db.select({ 
    partido: candidatos.partido_politico,
    formacion: candidatos.formacion_academica
  }).from(candidatos).where(and(...locFilters));

  const equipoStats = cabezas.map(c => {
    const miembrosPartido = todosMiembros.filter(m => m.partido === c.partido);
    let numProfesionales = 0;
    miembrosPartido.forEach(m => {
      const fData: any = m.formacion || {};
      const unis: any[] = fData.educacionUniversitaria || [];
      if (unis.some(u => String(u.concluidoEduUni) === "1" || String(u.concluidoEduUni).toUpperCase() === "SI")) {
        numProfesionales++;
      }
    });
    return { ...c, numProfesionales };
  });

  equipoStats.sort((a, b) => b.numProfesionales - a.numProfesionales);
  
  if (equipoStats[0].numProfesionales === 0) return null;
  if (equipoStats[0].numProfesionales === equipoStats[1].numProfesionales) return null;

  const winner = equipoStats[0];
  const losers = equipoStats.slice(1).sort(() => Math.random() - 0.5).slice(0, 2);
  const finalOptions = [winner, ...losers];

  const equipoNombre = nivel.cargo.includes("GOBERNADOR") ? "consejeros" : "regidores";
  const cargoStr = nivel.cargo.toLowerCase().includes("alcalde") ? "a la alcaldía" : "al gobierno regional";

  const options: TriviaOption[] = finalOptions.map(c => ({
    id: c.id,
    nombre: c.nombre,
    partido: c.partido,
    foto: c.foto,
    isCorrect: c.id === winner.id,
    fact: c.numProfesionales > 0 ? `Lleva ${c.numProfesionales} profesional(es) en su lista.` : "No registra profesionales universitarios."
  }));

  options.sort(() => Math.random() - 0.5);

  return {
    id: `profesionales-${Date.now()}`,
    type: "profesionales",
    question: `¿Qué candidato ${cargoStr} tiene más profesionales en su lista de ${equipoNombre}?`,
    options
  };
}

export async function generarPreguntaReeleccion(nivel: NivelGeografico): Promise<TriviaQuestion | null> {
  const filters = buildGeoFilters(nivel);
  
  const cabezas = await db.select({
    id: candidatos.id_hoja_vida,
    nombre: candidatos.nombre_completo,
    partido: candidatos.partido_politico,
    foto: candidatos.foto_url,
  }).from(candidatos).where(and(...filters));

  if (cabezas.length < 3) return null;

  const cargoEquipo = nivel.cargo.includes("GOBERNADOR") ? "CONSEJERO REGIONAL" : "REGIDOR";

  let locFilters = [sql`cargo LIKE ${'%' + cargoEquipo + '%'}`];
  if (nivel.departamento) locFilters.push(eq(candidatos.departamento, nivel.departamento));
  if (nivel.provincia) locFilters.push(eq(candidatos.provincia, nivel.provincia));
  if (nivel.distrito) locFilters.push(eq(candidatos.distrito, nivel.distrito));

  const todosMiembros = await db.select({ 
    partido: candidatos.partido_politico,
    cargos_y_renuncias: candidatos.cargos_y_renuncias
  }).from(candidatos).where(and(...locFilters));

  const equipoStats = cabezas.map(c => {
    const miembrosPartido = todosMiembros.filter(m => m.partido === c.partido);
    let numConExperiencia = 0;
    miembrosPartido.forEach(m => {
      const cr: any = m.cargos_y_renuncias || {};
      const cargosEleccion: any[] = cr.cargos_eleccion || [];
      // Si tiene al menos un cargo de elección popular registrado en su historial (de cualquier año o tipo)
      if (cargosEleccion.length > 0) {
        numConExperiencia++;
      }
    });
    return { ...c, numConExperiencia };
  });

  equipoStats.sort((a, b) => b.numConExperiencia - a.numConExperiencia);
  
  if (equipoStats[0].numConExperiencia === 0) return null; // Nadie tiene experiencia previa
  if (equipoStats[0].numConExperiencia === equipoStats[1].numConExperiencia) return null;

  const winner = equipoStats[0];
  const losers = equipoStats.slice(1).sort(() => Math.random() - 0.5).slice(0, 2);
  const finalOptions = [winner, ...losers];

  const equipoNombre = nivel.cargo.includes("GOBERNADOR") ? "consejeros" : "regidores";

  const options: TriviaOption[] = finalOptions.map(c => ({
    id: c.id,
    nombre: c.nombre,
    partido: c.partido,
    foto: c.foto,
    isCorrect: c.id === winner.id,
    fact: c.numConExperiencia > 0 ? `Lleva ${c.numConExperiencia} candidato(s) que ya fueron autoridades antes.` : "Lleva puras caras nuevas (ninguno ha sido autoridad antes)."
  }));

  options.sort(() => Math.random() - 0.5);

  return {
    id: `experiencia-${Date.now()}`,
    type: "reeleccion",
    question: `¿Qué partido lleva en su lista más ${equipoNombre} que ya han ocupado cargos políticos (elección popular) en el pasado?`,
    options
  };
}

export async function generarPreguntaJovenes(nivel: NivelGeografico): Promise<TriviaQuestion | null> {
  const filters = buildGeoFilters(nivel);
  
  const cabezas = await db.select({
    id: candidatos.id_hoja_vida,
    nombre: candidatos.nombre_completo,
    partido: candidatos.partido_politico,
    foto: candidatos.foto_url,
  }).from(candidatos).where(and(...filters));

  if (cabezas.length < 3) return null;

  const cargoEquipo = nivel.cargo.includes("GOBERNADOR") ? "CONSEJERO REGIONAL" : "REGIDOR";

  let locFilters = [sql`cargo LIKE ${'%' + cargoEquipo + '%'}`];
  if (nivel.departamento) locFilters.push(eq(candidatos.departamento, nivel.departamento));
  if (nivel.provincia) locFilters.push(eq(candidatos.provincia, nivel.provincia));
  if (nivel.distrito) locFilters.push(eq(candidatos.distrito, nivel.distrito));

  const todosMiembros = await db.select({ 
    partido: candidatos.partido_politico,
    datos: candidatos.datos_personales 
  }).from(candidatos).where(and(...locFilters));

  const currentYear = new Date().getFullYear();

  const equipoStats = cabezas.map(c => {
    const miembrosPartido = todosMiembros.filter(m => m.partido === c.partido);
    
    let jovenesCount = 0;

    miembrosPartido.forEach(m => {
      const dp: any = m.datos;
      const feNac = dp ? (dp.feNacimiento || dp.strFechaNacimiento) : null;
      if (feNac) {
        const parts = feNac.split('/');
        if (parts.length === 3) {
          const birthYear = parseInt(parts[2]);
          if (!isNaN(birthYear)) {
            const age = currentYear - birthYear;
            if (age < 30) {
              jovenesCount++;
            }
          }
        }
      }
    });

    return { ...c, jovenesCount };
  });

  equipoStats.sort((a, b) => b.jovenesCount - a.jovenesCount);
  
  if (equipoStats[0].jovenesCount === 0) return null; // Ningún joven en la lista
  if (equipoStats[0].jovenesCount === equipoStats[1].jovenesCount) return null; // Empate

  const winner = equipoStats[0];
  const losers = equipoStats.slice(1).sort(() => Math.random() - 0.5).slice(0, 2);
  const finalOptions = [winner, ...losers];

  const equipoNombre = nivel.cargo.includes("GOBERNADOR") ? "consejeros" : "regidores";

  const options: TriviaOption[] = finalOptions.map(c => ({
    id: c.id,
    nombre: c.nombre,
    partido: c.partido,
    foto: c.foto,
    isCorrect: c.id === winner.id,
    fact: c.jovenesCount > 0 ? `Lleva ${c.jovenesCount} joven(es) (menores de 30 años) en su lista.` : "No registra jóvenes en su lista."
  }));

  options.sort(() => Math.random() - 0.5);

  return {
    id: `jovenes-${Date.now()}`,
    type: "jovenes",
    question: `¿Qué candidato apostó más por la juventud y lleva más jóvenes (menores de 30 años) en su lista de ${equipoNombre}?`,
    options
  };
}
