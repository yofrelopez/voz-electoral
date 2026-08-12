import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { PwaRegister } from "@/components/PwaRegister";
import { DonationModal } from "@/components/DonationModal";
import { Heart } from "lucide-react";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL 
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
      : 'http://localhost:3000'
  ),
  title: "Voz Electoral 2026",
  description: "Plataforma de información ciudadana para las elecciones 2026",
  manifest: "/manifest.json",
  themeColor: "#FFFFFF",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Voz Electoral",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-[#F9FAFB] text-slate-900 selection:bg-brand-red selection:text-white">
        <PwaRegister />
        <Navbar />
        {children}
        
        {/* Support Banner before Footer */}
        <div className="w-full bg-emerald-50 border-t border-emerald-100 py-10 mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">
              Ayúdanos a mantener este proyecto vivo
            </h3>
            <p className="text-sm text-slate-600 max-w-lg mb-6 leading-relaxed">
              Voz Electoral 2026 es una herramienta independiente creada para democratizar la información. Tu colaboración voluntaria nos permite mantener los servidores activos y libres de publicidad invasiva.
            </p>
            <div className="scale-110">
              <DonationModal />
            </div>
          </div>
        </div>

        <footer className="w-full bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-1.5">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <img src="/icono-electoral.png" alt="Icono" className="w-5 h-5 object-contain" />
                <p className="text-sm text-slate-900 font-semibold tracking-tight">
                  Voz Electoral 2026
                </p>
              </div>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Datos públicos extraídos del Jurado Nacional de Elecciones (JNE). Si bien nuestro procesamiento es automatizado, la plataforma podría contener errores u omisiones propios de la fuente o del sistema.
                <br className="mt-1" />
                ¿Encontraste un dato inexacto? <a href="https://wa.me/51998136138" target="_blank" rel="noopener noreferrer" className="text-brand-red font-semibold hover:underline transition-colors">Repórtalo por WhatsApp aquí</a>.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end space-y-2">
              <p className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                Diseñado y desarrollado por <span className="font-semibold text-slate-700">Yofré López</span>
              </p>
              <a 
                href="https://idev.pe" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-red transition-all duration-300"
              >
                Una iniciativa de <span className="font-bold text-slate-700 group-hover:text-brand-red transition-colors">Idev.pe</span>
              </a>
            </div>
          </div>
        </footer>
        <GoogleAnalytics gaId="G-X2647KWJGH" />
      </body>
    </html>
  );
}
