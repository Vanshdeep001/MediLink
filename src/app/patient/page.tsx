
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Pill, FileText, Heart, PlusCircle, Upload, Search, ChevronRight } from "lucide-react";

export default function PatientDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-28">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-12 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome back, Patient!
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Book your first appointment to get started with your healthcare journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-content-fade-in" style={{ animationDelay: '0.3s' }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">View your schedule</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
                <Pill className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Manage prescriptions</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Medical Reports</CardTitle>
                <FileText className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Access your files</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Health Status</CardTitle>
                <Heart className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Good</div>
                <p className="text-xs text-muted-foreground">Last updated yesterday</p>
              </CardContent>
            </Card>
          </div>

          <div className="animate-content-fade-in" style={{ animationDelay: '0.6s' }}>
            <Tabs defaultValue="appointments" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="health_data">Health Data</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="appointments" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Your Appointments</CardTitle>
                    <CardDescription>View upcoming consultations or book a new one.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Dr. Anjali Sharma</p>
                        <p className="text-sm text-muted-foreground">Cardiology | Tomorrow at 10:30 AM</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                     <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Dr. Vikram Singh</p>
                        <p className="text-sm text-muted-foreground">General Checkup | 25 Dec 2024, 02:00 PM</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Book New Appointment
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Search className="mr-2 h-5 w-5" />
                            Find Doctors
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medications" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>Your Medications</CardTitle>
                    <CardDescription>Keep track of your active prescriptions and set reminders.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Metformin</p>
                        <p className="text-sm text-muted-foreground">500mg, Twice a day</p>
                      </div>
                      <Button variant="outline">Set Reminder</Button>
                    </div>
                    <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div>
                        <p className="font-semibold">Aspirin</p>
                        <p className="text-sm text-muted-foreground">81mg, Once a day</p>
                      </div>
                       <Button variant="outline">Set Reminder</Button>
                    </div>
                    <div className="pt-4">
                      <Button>Order Medicines</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Medical Reports</CardTitle>
                    <CardDescription>All your uploaded health documents in one place.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6" />
                        <div>
                          <p className="font-semibold">Blood Test Report.pdf</p>
                          <p className="text-sm text-muted-foreground">Uploaded on 15 Dec 2024</p>
                        </div>
                      </div>
                      <Button variant="outline">View</Button>
                    </div>
                    <div className="pt-4">
                      <Button>
                        <Upload className="mr-2 h-5 w-5" />
                        Upload New Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

               <TabsContent value="health_data" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>Health Data</CardTitle>
                    <CardDescription>View your basic health metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-muted-foreground py-12">
                    <p>Health data from wearables and manual inputs will be available here in the future.</p>
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
