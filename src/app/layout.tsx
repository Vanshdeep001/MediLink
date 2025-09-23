import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Poppins, Playfair_Display, Dancing_Script } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { SOSButton } from '@/components/sos-button';
import { LanguageProvider } from '@/context/language-context';
import { VoiceFormProvider } from '@/context/voice-form-context';
import { FloatingVoiceButton } from '@/components/voice-assistant/floating-voice-button';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dancing-script',
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
      <body className={`${poppins.variable} ${dancingScript.variable} ${playfairDisplay.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LanguageProvider>
            <VoiceFormProvider>
              {children}
              <Toaster />
              <SOSButton />
              <FloatingVoiceButton />
            </VoiceFormProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
