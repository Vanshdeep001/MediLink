
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, FileText, HeartPulse, PlusCircle, MessageSquare, LineChart, ChevronRight } from "lucide-react";
import TextFlipper from "@/components/ui/text-effect-flipper";

export default function DoctorDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-20">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center py-16 md:py-24 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>Welcome back,</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">Doctor!</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground animate-text-fade-in-scale" style={{ animationDelay: '0.4s' }}>
              Manage your appointments, patients, and reports all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-content-fade-in" style={{ animationDelay: '0.6s' }}>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">View your schedule</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">120</div>
                <p className="text-xs text-muted-foreground">Manage patient records</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Review and sign</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Consultations</CardTitle>
                <HeartPulse className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-content-fade-in" style={{ animationDelay: '0.8s' }}>
            <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare /> Patient Messages</CardTitle>
                <CardDescription>Respond to patient queries and manage communications.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Open Inbox</Button>
              </CardContent>
            </Card>
            <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
               <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> View Reports</CardTitle>
                <CardDescription>Access and review patient medical reports and history.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Access Reports</Button>
              </CardContent>
            </Card>
             <Card className="md:col-span-1 hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
               <CardHeader>
                <CardTitle className="flex items-center gap-2"><LineChart /> Health Analytics</CardTitle>
                <CardDescription>View analytics on patient data and consultation trends.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Button className="w-full">View Analytics</Button>
              </CardContent>
            </Card>
          </div>

          <div className="animate-content-fade-in" style={{ animationDelay: '1s' }}>
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="consultations">Consultations</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Your Appointments</CardTitle>
                    <CardDescription>View your schedule or add a new consultation.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center items-center text-center py-12 text-muted-foreground">
                        <p>No appointments scheduled for today.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Schedule New Appointment
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>Your Patients</CardTitle>
                    <CardDescription>View and manage your list of assigned patients.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Ravi Kumar</p>
                        <p className="text-sm text-muted-foreground">Last visit: 12 Dec 2024</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Priya Sharma</p>
                        <p className="text-sm text-muted-foreground">Last visit: 10 Dec 2024</p>
                      </div>
                       <Button variant="ghost" size="icon">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="consultations" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Past Consultations</CardTitle>
                    <CardDescription>Review history of your video and in-person consultations.</CardDescription>
                  </CardHeader>
                   <CardContent className="text-center text-muted-foreground py-12">
                    <p>Consultation history will be available here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

               <TabsContent value="reports" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>Patient Reports</CardTitle>
                    <CardDescription>Review and manage uploaded patient reports.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-12">
                    <p>A list of patient reports pending review will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
