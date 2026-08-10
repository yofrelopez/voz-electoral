import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';
import { db } from '../src/db/db';
import { candidatos } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const JSON_PATH = path.join(__dirname, '../../python-datos/candidatos_lima_barranca_estructurado.json');

async function run() {
  console.log('Actualizando expedientes en candidatos...');
  const fileData = fs.readFileSync(JSON_PATH, 'utf-8');
  const items = JSON.parse(fileData);

  let actualizados = 0;
  for (const item of items) {
    if (item.expediente) {
      await db.update(candidatos)
        .set({ expediente: item.expediente })
        .where(eq(candidatos.id_hoja_vida, item.id_hoja_vida));
      actualizados++;
    }
  }
  console.log(`Candidatos actualizados con expediente: ${actualizados}`);
  process.exit(0);
}

run().catch(console.error);
