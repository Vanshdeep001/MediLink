
'use client';
import { useContext } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { LanguageContext } from '@/context/language-context';
import { Github, Twitter, Linkedin } from 'lucide-react';
import ShareButton from '../ui/share-button';

export function Footer() {
  const { translations } = useContext(LanguageContext);
  
  const socialLinks = [
    { icon: Github, href: "https://github.com" },
    { icon: Twitter, href: "https://twitter.com" },
    { icon: Linkedin, href: "https://linkedin.com" },
  ];

  return (
    <footer className="border-t border-border/40 bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="w-40 h-auto">
              <Logo />
            </div>
            <p className="mt-4 text-muted-foreground text-sm">
              {translations.footer.tagline}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services" className="hover:text-primary">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>support@medilink.com</li>
            </ul>
          </div>
          <div className="pt-9">
             <ShareButton links={socialLinks.map(link => ({...link, onClick: () => window.open(link.href, '_blank')}))}>
                Follow Us
            </ShareButton>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MediLink. {translations.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
