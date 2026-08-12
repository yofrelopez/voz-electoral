import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export const alt = 'Trivia Electoral 2026';
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
          background: 'linear-gradient(to bottom right, #4f46e5, #9333ea)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: '40px',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '50px 80px',
          borderRadius: '32px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        }}>
          <h1 style={{ fontSize: '80px', fontWeight: 'bold', margin: '0 0 20px 0', textAlign: 'center', textShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            🎮 Trivia Electoral
          </h1>
          <h2 style={{ fontSize: '42px', fontWeight: 'normal', margin: '0 0 50px 0', textAlign: 'center', color: '#e2e8f0', letterSpacing: '-1px' }}>
            ¿Qué tanto conoces a tus candidatos?
          </h2>
          <div style={{ display: 'flex', gap: '30px' }}>
            <div style={{ display: 'flex', background: '#3b82f6', padding: '15px 30px', borderRadius: '16px', fontSize: '28px', fontWeight: 'bold', border: '2px solid #60a5fa' }}>
              ⚖️ Sentencias
            </div>
            <div style={{ display: 'flex', background: '#ec4899', padding: '15px 30px', borderRadius: '16px', fontSize: '28px', fontWeight: 'bold', border: '2px solid #f472b6' }}>
              💰 Patrimonio
            </div>
            <div style={{ display: 'flex', background: '#10b981', padding: '15px 30px', borderRadius: '16px', fontSize: '28px', fontWeight: 'bold', border: '2px solid #34d399' }}>
              👥 Equipos
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '40px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '2px', opacity: 0.9 }}>VOZ ELECTORAL 2026</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
