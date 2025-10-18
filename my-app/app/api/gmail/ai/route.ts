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
    const format = searchParams.get('format') || 'structured'; // 'structured' | 'text' | 'financial'
    const type = searchParams.get('type') || 'all'; // 'all' | 'financial' | 'receipts' | 'bills'

    const gmailService = new GmailService(session.accessToken);

    switch (format) {
      case 'text':
        // Return as plain text for AI processing
        const textData = await gmailService.getMessagesAsText(maxResults);
        return new NextResponse(textData, {
          headers: { 'Content-Type': 'text/plain' }
        });

      case 'financial':
        // Return only financial messages
        const financialMessages = await gmailService.getFinancialMessages(maxResults);
        return NextResponse.json({ 
          messages: financialMessages,
          count: financialMessages.length,
          type: 'financial'
        });

      case 'structured':
      default:
        // Return structured data
        const messages = await gmailService.getAIReadableMessages(maxResults);
        
        // Filter by type if specified
        let filteredMessages = messages;
        if (type !== 'all') {
          filteredMessages = messages.filter(msg => msg.type === type);
        }

        return NextResponse.json({ 
          messages: filteredMessages,
          count: filteredMessages.length,
          type: type,
          summary: {
            total: messages.length,
            receipts: messages.filter(m => m.type === 'receipt').length,
            bills: messages.filter(m => m.type === 'bill').length,
            newsletters: messages.filter(m => m.type === 'newsletter').length,
            personal: messages.filter(m => m.type === 'personal').length,
            other: messages.filter(m => m.type === 'other').length
          }
        });
    }
  } catch (error) {
    console.error('Gmail AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Gmail data for AI processing' }, 
      { status: 500 }
    );
  }
}
