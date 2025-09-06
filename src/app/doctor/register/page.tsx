import { DoctorRegistrationForm } from "@/components/auth/doctor-registration-form";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingDoctorIcons } from "@/components/auth/floating-doctor-icons";

export default function DoctorRegistrationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 pt-32 md:pt-40 relative overflow-hidden pb-16">
        <FloatingDoctorIcons />
        <DoctorRegistrationForm />
      </main>
      <Footer />
    </div>
  );
}
