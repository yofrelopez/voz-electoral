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
  console.log("Iniciando parcheo MASIVO de la dimensionAmbiental...");

  // 1. Obtener todos los expedientes de la DB
  const planesDB = await db.select().from(planes_gobierno);
  console.log(`Planes en DB: ${planesDB.length}`);

  // 2. Fetch all listas to map expediente -> idPlanGobierno
  let listas: any[] = [];
  try {
    // Regional
    const resReg = await fetchJNE("/api/v1/candidato/listas-regio-muni", "POST", {
      filter: { idProcesoElectoral: 126, idTipoEleccion: 4, txUbigeoDepartamento: "14", txUbigeoProvincia: "00", txUbigeoDistrito: "00" }
    });
    if (resReg.data) listas.push(...resReg.data);

    // Provincial/Distrital
    const provincias = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"];
    for (const prov of provincias) {
      // PROVINCIAL (5)
      const resProv = await fetchJNE("/api/v1/candidato/listas-regio-muni", "POST", {
        filter: { idProcesoElectoral: 126, idTipoEleccion: 5, txUbigeoDepartamento: "14", txUbigeoProvincia: prov, txUbigeoDistrito: "00" }
      });
      if (resProv.data) listas.push(...resReg.data, ...resProv.data);

      // DISTRITAL (6) (We only care about Barranca 09 districts in the original scrape: 02, 03, 04, 05)
      // Actually Barranca is prov 09? Let's just fetch all districts for 09.
      for (const dist of ["01", "02", "03", "04", "05"]) {
         try {
           const resDist = await fetchJNE("/api/v1/candidato/listas-regio-muni", "POST", {
             filter: { idProcesoElectoral: 126, idTipoEleccion: 6, txUbigeoDepartamento: "14", txUbigeoProvincia: "09", txUbigeoDistrito: dist }
           });
           if (resDist.data) listas.push(...resDist.data);
         } catch(e){}
      }
    }
  } catch(e) {
    console.error("Error buscando listas", e);
  }

  console.log(`Total listas encontradas: ${listas.length}`);

  // 3. Update all plans
  let count = 0;
  for (const plan of planesDB) {
    const exp = plan.expediente;
    const item = listas.find(x => x.txCodExpedienteExt === exp);
    
    if (!item) {
      console.log(`[SKIP] No idPlanGobierno para ${exp}`);
      continue;
    }

    const idPlan = item.idPlanGobierno;
    try {
      const planDetalle = await fetchJNE(`/api/v1/plan-gobierno/detalle?IdPlanGobierno=${idPlan}`);
      if (planDetalle && planDetalle.dimensionAmbiental) {
        await db.update(planes_gobierno)
          .set({ dimension_territorial_ambiental: planDetalle.dimensionAmbiental })
          .where(eq(planes_gobierno.expediente, exp));
        count++;
        console.log(`✅ ${exp} - Dimensión Ambiental actualizada (${planDetalle.dimensionAmbiental.length} items).`);
      }
    } catch(e) {
      console.error(`Error procesando ${exp}`, e);
    }
  }

  console.log(`Finalizado. ${count} planes actualizados.`);
  process.exit(0);
}

run().catch(console.error);
