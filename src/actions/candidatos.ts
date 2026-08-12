"use server";

import { db } from "@/db/db";
import { candidatos, planes_gobierno } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";

export async function searchCandidatos(query: string = "", conSentencias: boolean = false, ordenarPatrimonio: boolean = false) {
  try {
    const { sql, and, or, ilike } = await import("drizzle-orm");
    
    let conditions = [];
    
    if (query.trim()) {
      const searchTerm = `%${query}%`;
      conditions.push(
        or(
          ilike(candidatos.nombre_completo, searchTerm),
          ilike(candidatos.partido_politico, searchTerm),
          ilike(candidatos.cargo, searchTerm),
          ilike(candidatos.distrito, searchTerm),
          ilike(candidatos.provincia, searchTerm),
          ilike(candidatos.departamento, searchTerm)
        )
      );
    }
    
    if (conSentencias) {
      conditions.push(
        sql`jsonb_array_length(COALESCE(${candidatos.sentencias}->'sentencias_penales', '[]'::jsonb)) > 0 OR jsonb_array_length(COALESCE(${candidatos.sentencias}->'sentencias_obligaciones', '[]'::jsonb)) > 0`
      );
    }
    
    let queryBuilder = db.select().from(candidatos).$dynamic();
    
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions));
    }
    
    if (ordenarPatrimonio) {
      // Ordenar calculando patrimonio (Ingresos + Muebles + Inmuebles)
      queryBuilder = queryBuilder.orderBy(
        sql`(
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
        ) DESC NULLS LAST`
      );
    } else {
      if (query.trim()) {
        queryBuilder = queryBuilder.orderBy(
          sql`CASE WHEN cargo LIKE '%ALCALDE%' OR cargo LIKE '%GOBERNADOR%' THEN 1 ELSE 2 END`,
          sql`CASE WHEN distrito ILIKE ${`%${query}%`} THEN 1 ELSE 2 END`,
          sql`RANDOM()`
        );
      } else {
         queryBuilder = queryBuilder.orderBy(sql`RANDOM()`);
      }
    }

    return await queryBuilder.limit(50);
  } catch (error) {
    console.error("Error searching candidatos:", error);
    return [];
  }
}

// Nueva función para el Home: Traer solo a los cabezas de lista por tipo de elección
export async function getCabezasDeLista(tipo: "REGIONAL" | "PROVINCIAL" | "DISTRITAL", distritoNombre?: string, conSentencias: boolean = false, ordenarPatrimonio: boolean = false) {
  try {
    const { eq, and, sql } = await import("drizzle-orm");
    let cargo = "";
    if (tipo === "REGIONAL") cargo = "GOBERNADOR REGIONAL";
    if (tipo === "PROVINCIAL") cargo = "ALCALDE PROVINCIAL";
    if (tipo === "DISTRITAL") cargo = "ALCALDE DISTRITAL";

    let conditions: any[] = [eq(candidatos.cargo, cargo)];
    if (tipo === "DISTRITAL" && distritoNombre) {
      conditions.push(eq(candidatos.distrito, distritoNombre));
    }
    
    if (conSentencias) {
      conditions.push(
        sql`(jsonb_array_length(COALESCE(${candidatos.sentencias}->'sentencias_penales', '[]'::jsonb)) > 0 OR jsonb_array_length(COALESCE(${candidatos.sentencias}->'sentencias_obligaciones', '[]'::jsonb)) > 0)`
      );
    }

    let queryBuilder = db
      .select()
      .from(candidatos)
      .where(and(...conditions))
      .$dynamic();
      
    if (ordenarPatrimonio) {
      queryBuilder = queryBuilder.orderBy(
        sql`(
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
        ) DESC NULLS LAST`
      );
    } else {
      queryBuilder = queryBuilder.orderBy(sql`RANDOM()`);
    }

    return await queryBuilder.limit(50);
  } catch (error) {
    console.error("Error getting cabezas de lista:", error);
    return [];
  }
}

export async function getDistritosConCandidatos() {
  try {
    const { eq, isNotNull, and } = await import("drizzle-orm");
    // Get unique districts where cargo is ALCALDE DISTRITAL
    const results = await db
      .selectDistinct({ distrito: candidatos.distrito })
      .from(candidatos)
      .where(and(eq(candidatos.cargo, "ALCALDE DISTRITAL"), isNotNull(candidatos.distrito)))
      .orderBy(candidatos.distrito);
      
    return results.map(r => r.distrito).filter(Boolean) as string[];
  } catch (error) {
    console.error("Error getting distritos:", error);
    return [];
  }
}

export async function getCandidatoById(id: number) {
  try {
    const data = await db
      .select()
      .from(candidatos)
      .where(eq(candidatos.id_hoja_vida, id))
      .limit(1);

    if (data.length === 0) return null;
    
    const candidato = data[0];
    
    // Si tiene expediente, buscar su plan de gobierno
    let planGobierno = null;
    if (candidato.expediente) {
      const planData = await db
        .select()
        .from(planes_gobierno)
        .where(eq(planes_gobierno.expediente, candidato.expediente))
        .limit(1);
      
      if (planData.length > 0) {
        planGobierno = planData[0];
      }
    }

    return { candidato, planGobierno };
  } catch (error) {
    console.error("Error getting candidato:", error);
    return null;
  }
}

export async function getEquipoByExpediente(expediente: string, currentCandidatoId: number) {
  try {
    const { not, and, eq } = await import("drizzle-orm");
    const results = await db
      .select()
      .from(candidatos)
      .where(
        and(
          eq(candidatos.expediente, expediente),
          not(eq(candidatos.id_hoja_vida, currentCandidatoId))
        )
      )
      .limit(50); // Usually a list has 10-15 people
      
    return results.sort((a, b) => {
      const getRank = (cargo: string | null) => {
        if (!cargo) return 4;
        const c = cargo.toUpperCase();
        if (c.includes('VICEGOBERNADOR') || c.includes('TENIENTE ALCALDE')) return 1;
        if (c.includes('CONSEJERO') || c.includes('REGIDOR')) {
          if (c.includes('ACCESITARIO')) return 3;
          return 2;
        }
        if (c.includes('ACCESITARIO')) return 3;
        return 4;
      };
      
      const rankA = getRank(a.cargo);
      const rankB = getRank(b.cargo);
      
      if (rankA !== rankB) return rankA - rankB;
      
      // El JNE guarda la posición oficial en datos_personales.numeroCandidato
      const numA = (a.datos_personales as any)?.numeroCandidato ?? 999;
      const numB = (b.datos_personales as any)?.numeroCandidato ?? 999;
      
      return numA - numB;
    });
  } catch (error) {
    console.error("Error getting equipo:", error);
    return [];
  }
}
