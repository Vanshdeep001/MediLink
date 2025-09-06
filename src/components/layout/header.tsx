
'use client';

import { useState, useContext, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import ThemeToggleButton from '../ui/theme-toggle-button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Languages, Siren, Check, Bell } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePathname } from 'next/navigation';
import { SOSButtonDialog } from '../sos-button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LanguageContext, Language } from '@/context/language-context';
import type { Notification } from '@/lib/types';
import { Badge } from '../ui/badge';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { toast } = useToast();
  const { language, setLanguage, translations } = useContext(LanguageContext);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const isDashboard = pathname.startsWith('/patient') || pathname.startsWith('/doctor') || pathname.startsWith('/pharmacy');

  useEffect(() => {
    const userString = localStorage.getItem('temp_user');
    if (userString) {
      setCurrentUser(JSON.parse(userString));
    }
    
    if (isDashboard) {
      const interval = setInterval(loadNotifications, 3000);
      return () => clearInterval(interval);
    }
  }, [isDashboard, pathname]);

  const loadNotifications = () => {
    const notifsString = localStorage.getItem('notifications');
    if (notifsString) {
      const allNotifs = JSON.parse(notifsString);
      const userRole = currentUser?.role;
      const userName = currentUser?.fullName || currentUser?.pharmacyName;
      
      const filteredNotifs = allNotifs.filter((n: Notification) => {
        if (n.for === 'pharmacy' && userRole === 'pharmacy') return true;
        if (n.for === 'patient' && userRole === 'patient' && n.patientName === userName) return true;
        return false;
      });
      setNotifications(filteredNotifs.reverse());
    }
  };

  const navLinks = [
    { href: "/services", key: "services" },
    { href: "/about", key: "about" },
    { href: "/contact", key: "contact" },
  ];
  
  const languages: { id: Language; label: string }[] = [
      { id: 'en', label: 'English' },
      { id: 'hi', label: 'हिंदी' },
      { id: 'pa', label: 'ਪੰਜਾਬੀ' }
  ];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    toast({
      title: translations.header.changeLanguage,
      description: `${translations.header.switchedTo} ${languages.find(l => l.id === lang)?.label}.`,
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b border-border/40 animate-fade-in-down">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center group">
          <div className="w-48 h-auto transition-transform duration-300 group-hover:scale-105">
            <Logo />
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-2 text-lg">
          {navLinks.map((link) => (
             <Link
              key={link.href}
              href={link.href}
              className="relative px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full hover:after:left-0"
            >
              {translations.header[link.key as keyof typeof translations.header]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isDashboard && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className='h-9 w-9 relative'>
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">{unreadCount}</Badge>}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 font-semibold">{translations.notifications.title}</div>
                  <DropdownMenuSeparator />
                  {notifications.length > 0 ? notifications.map(n => (
                     <DropdownMenuItem key={n.id} className="whitespace-normal">
                       {n.message}
                     </DropdownMenuItem>
                  )) : (
                     <DropdownMenuItem disabled>{translations.notifications.noNotifications}</DropdownMenuItem>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className='h-9 w-9'>
                <Languages className="h-4 w-4" />
                <span className="sr-only">Select language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem key={lang.id} onSelect={() => handleLanguageChange(lang.id)}>
                   <Check className={cn("mr-2 h-4 w-4", language === lang.id ? "opacity-100" : "opacity-0")} />
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggleButton />
          
          {pathname === '/patient' && (
            <SOSButtonDialog>
              <Button variant="destructive" size="icon" className="hidden md:inline-flex h-9 w-9">
                <Siren className="h-4 w-4" />
                <span className="sr-only">Emergency SOS</span>
              </Button>
            </SOSButtonDialog>
          )}

          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] p-0">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center p-4 border-b">
                     <div className="w-36 h-auto">
                        <Logo />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </div>
                  <nav className="flex flex-col items-start space-y-2 p-4 mt-4">
                    {navLinks.map((link) => (
                      <Button key={link.href} variant="link" asChild className="text-lg w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                        <Link href={link.href}>{translations.header[link.key as keyof typeof translations.header]}</Link>
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
