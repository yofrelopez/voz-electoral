import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';
import { db } from '../src/db/db';
import { planes_gobierno } from '../src/db/schema';

const JSON_PATH = path.join(__dirname, '../../python-datos/planes_gobierno_lima_barranca.json');

async function run() {
  console.log('Iniciando importación de Planes de Gobierno...');
  
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`Error: Archivo no encontrado en ${JSON_PATH}`);
    process.exit(1);
  }

  const fileData = fs.readFileSync(JSON_PATH, 'utf-8');
  const itemsDict = JSON.parse(fileData);
  const items = Object.values(itemsDict);
  console.log(`Leídos ${items.length} planes de gobierno del JSON.`);

  let insertados = 0;
  let errores = 0;

  for (const item of items) {
    try {
      const data = item as any;
      if (!data.expediente) continue;

      const dim = data.dimensiones || {};
      
      await db.insert(planes_gobierno).values({
        expediente: data.expediente,
        partido_politico: data.partido_politico,
        tipo_eleccion: data.tipo_eleccion,
        dimension_social: dim.social || [],
        dimension_institucional: dim.institucional || [],
        dimension_economica: dim.economica || [],
        dimension_territorial_ambiental: dim.territorial_ambiental || [],
      }).onConflictDoUpdate({
        target: planes_gobierno.expediente,
        set: {
          partido_politico: data.partido_politico,
          tipo_eleccion: data.tipo_eleccion,
          dimension_social: dim.social || [],
          dimension_institucional: dim.institucional || [],
          dimension_economica: dim.economica || [],
          dimension_territorial_ambiental: dim.territorial_ambiental || [],
        }
      });
      insertados++;
    } catch (err) {
      console.error(`Error al insertar plan de gobierno para ${(item as any).expediente}:`, err);
      errores++;
    }
  }

  console.log('--- Resumen Planes ---');
  console.log(`Planes insertados/actualizados: ${insertados}`);
  console.log(`Errores: ${errores}`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
