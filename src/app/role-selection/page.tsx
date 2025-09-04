import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RoleSelectionForm } from "@/components/auth/role-selection-form";
import { getCurrentUser } from "@/lib/firebase/auth";
import { redirect } from "next/navigation";

export default async function RoleSelectionPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <RoleSelectionForm />
      </main>
      <Footer />
    </div>
  );
}