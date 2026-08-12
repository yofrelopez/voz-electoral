"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "./Badge";
import { Target, BarChart2, Menu, X, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { ShareButton } from "@/components/ShareButton";
import { DonationModal } from "@/components/DonationModal";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Ocultar Navbar en el juego de Trivia para maximizar el espacio
  if (pathname === "/trivia") return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="flex h-14 md:h-16 max-w-6xl mx-auto items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo-horizontal.png"
              alt="Voz Electoral"
              width={160}
              height={40}
              className="h-6 md:h-8 w-auto"
              priority
            />
          </Link>
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-4">
          <Link 
            href="/radar"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-red transition-colors relative group"
          >
            <BarChart2 className="h-4 w-4" />
            <span>Radar de Partidos</span>
            <div className="absolute -top-1 -right-2"><Badge variant="default" className="bg-brand-red hover:bg-red-700 scale-75 text-[10px] px-1 py-0">Nuevo</Badge></div>
          </Link>
          
          <Link 
            href="/trivia"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-red transition-colors relative group"
          >
            <Gamepad2 className="h-4 w-4" />
            <span>Juega la Trivia</span>
          </Link>
          
          <Link 
            href="#"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors relative group"
          >
            <Target className="h-4 w-4" />
            <span>Match Electoral</span>
            <div className="absolute -top-1 -right-2"><Badge variant="secondary" className="scale-75 text-[10px] px-1 py-0">Pronto</Badge></div>
          </Link>
          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-4">
            <DonationModal />
            <ShareButton 
              title="Voz Electoral 2026" 
              text="Conoce a todos los candidatos, compara sus planes de gobierno y vota informado en Voz Electoral 2026."
              label="Compartir Plataforma"
            />
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button 
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden border-t border-slate-100 bg-white absolute w-full shadow-lg transition-all ${isOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col p-4 space-y-4">
          <Link 
            href="/radar"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between text-base font-medium text-slate-600 hover:text-brand-red transition-colors"
          >
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              <span>Radar de Partidos</span>
            </div>
            <Badge variant="default" className="bg-brand-red text-[10px] px-1.5 py-0">Nuevo</Badge>
          </Link>
          <Link 
            href="/trivia"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between text-base font-medium text-slate-600 hover:text-brand-red transition-colors"
          >
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              <span>Juega la Trivia</span>
            </div>
          </Link>
          <Link 
            href="#"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span>Match Electoral</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pronto</Badge>
          </Link>
          <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex justify-center w-full">
              <DonationModal onOpen={() => setIsOpen(false)} />
            </div>
            <ShareButton 
              title="Voz Electoral 2026" 
              text="Conoce a todos los candidatos, compara sus planes de gobierno y vota informado en Voz Electoral 2026."
              label="Compartir Plataforma"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
