// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'MediLink';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/favicon.ico',
    badge: payload.notification?.badge || '/favicon.ico',
    image: payload.notification?.image,
    tag: payload.data?.tag || 'medilink-notification',
    requireInteraction: payload.data?.requireInteraction === 'true',
    silent: payload.data?.silent === 'true',
    data: payload.data,
    actions: payload.data?.actions ? JSON.parse(payload.data.actions) : [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Handle different actions
  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  const clickAction = event.notification.data?.clickAction;
  const url = clickAction || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal if needed
  if (event.notification.data?.trackDismissal) {
    // Send analytics event or update user preferences
    console.log('Notification dismissed:', event.notification.tag);
  }
});

// Handle push events (for additional push handling if needed)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('Push payload:', payload);
      
      // Handle custom push logic here if needed
      // The onBackgroundMessage handler above will handle most cases
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle service worker fetch events
self.addEventListener('fetch', (event) => {
  // Add any custom fetch handling if needed
  // For now, we'll let the browser handle all requests normally
});

// Handle service worker message events
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle service worker sync events (for background sync)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      doBackgroundSync()
    );
  }
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Sync offline data, send queued messages, etc.
    console.log('Performing background sync...');
    
    // Example: Sync offline chat messages
    const offlineMessages = await getOfflineMessages();
    if (offlineMessages.length > 0) {
      await syncOfflineMessages(offlineMessages);
    }
    
    // Example: Sync offline appointment data
    const offlineAppointments = await getOfflineAppointments();
    if (offlineAppointments.length > 0) {
      await syncOfflineAppointments(offlineAppointments);
    }
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper functions for background sync
async function getOfflineMessages() {
  // Get messages from IndexedDB or localStorage
  return [];
}

async function syncOfflineMessages(messages) {
  // Send offline messages to server
  console.log('Syncing offline messages:', messages.length);
}

async function getOfflineAppointments() {
  // Get appointments from IndexedDB or localStorage
  return [];
}

async function syncOfflineAppointments(appointments) {
  // Send offline appointments to server
  console.log('Syncing offline appointments:', appointments.length);
}



