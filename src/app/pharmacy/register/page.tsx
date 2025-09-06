import { PharmacyRegistrationForm } from "@/components/auth/pharmacy-registration-form";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingPharmacyIcons } from "@/components/auth/floating-pharmacy-icons";

export default function PharmacyRegistrationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 pt-32 md:pt-40 relative overflow-hidden pb-24">
        <FloatingPharmacyIcons />
        <PharmacyRegistrationForm />
      </main>
      <Footer />
    </div>
  );
}
