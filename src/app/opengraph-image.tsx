import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Voz Electoral 2026';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #f1f5f9 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f1f5f9 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#e11d48', // brand-red
              color: 'white',
              fontSize: 60,
              fontWeight: 'bold',
              padding: '20px 40px',
              borderRadius: '20px',
              marginBottom: '30px',
              boxShadow: '0 20px 40px rgba(225, 29, 72, 0.2)'
            }}
          >
            Voz Electoral 2026
          </div>
          <div
            style={{
              fontSize: 40,
              color: '#334155', // slate-700
              fontWeight: 600,
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            Conoce a tus candidatos, compara sus planes y vota informado.
          </div>
        </div>
        
        <div style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          fontSize: 24,
          color: '#64748b', // slate-500
          fontWeight: 500
        }}>
          Datos públicos procesados para empoderar al ciudadano.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
