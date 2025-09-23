import { NextRequest } from 'next/server';
import { addConnection, removeConnection } from '@/lib/sse-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response('User ID required', { status: 400 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      addConnection(userId, controller);
      
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        data: { message: 'Connected to MediLink SSE' },
        timestamp: Date.now()
      });
      
      controller.enqueue(`data: ${data}\n\n`);
    },
    cancel() {
      // Clean up connection
      removeConnection(userId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

