import { db } from './src/db/db';
import { candidatos } from './src/db/schema';
import { sql, isNotNull } from 'drizzle-orm';

async function check() {
  const oficios = ['%AGRICULTOR%', '%OBRERO%', '%TRANSPORTISTA%', '%CHOFER%', '%COMERCIANTE%', '%ARTESANO%', '%MECANICO%', '%ALBAÑIL%'];
  
  const cands = await db.select({
    id: candidatos.id_hoja_vida,
    nombre: candidatos.nombre_completo,
    cargo: candidatos.cargo,
    exp: candidatos.experiencia_laboral
  })
  .from(candidatos)
  .where(
    sql`EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(${candidatos.experiencia_laboral}, '[]'::jsonb)) AS el 
      WHERE (el->>'ocupacionProfesion') ILIKE ANY (ARRAY[${sql.join(oficios.map(o => sql`${o}`), sql`, `)}])
    )`
  )
  .limit(10);
  
  console.log(`Encontrados: ${cands.length}`);
  if (cands.length > 0) {
    console.log(JSON.stringify(cands[0].exp, null, 2));
  }
}
check().catch(console.error);
