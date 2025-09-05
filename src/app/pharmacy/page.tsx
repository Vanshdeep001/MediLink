
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, IndianRupee, Archive, Users, PlusCircle, Search, Filter, Truck, CheckCircle, Package } from "lucide-react";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { Input } from "@/components/ui/input";

export default function PharmacyDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-20">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center py-16 md:py-24 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>Welcome back,</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">Pharmacy!</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground animate-text-fade-in-scale" style={{ animationDelay: '0.4s' }}>
              Manage prescriptions, inventory, orders, and deliveries easily.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-content-fade-in" style={{ animationDelay: '0.6s' }}>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Prescriptions</CardTitle>
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Pending verification</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
                <IndianRupee className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹8,500</div>
                <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <Archive className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Reorder needed</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Customers Served</CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>
          </div>

          <div className="animate-content-fade-in" style={{ animationDelay: '0.8s' }}>
            <Tabs defaultValue="prescriptions" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="prescriptions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Prescription Queue</CardTitle>
                    <CardDescription>View and process incoming prescriptions from patients and doctors.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="Search by patient name or prescription ID..." className="pl-10" />
                    </div>
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">#PR-1024 - Ravi Kumar</p>
                          <p className="text-sm text-muted-foreground">Dr. Anjali Sharma</p>
                        </div>
                        <Button>Verify & Process</Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">#PR-1023 - Priya Sharma</p>
                          <p className="text-sm text-muted-foreground">Dr. Vikram Singh</p>
                        </div>
                        <Button>Verify & Process</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="mt-6">
                 <Card>
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle>Manage Inventory</CardTitle>
                      <CardDescription>Keep track of your medicine stock and expiry dates.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-5 w-5" /> Add Medicine</Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="Search for medicines..." className="pl-10" />
                    </div>
                     <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center bg-destructive/10 p-3 rounded-md">
                        <div>
                          <p className="font-semibold">Paracetamol 500mg</p>
                          <p className="text-sm text-destructive">Low Stock: 12 units left</p>
                        </div>
                        <Button variant="outline">Reorder</Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Aspirin 81mg</p>
                          <p className="text-sm text-muted-foreground">In Stock: 250 units</p>
                        </div>
                        <Button variant="ghost">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Queue</CardTitle>
                    <CardDescription>Manage and fulfill medicine orders.</CardDescription>
                  </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="flex gap-2">
                        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> All</Button>
                        <Button variant="ghost">Pending</Button>
                        <Button variant="ghost">Completed</Button>
                     </div>
                     <div className="border rounded-lg p-4 space-y-4">
                       <div className="flex justify-between items-center">
                         <div>
                           <p className="font-semibold">Order #ORD-201</p>
                           <p className="text-sm text-muted-foreground">Sunita Devi - Pickup</p>
                         </div>
                         <Button><Package className="mr-2 h-5 w-5" /> Pack Order</Button>
                       </div>
                       <div className="flex justify-between items-center">
                         <div>
                           <p className="font-semibold">Order #ORD-200</p>
                           <p className="text-sm text-muted-foreground">Amit Singh - Home Delivery</p>
                         </div>
                          <Button><Package className="mr-2 h-5 w-5" /> Pack Order</Button>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </TabsContent>

               <TabsContent value="deliveries" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>Delivery Management</CardTitle>
                    <CardDescription>Track and manage home deliveries.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                         <div>
                           <p className="font-semibold">#ORD-200 - Amit Singh</p>
                           <p className="text-sm text-muted-foreground">Village Rampur, Near Post Office</p>
                         </div>
                         <Button><Truck className="mr-2 h-5 w-5" /> Assign for Delivery</Button>
                       </div>
                       <div className="flex justify-between items-center">
                         <div>
                           <p className="font-semibold">#ORD-198 - Geeta Kumari</p>
                           <p className="text-sm text-muted-foreground">Village Alipur, Main Market</p>
                         </div>
                         <div className="flex items-center gap-2 text-primary">
                          <CheckCircle className="w-5 h-5" />
                          <span>Delivered</span>
                         </div>
                       </div>
                    </div>
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
