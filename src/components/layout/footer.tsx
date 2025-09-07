
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
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="border-t border-border/40 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Company Info */}
          <div className="space-y-3">
            <div className="w-40 h-auto">
              <Logo className="[&_h1]:text-white" />
            </div>
            <p className="text-gray-300 text-sm">
              {translations.footer.tagline}
            </p>
            <div className="flex items-center gap-2">
              <ShareButton links={socialLinks.map(link => ({...link, href: link.href, onClick: () => window.open(link.href, '_blank')}))}>
                Follow us
              </ShareButton>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support & Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Support</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="mailto:support@medilink.com" className="hover:text-white transition-colors">
                  support@medilink.com
                </a>
              </li>
              <li>
                <a href="tel:+911234567890" className="hover:text-white transition-colors">
                  +91-12345-67890
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-3">Get Started with MediLink Today</h3>
            <p className="text-gray-300 mb-4">Join thousands of users who trust MediLink for their healthcare needs</p>
            <Link 
              href="/auth" 
              className="inline-flex items-center px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-300 hover:scale-105 transform"
            >
              Start Your Journey
            </Link>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; 2025 MediLink. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
