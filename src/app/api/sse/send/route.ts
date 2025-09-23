import { NextRequest, NextResponse } from 'next/server';
import { sendMessageToUser, broadcastMessage } from '@/lib/sse-service';

export async function POST(request: NextRequest) {
  try {
    const message = await request.json();
    
    if (message.to) {
      // Send to specific user
      sendMessageToUser(message.to, message);
    } else if (message.roomId) {
      // Broadcast to room (simplified - in production, manage room subscriptions)
      broadcastMessage(message);
    } else {
      // Broadcast to all users
      broadcastMessage(message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending SSE message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

