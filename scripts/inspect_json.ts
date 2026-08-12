import { db } from "../src/db/db";
import { candidatos } from "../src/db/schema";
import { isNotNull } from "drizzle-orm";

async function main() {
  const result = await db.select().from(candidatos).where(isNotNull(candidatos.datos_personales)).limit(1);
  if (result.length > 0) {
    console.log("DATOS PERSONALES:", JSON.stringify(result[0].datos_personales, null, 2));
    console.log("FORMACION:", JSON.stringify(result[0].formacion_academica, null, 2));
    console.log("CARGOS:", JSON.stringify(result[0].cargos_y_renuncias, null, 2));
  }
  process.exit(0);
}

main();
