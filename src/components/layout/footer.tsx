
'use client';
import { useContext } from 'react';
import { Logo } from "@/components/logo";
import { LanguageContext } from '@/context/language-context';

export function Footer() {
  const { translations } = useContext(LanguageContext);
  return (
    <footer className="border-t border-border/40">
      <div className="container py-8 text-center text-muted-foreground">
        <div className="flex items-center justify-center mb-4">
          <div className="w-32 h-auto">
            <Logo />
          </div>
        </div>
        <p>&copy; {new Date().getFullYear()} MediLink. {translations.footer.rights}</p>
        <p className="text-sm mt-2">{translations.footer.tagline}</p>
      </div>
    </footer>
  );
}
