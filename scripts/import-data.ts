import { config } from 'dotenv';
config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';
import { db } from '../src/db/db';
import { candidatos } from '../src/db/schema';

const JSON_PATH = path.join(__dirname, '../../python-datos/candidatos_lima_barranca_estructurado.json');

async function run() {
  console.log('Iniciando importación...');
  
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`Error: Archivo no encontrado en ${JSON_PATH}`);
    process.exit(1);
  }

  const fileData = fs.readFileSync(JSON_PATH, 'utf-8');
  const items = JSON.parse(fileData);
  console.log(`Leídos ${items.length} candidatos del JSON.`);

  let insertados = 0;
  let errores = 0;

  for (const item of items) {
    try {
      // Extraemos la información del candidato
      const hojaVida = item.datos_hoja_vida || {};
      const datosPersonales = hojaVida.datos_personales || {};
      
      const cargosRenuncias = {
        cargos_eleccion: hojaVida.cargos_eleccion || [],
        cargos_partidarios: hojaVida.cargos_partidarios || [],
        renuncias: hojaVida.renuncias || [],
        postgrados_cargoPartidario: hojaVida.postgrados?.cargoPartidario || [],
        postgrados_cargoEleccion: hojaVida.postgrados?.cargoEleccion || []
      };

      const bienesRentas = {
        ingresos: hojaVida.ingresos || [],
        bienes_inmuebles: hojaVida.bienes_inmuebles || [],
        bienes_muebles: hojaVida.bienes_muebles || []
      };

      const sentencias = {
        sentencias_penales: hojaVida.sentencias_penales || [],
        sentencias_obligaciones: hojaVida.sentencias_obligaciones || []
      };

      // Mapeamos a la base de datos
      await db.insert(candidatos).values({
        id_hoja_vida: item.id_hoja_vida,
        documento: item.documento,
        nombre_completo: item.nombre_completo,
        partido_politico: item.partido_politico,
        tipo_eleccion: item.tipo_eleccion,
        cargo: item.cargo ? item.cargo[0] : null,
        
        departamento: item.geografia?.departamento,
        provincia: item.geografia?.provincia,
        distrito: item.geografia?.distrito,
        
        foto_url: item.archivos?.foto_url_original,
        hoja_vida_url: item.archivos?.hoja_vida_pdf,
        plan_gobierno_url: item.archivos?.plan_gobierno_pdf,
        
        datos_personales: datosPersonales,
        experiencia_laboral: hojaVida.experiencia_laboral || [],
        formacion_academica: hojaVida.formacion_academica || {},
        cargos_y_renuncias: cargosRenuncias,
        bienes_y_rentas: bienesRentas,
        sentencias: sentencias,
        info_adicional: hojaVida.info_adicional || []
      }).onConflictDoUpdate({
        target: candidatos.id_hoja_vida,
        set: {
          documento: item.documento,
          nombre_completo: item.nombre_completo,
          partido_politico: item.partido_politico,
          tipo_eleccion: item.tipo_eleccion,
          cargo: item.cargo ? item.cargo[0] : null,
          departamento: item.geografia?.departamento,
          provincia: item.geografia?.provincia,
          distrito: item.geografia?.distrito,
          foto_url: item.archivos?.foto_url_original,
          hoja_vida_url: item.archivos?.hoja_vida_pdf,
          plan_gobierno_url: item.archivos?.plan_gobierno_pdf,
          datos_personales: datosPersonales,
          experiencia_laboral: hojaVida.experiencia_laboral || [],
          formacion_academica: hojaVida.formacion_academica || {},
          cargos_y_renuncias: cargosRenuncias,
          bienes_y_rentas: bienesRentas,
          sentencias: sentencias,
          info_adicional: hojaVida.info_adicional || []
        }
      });
      insertados++;
    } catch (err) {
      console.error(`Error al insertar candidato ${item.id_hoja_vida}:`, err);
      errores++;
    }
  }

  console.log('--- Resumen ---');
  console.log(`Candidatos insertados: ${insertados}`);
  console.log(`Errores: ${errores}`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
