import { DoctorRegistrationForm } from "@/components/auth/doctor-registration-form";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingIcons } from "@/components/landing/floating-icons";

export default function DoctorRegistrationPage() {
    return (
        <div className="relative flex flex-col min-h-screen bg-background">
            <FloatingIcons />
            <Header />
            <main className="flex-grow flex items-center justify-center p-4">
                <DoctorRegistrationForm />
            </main>
            <Footer />
        </div>
    );
}
