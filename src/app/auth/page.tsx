import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { AuthPageClient } from "./auth-page-client";

export default function AuthPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 pt-24 md:pt-32 pb-24">
        <AuthPageClient />
      </main>
      <Footer />
    </div>
  );
}
