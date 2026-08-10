"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ShareButtonProps {
  title: string;
  text: string;
  label?: string;
}

export function ShareButton({ title, text, label = "Compartir" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (error) {
        console.log("Error al compartir:", error);
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <Button 
      onClick={handleShare}
      variant="ghost"
      size="sm"
      className="gap-1.5 text-slate-500 hover:text-brand-red hover:bg-brand-red/5 font-medium px-2"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? "¡Copiado!" : label}
    </Button>
  );
}
