"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Heart, Coffee, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DonationModal({ onOpen }: { onOpen?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <>
      <Button 
        onClick={() => {
          setIsOpen(true);
          if (onOpen) onOpen();
        }}
        variant="default"
        size="sm"
        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm px-3"
      >
        <Coffee className="w-4 h-4" />
        <span className="hidden sm:inline">Apoyar el Proyecto</span>
        <span className="sm:hidden">Apoyar</span>
      </Button>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] relative animate-in fade-in zoom-in duration-200 flex flex-col">
            {/* Header */}
            <div className="bg-emerald-50 p-6 text-center relative border-b border-emerald-100 shrink-0">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-100">
                <Heart className="w-8 h-8 text-emerald-500 fill-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Mantengamos esto vivo</h3>
              <p className="text-sm text-slate-600 mt-2">
                Voz Electoral es un proyecto independiente y sin fines de lucro. Tu aporte nos ayuda a pagar los servidores y seguir democratizando la información.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 shrink-0">
              <div className="flex flex-col gap-6">
                
                {/* Yape / Plin Option */}
                <div className="text-center">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Escanea para donar</h4>
                  
                  {/* QR Image */}
                  <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center mb-4 relative overflow-hidden shadow-sm">
                    <img src="/qr-yape.jpg" alt="QR Yape/Plin" className="absolute inset-0 w-full h-full object-cover" />
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs text-slate-500 font-medium">Número Yape / Plin</p>
                      <p className="font-bold text-slate-800 tracking-wide">998 136 138</p>
                    </div>
                    <button 
                      onClick={() => handleCopy("998 136 138", "number")}
                      className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                      title="Copiar número"
                    >
                      {copiedText === "number" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
