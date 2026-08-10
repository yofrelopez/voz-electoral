import fs from 'fs';
import path from 'path';

const JSON_PATH = 'd:/PROGRAMACION/NextJs/python-datos/candidatos_lima_barranca_estructurado.json';
const fileData = fs.readFileSync(JSON_PATH, 'utf-8');
const items = JSON.parse(fileData);

let ingresosCount = 0;
let inmueblesCount = 0;
let mueblesCount = 0;

for (const item of items) {
  if (item.datos_hoja_vida?.ingresos?.length > 0) ingresosCount++;
  if (item.datos_hoja_vida?.bienes_inmuebles?.length > 0) inmueblesCount++;
  if (item.datos_hoja_vida?.bienes_muebles?.length > 0) mueblesCount++;
}

console.log(`Candidates with ingresos: ${ingresosCount}`);
console.log(`Candidates with inmuebles: ${inmueblesCount}`);
console.log(`Candidates with muebles: ${mueblesCount}`);
