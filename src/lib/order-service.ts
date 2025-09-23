import type { Order, OrderItem, Prescription, PrescriptionOrder, Pharmacy, Notification } from './types';

// Mock data storage (in a real app, this would be a database)
let orders: Order[] = [];
let prescriptionOrders: PrescriptionOrder[] = [];

export const orderService = {
  // Get all prescription orders
  getPrescriptionOrders(): PrescriptionOrder[] {
    return prescriptionOrders;
  },

  // Get orders for a specific patient
  getPatientOrders(patientName: string): Order[] {
    return orders.filter(order => order.patientName === patientName);
  },

  // Convert prescription to order items
  convertPrescriptionToOrderItems(pharmacyName: string, prescription: Prescription): OrderItem[] {
    // Mock conversion - in real app, this would check pharmacy inventory
    return prescription.medications.map(medication => ({
      medicineId: `med_${medication.name.replace(/\s+/g, '_').toLowerCase()}`,
      medicine: {
        name: medication.name,
        strength: medication.dosage,
        manufacturer: 'Generic Pharma',
        category: 'Prescription',
        description: `${medication.name} ${medication.dosage}`,
        sideEffects: ['Nausea', 'Dizziness'],
        contraindications: ['Pregnancy', 'Allergy'],
        storageInstructions: 'Store in cool, dry place'
      },
      quantity: 1, // Default quantity
      price: Math.floor(Math.random() * 500) + 50, // Mock price between 50-550
      isAvailable: Math.random() > 0.2, // 80% availability
      alternativeMedicines: Math.random() > 0.7 ? [
        {
          name: `Alternative ${medication.name}`,
          strength: medication.dosage,
          manufacturer: 'Alt Pharma'
        }
      ] : undefined
    }));
  },

  // Create a new order
  createOrder(orderData: {
    patientName: string;
    patientPhone: string;
    patientAddress: string;
    pharmacyId: string;
    pharmacyName: string;
    prescriptionId?: string;
    items: OrderItem[];
    totalAmount: number;
    status: Order['status'];
    deliveryType: 'pickup' | 'home_delivery';
    deliveryAddress?: string;
  }): Order {
    const newOrder: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientName: orderData.patientName,
      patientPhone: orderData.patientPhone,
      patientAddress: orderData.patientAddress,
      pharmacyId: orderData.pharmacyId,
      pharmacyName: orderData.pharmacyName,
      prescriptionId: orderData.prescriptionId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: orderData.status,
      deliveryType: orderData.deliveryType,
      deliveryAddress: orderData.deliveryAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.push(newOrder);
    return newOrder;
  },

  // Update prescription order status
  updatePrescriptionOrderStatus(prescriptionId: string, status: 'pending' | 'ordered' | 'completed'): void {
    const prescriptionOrder = prescriptionOrders.find(po => po.prescriptionId === prescriptionId);
    if (prescriptionOrder) {
      prescriptionOrder.status = status;
      prescriptionOrder.updatedAt = new Date().toISOString();
    } else {
      // Create new prescription order if it doesn't exist
      const newPrescriptionOrder: PrescriptionOrder = {
        prescriptionId,
        doctorName: 'Dr. Smith', // Mock doctor name
        medications: [], // Would be populated from prescription
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      prescriptionOrders.push(newPrescriptionOrder);
    }
  },

  // Update order status
  updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Order | undefined {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (notes) {
        order.notes = notes;
      }
      order.updatedAt = new Date().toISOString();
      return order;
    }
    return undefined;
  },

  // Get order by ID
  getOrderById(orderId: string): Order | undefined {
    return orders.find(order => order.id === orderId);
  },

  // Get all orders (for admin/pharmacy view)
  getAllOrders(): Order[] {
    return orders;
  },

  // Get orders for a specific pharmacy
  getPharmacyOrders(pharmacyId: string): Order[] {
    return orders.filter(order => order.pharmacyId === pharmacyId);
  },

  // Get notifications for a specific user type and ID
  getUserNotifications(userType: 'patient' | 'doctor' | 'pharmacy', userId: string): Notification[] {
    // Mock notifications - in a real app, this would query a notifications table
    return [
      {
        id: `notif_${Date.now()}_1`,
        for: userType,
        message: `New order received for ${userType}`,
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: `notif_${Date.now()}_2`,
        for: userType,
        message: `Order status updated`,
        read: true,
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ];
  },

  // Mark notification as read
  markNotificationAsRead(notificationId: string): void {
    // Mock implementation - in a real app, this would update the notification in the database
    console.log(`Marking notification ${notificationId} as read`);
  }
};

