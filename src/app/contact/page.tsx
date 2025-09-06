
'use client';

import { useContext } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContactForm } from '@/components/contact/contact-form';
import TextFlipper from "@/components/ui/text-effect-flipper";
import { LanguageContext } from '@/context/language-context';
import { Mail, Phone, Bot } from 'lucide-react';
import { FadeIn } from '@/components/fade-in';
import { Separator } from '@/components/ui/separator';

export default function ContactPage() {
  const { translations } = useContext(LanguageContext);
  
  const titleParts = translations.contact.title.split(' ');
  const mainTitle = titleParts[0];
  const cursiveTitle = titleParts.slice(1).join(' ');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-24 md:py-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>{mainTitle}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">{cursiveTitle}</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {translations.contact.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>{translations.contact.form.title}</CardTitle>
                  <CardDescription>{translations.contact.form.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={200}>
                <div className="space-y-8 pt-8">
                    <h3 className="text-2xl font-bold text-center md:text-left">{translations.contact.otherWays.title}</h3>
                    <div className="flex items-center gap-4">
                        <Mail className="w-8 h-8 text-primary" />
                        <div>
                            <h4 className="font-semibold text-lg">{translations.contact.otherWays.email.label}</h4>
                            <a href="mailto:support@medilink.in" className="text-muted-foreground hover:text-primary transition-colors">{translations.contact.otherWays.email.value}</a>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-4">
                        <Phone className="w-8 h-8 text-primary" />
                        <div>
                            <h4 className="font-semibold text-lg">{translations.contact.otherWays.phone.label}</h4>
                            <p className="text-muted-foreground">{translations.contact.otherWays.phone.value}</p>
                        </div>
                    </div>
                     <Separator />
                    <div className="flex items-center gap-4">
                        <Bot className="w-8 h-8 text-primary" />
                        <div>
                            <h4 className="font-semibold text-lg">{translations.contact.otherWays.chatbot.label}</h4>
                            <p className="text-muted-foreground">{translations.contact.otherWays.chatbot.value}</p>
                        </div>
                    </div>
                </div>
            </FadeIn>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
