import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Ubuntu, Dancing_Script } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { SOSButton } from '@/components/sos-button';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ubuntu',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-dancing-script',
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
      <body className={`${ubuntu.variable} ${dancingScript.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
          <SOSButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
