import React, { useState } from "react";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState(languages[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-white hover:bg-white/5"
        >
          <Globe className="mr-2 h-3.5 w-3.5 text-glow-cyan" />
          <span>{currentLang.name}</span>
          <span className="ml-auto opacity-50">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-950/95 border-white/10 w-48 font-mono">
        <div className="px-2 py-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-tighter border-b border-white/5 mb-1">
          Select Operation Language
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setCurrentLang(lang)}
            className="text-[10px] uppercase tracking-widest flex items-center justify-between cursor-pointer hover:bg-glow-cyan/10"
          >
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
            {currentLang.code === lang.code && <Check className="h-3 w-3 text-glow-cyan" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
