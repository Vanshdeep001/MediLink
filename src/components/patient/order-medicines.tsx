'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ShoppingCart, 
  Package, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Truck,
  Home,
  Search,
  Filter
} from 'lucide-react';
import { LanguageContext } from '@/context/language-context';
import { orderService } from '@/lib/order-service';
import type { Order, OrderItem, Prescription, PrescriptionOrder, Pharmacy } from '@/lib/types';

interface OrderMedicinesProps {
  prescriptions: Prescription[];
  pharmacies: Pharmacy[];
  patientName: string;
  patientPhone: string;
  patientAddress: string;
}

export function OrderMedicines({ 
  prescriptions, 
  pharmacies, 
  patientName, 
  patientPhone, 
  patientAddress 
}: OrderMedicinesProps) {
  const { translations } = useContext(LanguageContext);
  const [prescriptionOrders, setPrescriptionOrders] = useState<PrescriptionOrder[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');
  const [selectedPrescription, setSelectedPrescription] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'home_delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState(patientAddress);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load prescription orders and patient orders
    setPrescriptionOrders(orderService.getPrescriptionOrders());
    setOrders(orderService.getPatientOrders(patientName));
  }, [patientName]);

  // Auto-populate order items when prescription is selected
  useEffect(() => {
    if (selectedPrescription && selectedPharmacy) {
      const prescription = prescriptions.find(p => p.id === selectedPrescription);
      if (prescription) {
        const items = orderService.convertPrescriptionToOrderItems(selectedPharmacy, prescription);
        setOrderItems(items);
      }
    }
  }, [selectedPrescription, selectedPharmacy, prescriptions]);

  const handleCreateOrder = () => {
    if (!selectedPharmacy || orderItems.length === 0) return;

    const pharmacy = pharmacies.find(p => p.pharmacyName === selectedPharmacy);
    if (!pharmacy) return;

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = orderService.createOrder({
      patientName,
      patientPhone,
      patientAddress,
      pharmacyId: `pharmacy_${pharmacy.pharmacyName.replace(/\s+/g, '_').toLowerCase()}`,
      pharmacyName: pharmacy.pharmacyName,
      prescriptionId: selectedPrescription,
      items: orderItems,
      totalAmount,
      status: 'pending',
      deliveryType,
      deliveryAddress: deliveryType === 'home_delivery' ? deliveryAddress : undefined
    });

    setOrders(prev => [...prev, order]);
    
    // Update prescription order status
    if (selectedPrescription) {
      orderService.updatePrescriptionOrderStatus(selectedPrescription, 'ordered');
      setPrescriptionOrders(prev => 
        prev.map(po => 
          po.prescriptionId === selectedPrescription 
            ? { ...po, status: 'ordered' as const }
            : po
        )
      );
    }

    // Reset form
    setSelectedPrescription('');
    setOrderItems([]);
  };

  const updateItemQuantity = (medicineId: string, quantity: number) => {
    setOrderItems(prev => 
      prev.map(item => 
        item.medicineId === medicineId 
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeItem = (medicineId: string) => {
    setOrderItems(prev => prev.filter(item => item.medicineId !== medicineId));
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'ready_for_pickup': return <Package className="w-4 h-4 text-blue-500" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'ready_for_pickup': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => 
    order.pharmacyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="new-order" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new-order">New Order</TabsTrigger>
          <TabsTrigger value="my-orders">My Orders</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="new-order" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Medicines
              </CardTitle>
              <CardDescription>
                Select a prescription and pharmacy to place your order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prescription Selection */}
              <div className="space-y-2">
                <Label htmlFor="prescription">Select Prescription</Label>
                <Select value={selectedPrescription || ""} onValueChange={setSelectedPrescription}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a prescription" />
                  </SelectTrigger>
                  <SelectContent>
                    {prescriptions.map((prescription) => (
                      <SelectItem key={prescription.id} value={prescription.id}>
                        {prescription.id} - Dr. {prescription.doctorName || prescription.doctor} - {prescription.date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pharmacy Selection */}
              <div className="space-y-2">
                <Label htmlFor="pharmacy">Select Pharmacy</Label>
                <Select value={selectedPharmacy || ""} onValueChange={setSelectedPharmacy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pharmacy" />
                  </SelectTrigger>
                  <SelectContent>
                    {pharmacies.map((pharmacy) => (
                      <SelectItem key={pharmacy.pharmacyName} value={pharmacy.pharmacyName}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {pharmacy.pharmacyName} - {pharmacy.city}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Order Items */}
              {orderItems.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Order Items</h4>
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.medicineId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{item.medicine.name}</h5>
                            <Badge variant={item.isAvailable ? "default" : "destructive"}>
                              {item.isAvailable ? "Available" : "Out of Stock"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.medicine.strength} - ₹{item.price} each
                          </p>
                          {!item.isAvailable && item.alternativeMedicines && item.alternativeMedicines.length > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                              Alternatives: {item.alternativeMedicines.map(alt => alt.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemQuantity(item.medicineId, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemQuantity(item.medicineId, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(item.medicineId)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Options */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Delivery Options</h4>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pickup"
                          checked={deliveryType === 'pickup'}
                          onCheckedChange={() => setDeliveryType('pickup')}
                        />
                        <Label htmlFor="pickup" className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Pickup
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="delivery"
                          checked={deliveryType === 'home_delivery'}
                          onCheckedChange={() => setDeliveryType('home_delivery')}
                        />
                        <Label htmlFor="delivery" className="flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          Home Delivery
                        </Label>
                      </div>
                    </div>

                    {deliveryType === 'home_delivery' && (
                      <div className="space-y-2">
                        <Label htmlFor="delivery-address">Delivery Address</Label>
                        <Input
                          id="delivery-address"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Enter delivery address"
                        />
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-lg font-bold">
                        ₹{orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleCreateOrder}
                      disabled={orderItems.length === 0 || !selectedPharmacy}
                    >
                      Place Order
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Order #{order.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.pharmacyName} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.medicine.name} x{item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <span className="font-medium">Total: ₹{order.totalAmount.toFixed(2)}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {order.deliveryType === 'pickup' ? (
                            <Package className="w-4 h-4" />
                          ) : (
                            <Home className="w-4 h-4" />
                          )}
                          {order.deliveryType === 'pickup' ? 'Pickup' : 'Home Delivery'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No orders found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Orders</CardTitle>
              <CardDescription>
                Track which prescriptions have been ordered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptionOrders.length > 0 ? (
                  prescriptionOrders.map((prescriptionOrder) => (
                    <div key={prescriptionOrder.prescriptionId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Prescription #{prescriptionOrder.prescriptionId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Dr. {prescriptionOrder.doctorName} • {new Date(prescriptionOrder.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={
                          prescriptionOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          prescriptionOrder.status === 'ordered' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {prescriptionOrder.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        {prescriptionOrder.medications.map((med, index) => (
                          <div key={index} className="text-sm text-muted-foreground">
                            • {med.name} - {med.dosage} - {med.frequency}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No prescription orders found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}





