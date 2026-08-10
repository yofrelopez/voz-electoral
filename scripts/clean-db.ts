import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function clearDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL no encontrada en el entorno');
  }

  console.log('Conectando a Neon para limpiar la base de datos...');
  const sql = neon(connectionString);
  
  try {
    await sql`DROP SCHEMA public CASCADE;`;
    await sql`CREATE SCHEMA public;`;
    console.log('¡Limpieza completada! El esquema "public" ha sido recreado.');
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
  }
}

clearDatabase();
