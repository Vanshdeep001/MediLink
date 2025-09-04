import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Truck } from "lucide-react";

export default function PharmacyDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container py-12">
        <h1 className="text-4xl font-bold mb-8">Pharmacy Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-6 h-6" />
                Manage Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Update and manage your medicine inventory.
              </p>
              <Button>Update Stock</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Confirm Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Respond to prescription requests from patients.
              </p>
              <Button variant="outline">View Requests</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-6 h-6" />
                Handle Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage delivery and pickup for confirmed orders.
              </p>
              <Button variant="outline">Manage Deliveries</Button>
            </CardContent>
          </Card>

        </div>
      </main>
      <Footer />
    </div>
  );
}