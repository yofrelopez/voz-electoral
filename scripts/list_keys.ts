import fs from 'fs';
import path from 'path';

const JSON_PATH = 'd:/PROGRAMACION/NextJs/python-datos/candidatos_lima_barranca_estructurado.json';
const fileData = fs.readFileSync(JSON_PATH, 'utf-8');
const items = JSON.parse(fileData);

const keys = new Set<string>();
for (const item of items) {
  for (const key of Object.keys(item)) {
    keys.add(key);
  }
}
console.log("Root Keys:", Array.from(keys));
