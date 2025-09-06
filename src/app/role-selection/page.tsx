import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RoleSelectionForm } from "@/components/auth/role-selection-form";

export default async function RoleSelectionPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 pb-16">
        <RoleSelectionForm />
      </main>
      <Footer />
    </div>
  );
}
