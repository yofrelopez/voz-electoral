import fs from 'fs';
import path from 'path';

const JSON_PATH = 'd:/PROGRAMACION/NextJs/python-datos/candidatos_lima_barranca_estructurado.json';
const fileData = fs.readFileSync(JSON_PATH, 'utf-8');
const items = JSON.parse(fileData);

const cand = items.find((i: any) => i.nombre_completo === "RODOLFO JORGE ARAGON ROSADIO");

fs.writeFileSync('debug.json', JSON.stringify(cand, null, 2));
