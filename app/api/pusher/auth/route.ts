import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pusherServer } from '@/lib/pusher'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const body = await request.text()
    const params = new URLSearchParams(body)
    const socketId = params.get('socket_id')
    const channelName = params.get('channel_name')

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 })
    }

    // Only allow users to subscribe to conversation channels they participate in
    if (channelName.startsWith('private-conversation-')) {
      const conversationId = channelName.replace('private-conversation-', '')
      // In production you'd verify the user is a participant of this conversation
      const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
        user_id: session.user.id,
        user_info: { name: session.user.name },
      })
      return NextResponse.json(authResponse)
    }

    // For public channels (no prefix), just authenticate
    if (channelName.startsWith('conversation-')) {
      const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
        user_id: session.user.id,
      })
      return NextResponse.json(authResponse)
    }

    return NextResponse.json({ error: 'Canal non autorisé.' }, { status: 403 })
  } catch (err) {
    console.error('Pusher auth error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
