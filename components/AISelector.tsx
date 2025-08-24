"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Brain, Mic } from "lucide-react";

export type AIProvider = "hume" | "google";

interface AISelectorProps {
  selectedAI: AIProvider;
  onSelectAI: (ai: AIProvider) => void;
}

export default function AISelector({ selectedAI, onSelectAI }: AISelectorProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold">AI Sağlayıcısı Seçin</h3>
        <p className="text-sm text-muted-foreground">Hangi AI ile konuşmak istiyorsunuz?</p>
      </div>

      <button
        onClick={() => onSelectAI("hume")}
        className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
          selectedAI === "hume" 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <Mic className="size-5" />
        <div className="text-left">
          <div className="font-medium">Hume AI</div>
          <div className="text-sm text-muted-foreground">Sesli konuşma desteği</div>
        </div>
      </button>

             <button
         onClick={() => onSelectAI("google")}
         className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
           selectedAI === "google" 
             ? 'border-primary bg-primary/5' 
             : 'border-border hover:border-primary/50'
         }`}
       >
         <Brain className="size-5" />
         <div className="text-left">
                     <div className="font-medium">Google AI (Gemini 1.5 Flash)</div>
          <div className="text-sm text-muted-foreground">Gerçek zamanlı sesli görüşme</div>
         </div>
       </button>
    </div>
  );
}
