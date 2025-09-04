import { AuthForm } from "@/components/auth/auth-form";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function AuthPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-24 md:py-32">
        <AuthForm />
      </main>
      <Footer />
    </div>
  );
}
