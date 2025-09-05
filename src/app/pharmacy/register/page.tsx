import { PharmacyRegistrationForm } from "@/components/auth/pharmacy-registration-form";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function PharmacyRegistrationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <PharmacyRegistrationForm />
      </main>
      <Footer />
    </div>
  );
}
