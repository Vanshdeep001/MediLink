'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FadeIn } from '../fade-in';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Is this service free?",
      answer: "MediLink offers both free and premium services. Basic consultations and medicine ordering are free, while advanced features like priority doctor access and emergency services may have nominal charges."
    },
    {
      question: "Do I need internet to use MediLink?",
      answer: "Yes, you need an internet connection to access MediLink. However, we're working on offline features for basic functionality. A stable internet connection ensures the best experience for video consultations and real-time updates."
    },
    {
      question: "How secure is my data?",
      answer: "Your data security is our top priority. We use end-to-end encryption, comply with healthcare data protection standards, and never share your personal information with third parties without your explicit consent."
    },
    {
      question: "Can I order medicines without prescription?",
      answer: "For prescription medicines, you'll need a valid prescription from a registered doctor. However, you can order over-the-counter medicines and health supplements without a prescription through our platform."
    },
    {
      question: "What if I have an emergency?",
      answer: "In case of emergencies, use our SOS button to alert emergency services immediately. For non-emergency medical issues, our AI doctor can provide initial guidance, but always consult a healthcare professional for serious conditions."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Frequently Asked <span className="text-primary font-cursive">Questions</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Get answers to common questions about MediLink services
            </p>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FadeIn key={index} delay={200 * (index + 1)}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg font-semibold text-gray-800 pr-4">
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
