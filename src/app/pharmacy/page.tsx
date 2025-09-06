
'use client';
import { useContext, useEffect, useState } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, IndianRupee, Archive, Users, PlusCircle, Search, Filter, Truck, CheckCircle, Package } from "lucide-react";
import TextFlipper from "@/components/ui/text-effect-flipper";
import { Input } from "@/components/ui/input";
import { LanguageContext } from '@/context/language-context';
import type { Prescription } from '@/lib/types';

export default function PharmacyDashboard() {
  const { translations } = useContext(LanguageContext);
  const [pharmacyName, setPharmacyName] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch this from a user session or context
    const userString = localStorage.getItem('temp_user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        // Assuming pharmacyName is stored during pharmacy registration
        setPharmacyName(user.pharmacyName || 'Pharmacy');
      } catch (e) {
        setPharmacyName('Pharmacy');
      }
    } else {
      setPharmacyName('Pharmacy');
    }

    const prescriptionsString = localStorage.getItem('prescriptions_list');
    if (prescriptionsString) {
      setPrescriptions(JSON.parse(prescriptionsString));
    }
    
    // Periodically check for new prescriptions
    const interval = setInterval(() => {
        const updatedPrescriptionsString = localStorage.getItem('prescriptions_list');
        if (updatedPrescriptionsString) {
            setPrescriptions(JSON.parse(updatedPrescriptionsString));
        }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);

  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-20 pb-24">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center py-16 md:py-24 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <TextFlipper>{translations.pharmacyDashboard.welcome}</TextFlipper> <TextFlipper delay={0.2} className="text-primary font-cursive">{pharmacyName}!</TextFlipper>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground animate-text-fade-in-scale" style={{ animationDelay: '0.4s' }}>
              {translations.pharmacyDashboard.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-content-fade-in" style={{ animationDelay: '0.6s' }}>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.pharmacyDashboard.todaysPrescriptions}</CardTitle>
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{prescriptions.length}</div>
                <p className="text-xs text-muted-foreground">{translations.pharmacyDashboard.pendingVerification}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.pharmacyDashboard.dailyRevenue}</CardTitle>
                <IndianRupee className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹8,500</div>
                <p className="text-xs text-muted-foreground">{translations.pharmacyDashboard.revenueChange}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.pharmacyDashboard.lowStockItems}</CardTitle>
                <Archive className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">{translations.pharmacyDashboard.reorderNeeded}</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl hover:-translate-y-2 transition-transform duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{translations.pharmacyDashboard.customersServed}</CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">{translations.pharmacyDashboard.today}</p>
              </CardContent>
            </Card>
          </div>

          <div className="animate-content-fade-in" style={{ animationDelay: '0.8s' }}>
            <Tabs defaultValue="prescriptions" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="prescriptions">{translations.pharmacyDashboard.prescriptions}</TabsTrigger>
                <TabsTrigger value="inventory">{translations.pharmacyDashboard.inventory}</TabsTrigger>
                <TabsTrigger value="orders">{translations.pharmacyDashboard.orders}</TabsTrigger>
                <TabsTrigger value="deliveries">{translations.pharmacyDashboard.deliveries}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="prescriptions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{translations.pharmacyDashboard.prescriptionQueue}</CardTitle>
                    <CardDescription>{translations.pharmacyDashboard.prescriptionQueueDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder={translations.pharmacyDashboard.searchPlaceholder} className="pl-10" />
                    </div>
                     <div className="border rounded-lg p-4 space-y-4">
                      {prescriptions.length > 0 ? prescriptions.map((presc) => (
                        <div key={presc.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{presc.id} - {presc.patientName}</p>
                            <p className="text-sm text-muted-foreground">Dr. {presc.doctorName}</p>
                          </div>
                          <Button>{translations.pharmacyDashboard.verifyButton}</Button>
                        </div>
                      )) : (
                        <p className="text-center text-muted-foreground py-4">{translations.pharmacyDashboard.noPrescriptions}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="mt-6">
                 <Card>
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle>{translations.pharmacyDashboard.manageInventory}</CardTitle>
                      <CardDescription>{translations.pharmacyDashboard.manageInventoryDesc}</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-5 w-5" /> {translations.pharmacyDashboard.addMedicine}</Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder={translations.pharmacyDashboard.searchMedicines} className="pl-10" />
                    </div>
                     <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center bg-destructive/10 p-3 rounded-md">
                        <div>
                          <p className="font-semibold">Paracetamol 500mg</p>
                          <p className="text-sm text-destructive">{translations.pharmacyDashboard.lowStock}: 12 {translations.pharmacyDashboard.unitsLeft}</p>
                        </div>
                        <Button variant="outline">{translations.pharmacyDashboard.reorder}</Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Aspirin 81mg</p>
                          <p className="text-sm text-muted-foreground">{translations.pharmacyDashboard.inStock}: 250 units</p>
                        </div>
                        <Button variant="ghost">{translations.pharmacyDashboard.viewDetails}</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{translations.pharmacyDashboard.orderQueue}</CardTitle>
                    <CardDescription>{translations.pharmacyDashboard.orderQueueDesc}</CardDescription>
                  </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="flex gap-2">
                        <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> {translations.pharmacyDashboard.all}</Button>
                        <Button variant="ghost">{translations.pharmacyDashboard.pending}</Button>
                        <Button variant="ghost">{translations.pharmacyDashboard.completed}</Button>
                     </div>
                     <div className="border rounded-lg p-4 space-y-4">
                       <div className="flex justify-between items-center">
                         <div>
                           <p className="font-semibold">Order #ORD-201</p>
                           <p className="text-sm text-muted-foreground">Sunita Devi - Pickup</p>
                         </div>
                         <Button><Package className="mr-2 h-5 w-5" /> {translations.pharmacyDashboard.packOrder}</Button>
                       </div>
                       <div className="flex justify-between items-center">
                         <div>
                           <p className="font-semibold">Order #ORD-200</p>
                           <p className="text-sm text-muted-foreground">Amit Singh - Home Delivery</p>
                         </div>
                          <Button><Package className="mr-2 h-5 w-5" /> {translations.pharmacyDashboard.packOrder}</Button>
                       </div>
                     </div>
                  </CardContent>
                </Card>
              </TabsContent>

               <TabsContent value="deliveries" className="mt-6">
                 <Card>
                  <CardHeader>
                    <CardTitle>{translations.pharmacyDashboard.deliveryManagement}</CardTitle>
                    <CardDescription>{translations.pharmacyDashboard.deliveryManagementDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                         <div>
                           <p className="font-semibold">#ORD-200 - Amit Singh</p>
                           <p className="text-sm text-muted-foreground">Village Rampur, Near Post Office</p>
                         </div>
                         <Button><Truck className="mr-2 h-5 w-5" /> {translations.pharmacyDashboard.assignDelivery}</Button>
                       </div>
                       <div className="flex justify-between items-center">
                         <div>
                           <p className="font-semibold">#ORD-198 - Geeta Kumari</p>
                           <p className="text-sm text-muted-foreground">Village Alipur, Main Market</p>
                         </div>
                         <div className="flex items-center gap-2 text-primary">
                          <CheckCircle className="w-5 h-5" />
                          <span>{translations.pharmacyDashboard.delivered}</span>
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
