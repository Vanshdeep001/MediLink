import { PharmacyRegistrationForm } from "@/components/auth/pharmacy-registration-form";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FloatingPharmacyIcons } from "@/components/auth/floating-pharmacy-icons";

export default function PharmacyRegistrationPage() {
    return (
        <div className="relative flex flex-col min-h-screen bg-background">
            <FloatingPharmacyIcons />
            <Header />
            <main className="flex-grow flex items-center justify-center p-4">
                <PharmacyRegistrationForm />
            </main>
            <Footer />
        </div>
    );
}
