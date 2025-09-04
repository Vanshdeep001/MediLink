import { MedicalHistoryForm } from "@/components/patient/medical-history-form";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function MedicalHistoryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Personalize Your Healthcare Journey
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Please share a few details about your medical history. This helps us provide you with the best care.
            </p>
          </div>
          <MedicalHistoryForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
