// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>();

// Send message to specific user
export function sendMessageToUser(userId: string, message: any) {
  const controller = connections.get(userId);
  if (controller) {
    const data = JSON.stringify(message);
    controller.enqueue(`data: ${data}\n\n`);
  }
}

// Broadcast message to all users
export function broadcastMessage(message: any) {
  connections.forEach((controller) => {
    const data = JSON.stringify(message);
    controller.enqueue(`data: ${data}\n\n`);
  });
}

// Add connection
export function addConnection(userId: string, controller: ReadableStreamDefaultController) {
  connections.set(userId, controller);
}

// Remove connection
export function removeConnection(userId: string) {
  connections.delete(userId);
}

// Get active connections count
export function getActiveConnectionsCount(): number {
  return connections.size;
}
