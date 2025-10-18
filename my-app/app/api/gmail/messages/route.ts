import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { GmailService } from '@/lib/gmail-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const messageId = searchParams.get('messageId');

    const gmailService = new GmailService(session.accessToken);

    if (messageId) {
      // Get specific message
      const message = await gmailService.getMessageById(messageId);
      if (!message) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }
      return NextResponse.json({ message });
    } else {
      // Get list of messages
      const messages = await gmailService.getMessages(maxResults);
      return NextResponse.json({ messages });
    }
  } catch (error) {
    console.error('Gmail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Gmail messages' }, 
      { status: 500 }
    );
  }
}
