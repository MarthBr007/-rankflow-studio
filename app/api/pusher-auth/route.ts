import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/app/lib/pusher-server';

export async function POST(request: NextRequest) {
  try {
    const { channel_name, socket_id, user_id, user_info } = await request.json();

    if (!channel_name || !socket_id) {
      return NextResponse.json({ error: 'channel_name en socket_id verplicht' }, { status: 400 });
    }

    const presenceData = {
      user_id: user_id || `user-${Math.random().toString(36).slice(2, 10)}`,
      user_info: user_info || {},
    };

    const auth = pusherServer.authorizeChannel(socket_id, channel_name, presenceData);
    return NextResponse.json(auth);
  } catch (error: any) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Auth error' }, { status: 500 });
  }
}

