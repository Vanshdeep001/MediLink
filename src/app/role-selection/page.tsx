import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RoleSelectionForm } from "@/components/auth/role-selection-form";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export default async function RoleSelectionPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="absolute top-28 right-4 md:right-8">
            <Button variant="outline" className="rounded-full">
                <Languages className="mr-2 h-5 w-5" />
                EN | HI | PN
            </Button>
        </div>
        <RoleSelectionForm />
      </main>
      <Footer />
    </div>
  );
}
