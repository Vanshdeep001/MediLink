// Emergency Service for Telemedicine App
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface Ambulance {
  id: string;
  driver: string;
  vehicle: string;
  location: Location;
  availability: boolean;
  phone: string;
  licensePlate: string;
  equipment: string[];
  eta: number; // in minutes
}

export interface LocalTransport {
  id: string;
  driver: string;
  vehicle: string;
  location: Location;
  availability: boolean;
  phone: string;
  capacity: number;
  eta: number; // in minutes
}

export interface EmergencyRequest {
  id: string;
  patientId: string;
  patientName: string;
  digitalHealthId: string;
  location: Location;
  pinCode?: string;
  timestamp: string;
  status: 'pending' | 'assigned' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
  assignedVehicle?: Ambulance | LocalTransport;
  emergencyContacts: EmergencyContact[];
  priority: 'high' | 'critical';
  notes?: string;
}

export interface EmergencyResponse {
  success: boolean;
  requestId: string;
  assignedVehicle: Ambulance | LocalTransport | null;
  eta: number;
  message: string;
  contactsNotified: string[];
  offlineMode: boolean;
}

// Mock Database
export const ambulancesDatabase: Ambulance[] = [
  {
    id: 'amb_001',
    driver: 'Rajesh Kumar',
    vehicle: 'Advanced Life Support Ambulance',
    location: { latitude: 30.123, longitude: 76.456, timestamp: new Date().toISOString() },
    availability: true,
    phone: '+91-9876543210',
    licensePlate: 'PB-01-AB-1234',
    equipment: ['Oxygen', 'Defibrillator', 'Stretcher', 'First Aid Kit'],
    eta: 15
  },
  {
    id: 'amb_002',
    driver: 'Priya Sharma',
    vehicle: 'Basic Life Support Ambulance',
    location: { latitude: 30.223, longitude: 76.556, timestamp: new Date().toISOString() },
    availability: true,
    phone: '+91-9876543211',
    licensePlate: 'PB-02-CD-5678',
    equipment: ['Oxygen', 'Stretcher', 'First Aid Kit'],
    eta: 20
  },
  {
    id: 'amb_003',
    driver: 'Amit Singh',
    vehicle: 'Advanced Life Support Ambulance',
    location: { latitude: 30.323, longitude: 76.656, timestamp: new Date().toISOString() },
    availability: false,
    phone: '+91-9876543212',
    licensePlate: 'PB-03-EF-9012',
    equipment: ['Oxygen', 'Defibrillator', 'Stretcher', 'First Aid Kit'],
    eta: 25
  }
];

export const localTransportDatabase: LocalTransport[] = [
  {
    id: 'local_001',
    driver: 'Gurpreet Singh',
    vehicle: 'Tractor with Trolley',
    location: { latitude: 30.423, longitude: 76.756, timestamp: new Date().toISOString() },
    availability: true,
    phone: '+91-9876543213',
    capacity: 4,
    eta: 30
  },
  {
    id: 'local_002',
    driver: 'Sunita Devi',
    vehicle: 'Auto Rickshaw',
    location: { latitude: 30.523, longitude: 76.856, timestamp: new Date().toISOString() },
    availability: true,
    phone: '+91-9876543214',
    capacity: 3,
    eta: 25
  },
  {
    id: 'local_003',
    driver: 'Ram Prasad',
    vehicle: 'Motorcycle with Sidecar',
    location: { latitude: 30.623, longitude: 76.956, timestamp: new Date().toISOString() },
    availability: true,
    phone: '+91-9876543215',
    capacity: 2,
    eta: 20
  }
];

export const emergencyContactsDatabase: EmergencyContact[] = [
  {
    id: 'contact_001',
    name: 'Patient\'s Father',
    phone: '+91-9876543216',
    relationship: 'Father',
    isPrimary: true
  },
  {
    id: 'contact_002',
    name: 'ASHA Worker - Kamla Devi',
    phone: '+91-9876543217',
    relationship: 'ASHA Worker',
    isPrimary: false
  },
  {
    id: 'contact_003',
    name: 'Neighbor - Ramesh Kumar',
    phone: '+91-9876543218',
    relationship: 'Neighbor',
    isPrimary: false
  }
];

// Utility Functions
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function findNearestAmbulance(patientLocation: Location): Ambulance | null {
  const availableAmbulances = ambulancesDatabase.filter(amb => amb.availability);
  
  if (availableAmbulances.length === 0) return null;
  
  let nearestAmbulance = availableAmbulances[0];
  let minDistance = calculateDistance(
    patientLocation.latitude, 
    patientLocation.longitude,
    nearestAmbulance.location.latitude,
    nearestAmbulance.location.longitude
  );
  
  for (const ambulance of availableAmbulances) {
    const distance = calculateDistance(
      patientLocation.latitude,
      patientLocation.longitude,
      ambulance.location.latitude,
      ambulance.location.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestAmbulance = ambulance;
    }
  }
  
  // Only assign if within 10km
  return minDistance <= 10 ? nearestAmbulance : null;
}

export function findNearestLocalTransport(patientLocation: Location): LocalTransport | null {
  const availableTransport = localTransportDatabase.filter(transport => transport.availability);
  
  if (availableTransport.length === 0) return null;
  
  let nearestTransport = availableTransport[0];
  let minDistance = calculateDistance(
    patientLocation.latitude,
    patientLocation.longitude,
    nearestTransport.location.latitude,
    nearestTransport.location.longitude
  );
  
  for (const transport of availableTransport) {
    const distance = calculateDistance(
      patientLocation.latitude,
      patientLocation.longitude,
      transport.location.latitude,
      transport.location.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestTransport = transport;
    }
  }
  
  return nearestTransport;
}

// Main Emergency Service Class
export class EmergencyService {
  private static instance: EmergencyService;
  private emergencyRequests: EmergencyRequest[] = [];
  private isOnline: boolean = true;

  static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  // Location Services
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Emergency Request Processing
  async processEmergencyRequest(
    patientId: string,
    patientName: string,
    digitalHealthId: string,
    location?: Location,
    pinCode?: string
  ): Promise<EmergencyResponse> {
    try {
      // Get location if not provided
      let patientLocation = location;
      if (!patientLocation) {
        try {
          patientLocation = await this.getCurrentLocation();
        } catch (error) {
          if (!pinCode) {
            throw new Error('Location access denied and no PIN code provided');
          }
          // Use a default location for PIN code fallback
          patientLocation = {
            latitude: 30.123, // Default coordinates
            longitude: 76.456,
            timestamp: new Date().toISOString()
          };
        }
      }

      // Create emergency request
      const request: EmergencyRequest = {
        id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        patientId,
        patientName,
        digitalHealthId,
        location: patientLocation,
        pinCode,
        timestamp: new Date().toISOString(),
        status: 'pending',
        emergencyContacts: emergencyContactsDatabase,
        priority: 'critical'
      };

      // Try to find ambulance first
      let assignedVehicle: Ambulance | LocalTransport | null = null;
      let message = '';
      let eta = 0;

      const nearestAmbulance = findNearestAmbulance(patientLocation);
      if (nearestAmbulance) {
        assignedVehicle = nearestAmbulance;
        request.assignedVehicle = nearestAmbulance;
        request.status = 'assigned';
        message = `Ambulance assigned! Driver: ${nearestAmbulance.driver}, ETA: ${nearestAmbulance.eta} minutes`;
        eta = nearestAmbulance.eta;
      } else {
        // Fallback to local transport
        const nearestTransport = findNearestLocalTransport(patientLocation);
        if (nearestTransport) {
          assignedVehicle = nearestTransport;
          request.assignedVehicle = nearestTransport;
          request.status = 'assigned';
          message = `No ambulance available. Local vehicle arranged: ${nearestTransport.vehicle} by ${nearestTransport.driver}, ETA: ${nearestTransport.eta} minutes`;
          eta = nearestTransport.eta;
        } else {
          message = 'No vehicles available. Emergency contacts have been notified.';
        }
      }

      // Store request
      this.emergencyRequests.push(request);
      this.saveToLocalStorage(request);

      // Send alerts
      const contactsNotified = await this.sendEmergencyAlerts(request, assignedVehicle);

      return {
        success: true,
        requestId: request.id,
        assignedVehicle,
        eta,
        message,
        contactsNotified,
        offlineMode: !this.isOnline
      };

    } catch (error) {
      console.error('Emergency request failed:', error);
      return {
        success: false,
        requestId: '',
        assignedVehicle: null,
        eta: 0,
        message: 'Emergency request failed. Please try again or call emergency services directly.',
        contactsNotified: [],
        offlineMode: !this.isOnline
      };
    }
  }

  // Alert System
  private async sendEmergencyAlerts(
    request: EmergencyRequest,
    assignedVehicle: Ambulance | LocalTransport | null
  ): Promise<string[]> {
    const notifiedContacts: string[] = [];

    try {
      // Notify emergency contacts
      for (const contact of request.emergencyContacts) {
        try {
          await this.sendSMSAlert(contact, request, assignedVehicle);
          notifiedContacts.push(contact.name);
        } catch (error) {
          console.error(`Failed to notify ${contact.name}:`, error);
        }
      }

      // Notify assigned vehicle driver
      if (assignedVehicle) {
        try {
          await this.notifyDriver(assignedVehicle, request);
        } catch (error) {
          console.error('Failed to notify driver:', error);
        }
      }

    } catch (error) {
      console.error('Alert system failed:', error);
    }

    return notifiedContacts;
  }

  private async sendSMSAlert(
    contact: EmergencyContact,
    request: EmergencyRequest,
    assignedVehicle: Ambulance | LocalTransport | null
  ): Promise<void> {
    // Mock SMS sending - in real implementation, integrate with Twilio or similar
    const message = `EMERGENCY ALERT: ${request.patientName} (ID: ${request.digitalHealthId}) needs immediate help. Location: ${request.location.latitude}, ${request.location.longitude}. Time: ${new Date(request.timestamp).toLocaleString()}. ${assignedVehicle ? `Vehicle assigned: ${assignedVehicle.driver} (${assignedVehicle.phone})` : 'No vehicle available yet.'}`;
    
    console.log(`SMS to ${contact.name} (${contact.phone}): ${message}`);
    
    // Simulate SMS delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async notifyDriver(
    vehicle: Ambulance | LocalTransport,
    request: EmergencyRequest
  ): Promise<void> {
    // Mock driver notification
    const message = `NEW EMERGENCY: ${request.patientName} at ${request.location.latitude}, ${request.location.longitude}. Please proceed immediately.`;
    
    console.log(`Driver notification to ${vehicle.driver} (${vehicle.phone}): ${message}`);
    
    // Simulate notification delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Offline Support
  private saveToLocalStorage(request: EmergencyRequest): void {
    try {
      const existingRequests = JSON.parse(localStorage.getItem('emergency_requests') || '[]');
      existingRequests.push(request);
      localStorage.setItem('emergency_requests', JSON.stringify(existingRequests));
    } catch (error) {
      console.error('Failed to save emergency request locally:', error);
    }
  }

  async syncOfflineRequests(): Promise<void> {
    try {
      const offlineRequests = JSON.parse(localStorage.getItem('emergency_requests') || '[]');
      
      for (const request of offlineRequests) {
        if (request.status === 'pending') {
          await this.processEmergencyRequest(
            request.patientId,
            request.patientName,
            request.digitalHealthId,
            request.location,
            request.pinCode
          );
        }
      }
      
      // Clear synced requests
      localStorage.removeItem('emergency_requests');
    } catch (error) {
      console.error('Failed to sync offline requests:', error);
    }
  }

  // Status Updates
  updateRequestStatus(requestId: string, status: EmergencyRequest['status']): void {
    const request = this.emergencyRequests.find(req => req.id === requestId);
    if (request) {
      request.status = status;
      this.saveToLocalStorage(request);
    }
  }

  getRequestStatus(requestId: string): EmergencyRequest | null {
    return this.emergencyRequests.find(req => req.id === requestId) || null;
  }

  // Network Status
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline) {
      this.syncOfflineRequests();
    }
  }

  // Emergency Contact Management
  getEmergencyContacts(): EmergencyContact[] {
    return emergencyContactsDatabase;
  }

  addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): void {
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    emergencyContactsDatabase.push(newContact);
  }
}











