import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../src/db/db";
import { planes_gobierno } from "../src/db/schema";
import { eq } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function run() {
  console.log("Extrayendo plan de Rafael Santos de la Base de Datos...");
  const [plan] = await db.select().from(planes_gobierno).where(eq(planes_gobierno.expediente, "ERM.2026022177"));
  
  if (!plan) {
    console.log("No se encontró el plan");
    return;
  }

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

  console.log("Enviando a Gemini 1.5 Flash para su análisis...");
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent(prompt);
    
    console.log("\n====== RESUMEN IA ======\n");
    console.log(result.response.text());
    console.log("\n========================\n");
  } catch(e) {
    console.error("Error consultando a Gemini:", e);
  }
  
  process.exit(0);
}

run();
