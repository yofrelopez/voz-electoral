import { ImageResponse } from 'next/og';
import { db } from '@/db/db';
import { candidatos } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export const alt = 'Conoce a tu candidato';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  // En Next.js 15 los params de layout/page/og son Promise, pero next/og los trata como un objeto directo o promesa.
  // Es más seguro extraer id por si acaso es asíncrono o síncrono.
  const id = params.id;
  
  // Extraer datos del candidato
  const [candidato] = await db
    .select()
    .from(candidatos)
    .where(eq(candidatos.id_hoja_vida, parseInt(id)))
    .limit(1);

  if (!candidato) {
    return new ImageResponse(
      (
        <div style={{ fontSize: 48, background: 'white', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Candidato no encontrado - Voz Electoral
        </div>
      ),
      { ...size }
    );
  }

  // Fallback a foto por defecto si no tiene
  const fotoUrl = candidato.foto_url 
    ? `https://declara.jne.gob.pe/${candidato.foto_url}`
    : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  const nombreCompleto = candidato.nombre_completo;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #f1f5f9 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f1f5f9 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Lado izquierdo: Foto */}
        <div
          style={{
            width: '40%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            borderRight: '1px solid #e2e8f0'
          }}
        >
          <img
            src={fotoUrl}
            alt={nombreCompleto}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Lado derecho: Info */}
        <div
          style={{
            width: '60%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#e11d48',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '20px',
            }}
          >
            Voz Electoral 2026
          </div>
          
          <div
            style={{
              fontSize: 64,
              color: '#0f172a',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '20px',
            }}
          >
            {nombreCompleto}
          </div>

          <div
            style={{
              fontSize: 32,
              color: '#475569',
              fontWeight: 500,
              marginBottom: '40px',
            }}
          >
            {candidato.partido_politico}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#fff1f2',
              padding: '16px 24px',
              borderRadius: '12px',
              border: '1px solid #ffe4e6',
              marginTop: 'auto',
            }}
          >
            <div style={{ fontSize: 28, color: '#be123c', fontWeight: 600 }}>
              Conoce su Plan de Gobierno e Historial
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
