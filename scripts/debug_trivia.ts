import { db } from "../src/db/db";
import { candidatos } from "../src/db/schema";
import { eq, and, sql, isNotNull } from "drizzle-orm";

async function main() {
  const c = await db.select({
    formacion: candidatos.formacion_academica,
    cargos: candidatos.cargos_y_renuncias
  }).from(candidatos).where(isNotNull(candidatos.formacion_academica)).limit(1);
  
  console.log("Formacion:", JSON.stringify(c[0].formacion, null, 2));

  const c2 = await db.select({
    formacion: candidatos.formacion_academica,
    cargos: candidatos.cargos_y_renuncias
  }).from(candidatos).where(isNotNull(candidatos.cargos_y_renuncias)).limit(1);

  console.log("Cargos:", JSON.stringify(c2[0].cargos, null, 2));
  process.exit(0);
}

main().catch(console.error);
