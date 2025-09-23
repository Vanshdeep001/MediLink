'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Home, 
  Search, 
  Filter,
  Eye,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { LanguageContext } from '@/context/language-context';
import { orderService } from '@/lib/order-service';
import type { Order, Notification } from '@/lib/types';

interface OrderManagementProps {
  pharmacyId: string;
  pharmacyName: string;
}

export function OrderManagement({ pharmacyId, pharmacyName }: OrderManagementProps) {
  const { translations } = useContext(LanguageContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadOrders();
    loadNotifications();
    
    // Refresh data every 5 seconds
    const interval = setInterval(() => {
      loadOrders();
      loadNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [pharmacyId]);

  const loadOrders = () => {
    const pharmacyOrders = orderService.getPharmacyOrders(pharmacyId);
    setOrders(pharmacyOrders);
  };

  const loadNotifications = () => {
    const pharmacyNotifications = orderService.getUserNotifications('pharmacy', pharmacyId);
    setNotifications(pharmacyNotifications);
  };

  const handleOrderAction = (orderId: string, action: 'accept' | 'reject' | 'ready' | 'out_for_delivery' | 'delivered') => {
    let newStatus: Order['status'];
    let notes: string | undefined;

    switch (action) {
      case 'accept':
        newStatus = 'accepted';
        break;
      case 'reject':
        newStatus = 'rejected';
        notes = rejectionReason;
        break;
      case 'ready':
        newStatus = 'ready_for_pickup';
        break;
      case 'out_for_delivery':
        newStatus = 'out_for_delivery';
        break;
      case 'delivered':
        newStatus = 'delivered';
        break;
      default:
        return;
    }

    const updatedOrder = orderService.updateOrderStatus(orderId, newStatus, notes);
    if (updatedOrder) {
      loadOrders();
      setSelectedOrder(updatedOrder);
      setRejectionReason('');
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    orderService.markNotificationAsRead(notificationId);
    loadNotifications();
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'ready_for_pickup': return <Package className="w-4 h-4 text-blue-500" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders" className="relative">
            Orders
            {unreadNotifications.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs">
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
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
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="ready_for_pickup">Ready for Pickup</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">Order #{order.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.patientName} • {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4" />
                            {order.patientPhone}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4" />
                            {order.patientAddress}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {order.deliveryType === 'pickup' ? (
                              <Package className="w-4 h-4" />
                            ) : (
                              <Home className="w-4 h-4" />
                            )}
                            {order.deliveryType === 'pickup' ? 'Pickup' : 'Home Delivery'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Total Amount: </span>
                            <span className="text-lg font-bold">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                          {order.prescriptionId && (
                            <div className="text-sm text-muted-foreground">
                              Prescription: #{order.prescriptionId}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <h5 className="font-medium text-sm">Order Items:</h5>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <span>{item.medicine.name}</span>
                              <Badge variant={item.isAvailable ? "default" : "destructive"} className="text-xs">
                                {item.isAvailable ? "Available" : "Out of Stock"}
                              </Badge>
                            </div>
                            <span>x{item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="bg-red-50 p-2 rounded text-sm text-red-800 mb-3">
                          <strong>Rejection Reason:</strong> {order.notes}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        
                        {order.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleOrderAction(order.id, 'accept')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt('Reason for rejection:');
                                if (reason) {
                                  setRejectionReason(reason);
                                  handleOrderAction(order.id, 'reject');
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        {order.status === 'accepted' && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderAction(order.id, 'ready')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Package className="w-4 h-4 mr-1" />
                            Ready for Pickup
                          </Button>
                        )}

                        {order.status === 'ready_for_pickup' && order.deliveryType === 'home_delivery' && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderAction(order.id, 'out_for_delivery')}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Truck className="w-4 h-4 mr-1" />
                            Out for Delivery
                          </Button>
                        )}

                        {(order.status === 'ready_for_pickup' || order.status === 'out_for_delivery') && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderAction(order.id, 'delivered')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Mark as Delivered
                          </Button>
                        )}
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

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Recent order notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border rounded-lg p-4 ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{notification.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No notifications</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting action</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Today's Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{orders
                    .filter(o => o.status === 'delivered' && 
                      new Date(o.createdAt).toDateString() === new Date().toDateString())
                    .reduce((sum, o) => sum + o.totalAmount, 0)
                    .toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Completed orders</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Order Details - #{selectedOrder.id}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="absolute right-4 top-4"
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Patient Name</Label>
                  <p className="text-sm">{selectedOrder.patientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedOrder.patientPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <p className="text-sm">{selectedOrder.patientAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Delivery Type</Label>
                  <p className="text-sm">{selectedOrder.deliveryType}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Order Items</Label>
                <div className="space-y-2 mt-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{item.medicine.name}</span>
                        <Badge variant={item.isAvailable ? "default" : "destructive"} className="ml-2 text-xs">
                          {item.isAvailable ? "Available" : "Out of Stock"}
                        </Badge>
                      </div>
                      <span>x{item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount</span>
                  <span className="text-lg font-bold">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}




