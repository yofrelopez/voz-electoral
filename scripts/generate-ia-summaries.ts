import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../src/db/db";
import { planes_gobierno } from "../src/db/schema";
import { eq, isNull } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log("Iniciando generación masiva de resúmenes de IA...");
  
  // Extraer planes que no tienen resumen_ia
  const planes = await db.select().from(planes_gobierno).where(isNull(planes_gobierno.resumen_ia));
  console.log(`Planes pendientes por resumir: ${planes.length}`);

  if (planes.length === 0) {
    console.log("No hay planes pendientes. Finalizando.");
    process.exit(0);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
  let count = 0;

  for (const plan of planes) {
    const exp = plan.expediente;
    console.log(`[${count + 1}/${planes.length}] Procesando ${exp}...`);

    const prompt = `
Eres un analista político y periodista de datos implacable. 
A continuación te proporcionaré los datos estructurados del Plan de Gobierno de un candidato político en Perú.
Tu tarea es redactar un "Resumen Ejecutivo" directo al grano, sin rodeos, sin frases cliché y con rigor periodístico. NO uses emojis.

Estructura estricta requerida:
1. Párrafo inicial (Visión Central): Máximo 2 oraciones. Ve directo a la prioridad real del candidato basándote en sus propuestas (ej. enfoque pro-inversión, estatista, mano dura en seguridad, etc.). Omite preámbulos genéricos como "El plan busca el desarrollo...".
2. Promesas Tangibles: Extrae exactamente 1 promesa clave por cada dimensión (Social, Económica, Institucional, Ambiental). 
   - REGLA DE ORO SOBRE NÚMEROS: Si el candidato menciona en el texto original la cifra actual o línea base, redacta el contraste (Ej: "Reducir la anemia del 40% actual a un 10%"). Si no la menciona, no la inventes, solo pon la meta.
   - Formato: Una lista de 4 viñetas. Cada viñeta debe comenzar en negrita con el nombre de la dimensión. (Ej: "* **Dimensión Social:** ...")
3. Puntos Ciegos: Si alguna dimensión está vacía (array []), menciónalo en una oración al final.

Datos del Plan de Gobierno:
- Dimensión Social: ${JSON.stringify(plan.dimension_social)}
- Dimensión Económica: ${JSON.stringify(plan.dimension_economica)}
- Dimensión Institucional: ${JSON.stringify(plan.dimension_institucional)}
- Dimensión Ambiental: ${JSON.stringify(plan.dimension_territorial_ambiental)}

Redacta el resumen ahora (sin emojis, usando Markdown):
`;

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }, { timeout: 30000 });
      const text = result.response.text();
      
      await db.update(planes_gobierno)
        .set({ resumen_ia: text })
        .where(eq(planes_gobierno.expediente, exp));
        
      console.log(`✅ Resumen guardado para ${exp}`);
      count++;
    } catch(e: any) {
      console.error(`❌ Error al procesar ${exp}:`, e.message);
    }
    
    // Esperar 5 segundos para evitar límites de tasa de la API (12 RPM)
    await delay(5000);
  }

  console.log(`\n🎉 Proceso completado. Se generaron ${count} resúmenes.`);
  process.exit(0);
}

run().catch(console.error);
