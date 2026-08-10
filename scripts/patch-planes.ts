import { db } from "../src/db/db";
import { planes_gobierno } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function fetchJNE(path: string, method: string = "GET", body?: any) {
  const url = `https://apiplataformaelectoral3.jne.gob.pe${path}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

async function run() {
  console.log("Iniciando parcheo de planes de gobierno...");

  // Los dos expedientes vacíos detectados
  const targetExpedientes = ["ERM.2026022177", "ERM.2026023265"];
  
  // 1. Buscar los idPlanGobierno para estos expedientes.
  let listas: any[] = [];
  
  try {
    const resReg = await fetchJNE("/api/v1/candidato/listas-regio-muni", "POST", {
      filter: { idProcesoElectoral: 126, idTipoEleccion: 4, txUbigeoDepartamento: "14", txUbigeoProvincia: "00", txUbigeoDistrito: "00" }
    });
    if (resReg.data) listas.push(...resReg.data);
  } catch(e) {
    console.error("Error buscando listas", e);
  }

  for (const exp of targetExpedientes) {
    let idPlan = listas.find(x => x.txCodExpedienteExt === exp)?.idPlanGobierno;
    
    // Si no está en REGIONAL, hacemos un bucle por las provincias principales
    if (!idPlan) {
      for(let prov of ["02", "06", "08"]) {
         try {
           const resMuni = await fetchJNE("/api/v1/candidato/listas-regio-muni", "POST", {
             filter: { idProcesoElectoral: 126, idTipoEleccion: 5, txUbigeoDepartamento: "14", txUbigeoProvincia: prov, txUbigeoDistrito: "00" }
           });
           if(resMuni.data) {
             const found = resMuni.data.find((x: any) => x.txCodExpedienteExt === exp);
             if(found) {
               idPlan = found.idPlanGobierno;
               break;
             }
           }
         } catch(e){}
      }
    }

    if (!idPlan) {
      console.log(`No se encontró idPlanGobierno para ${exp}`);
      continue;
    }

    console.log(`Encontrado idPlanGobierno para ${exp}: ${idPlan}`);
    
    // 2. Fetch detalle
    const planDetalle = await fetchJNE(`/api/v1/plan-gobierno/detalle?IdPlanGobierno=${idPlan}`);
    
    if (planDetalle && planDetalle.datoGeneral) {
      console.log(`Actualizando ${exp} en DB...`);
      await db.update(planes_gobierno)
        .set({
          dimension_social: planDetalle.dimensionSocial || [],
          dimension_institucional: planDetalle.dimensionInstitucional || [],
          dimension_economica: planDetalle.dimensionEconomica || [],
          dimension_territorial_ambiental: planDetalle.dimensionTerritorial || []
        })
        .where(eq(planes_gobierno.expediente, exp));
      console.log(`✅ ${exp} actualizado con éxito.`);
    } else {
      console.log(`No se pudo obtener el detalle para ${exp}`);
    }
  }

  process.exit(0);
}

run().catch(console.error);
