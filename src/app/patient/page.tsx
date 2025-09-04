import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Pill, Video } from "lucide-react";

export default function PatientDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container py-12">
        <h1 className="text-4xl font-bold mb-8">Patient Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Book Consultation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Find and book appointments with available doctors.
              </p>
              <Button>Book Now</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-6 h-6" />
                View Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access your digital prescriptions and medical history.
              </p>
              <Button variant="outline">View History</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-6 h-6" />
                Medicine Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Set and manage reminders for your medications.
              </p>
              <Button variant="outline">Set Reminder</Button>
            </CardContent>
          </Card>

        </div>
      </main>
      <Footer />
    </div>
  );
}