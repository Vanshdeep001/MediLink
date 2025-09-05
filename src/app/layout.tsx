import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Poppins, Playfair_Display, Pacifico } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { SOSButton } from '@/components/sos-button';
import { LanguageProvider } from '@/context/language-context';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const pacifico = Pacifico({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pacifico',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair-display',
});

export const metadata: Metadata = {
  title: 'MediLink Healthcare',
  description: 'Smart Rural Care. Get instant access to doctors, medicines, and emergency services.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${pacifico.variable} ${playfairDisplay.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            {children}
            <Toaster />
            <SOSButton />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
