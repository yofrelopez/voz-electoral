import { db } from './src/db/db';
import { candidatos } from './src/db/schema';
import { eq, and, ilike } from 'drizzle-orm';

async function check() {
  const cands = await db.select({
    id: candidatos.id_hoja_vida,
    nombre: candidatos.nombre_completo,
    cargo: candidatos.cargo,
    partido: candidatos.partido_politico,
    dep: candidatos.departamento,
    prov: candidatos.provincia,
    dist: candidatos.distrito,
    hoja_vida_url: candidatos.hoja_vida_url,
    plan_gobierno_url: candidatos.plan_gobierno_url
  })
  .from(candidatos)
  .where(ilike(candidatos.nombre_completo, '%Josselim Lizzet Figueroa Mendoza%'));

  console.log("Candidatos encontrados:");
  console.table(cands);

  if (cands.length > 0) {
    const candidata = cands[0];
    const equipo = await db.select({
      nombre: candidatos.nombre_completo,
      cargo: candidatos.cargo,
      distrito: candidatos.distrito
    })
    .from(candidatos)
    .where(and(
      eq(candidatos.partido_politico, candidata.partido),
      eq(candidatos.departamento, candidata.dep || ''),
      eq(candidatos.provincia, candidata.prov || '')
    ));

    console.log(`\nTodos los candidatos del partido ${candidata.partido} en ${candidata.dep} - ${candidata.prov}:`);
    console.table(equipo);
  }
}

check().catch(console.error);
