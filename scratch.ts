import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./src/db/db";
import { candidatos } from "./src/db/schema";

async function main() {
  const result = await db.select().from(candidatos).limit(1);
  console.log("DATOS PERSONALES:", JSON.stringify(result[0].datos_personales, null, 2));
  console.log("CARGOS Y RENUNCIAS:", JSON.stringify(result[0].cargos_y_renuncias, null, 2));
}

main().catch(console.error);
