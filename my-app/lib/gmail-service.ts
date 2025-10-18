import { google } from 'googleapis';
import { JSDOM } from 'jsdom';

export interface GmailMessage {
  id: string;
  subject: string;
  from: string;
  date: number;
  snippet: string;
  textBody: string;
  htmlBody: string;
}

export interface AIReadableMessage {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  date: string;
  content: string;
  summary: string;
  type: 'receipt' | 'bill' | 'newsletter' | 'personal' | 'other';
  amount?: number;
  merchant?: string;
}

export class GmailService {
  private gmail: any;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async getMessages(maxResults: number = 50): Promise<GmailMessage[]> {
    try {
      const res = await this.gmail.users.messages.list({ 
        userId: 'me', 
        maxResults 
      });
      
      const messages = res.data.messages;
      if (!messages || messages.length === 0) return [];

      const messagesWithContent: GmailMessage[] = [];

      for (const msg of messages) {
        try {
          const msgRes = await this.gmail.users.messages.get({ 
            userId: 'me', 
            id: msg.id, 
            format: 'full' 
          });
          
          const message = msgRes.data;
          const processedMessage = this.processMessage(message);
          if (processedMessage) {
            messagesWithContent.push(processedMessage);
          }
        } catch (err) {
          console.error('Error getting message:', err);
        }
      }

      // Sort newest first
      return messagesWithContent.sort((a, b) => b.date - a.date);
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
      throw error;
    }
  }

  private processMessage(message: any): GmailMessage | null {
    try {
      const decodeBase64 = (str: string) => Buffer.from(str, 'base64').toString('utf8');
      
      // Extract headers
      const headers = message.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';
      const date = parseInt(message.internalDate);

      // Extract body content
      let htmlBody = '';
      let textBody = '';

      if (!message.payload.parts) {
        if (message.payload.mimeType === 'text/html') {
          htmlBody = decodeBase64(message.payload.body.data || '');
        } else if (message.payload.mimeType === 'text/plain') {
          textBody = decodeBase64(message.payload.body.data || '');
        }
      } else {
        const htmlPart = message.payload.parts.find((p: any) => p.mimeType === 'text/html');
        const textPart = message.payload.parts.find((p: any) => p.mimeType === 'text/plain');
        
        if (htmlPart) {
          htmlBody = decodeBase64(htmlPart.body.data || '');
        }
        if (textPart) {
          textBody = decodeBase64(textPart.body.data || '');
        }
      }

      // If we have HTML but no text, convert HTML to text
      if (htmlBody && !textBody) {
        textBody = new JSDOM(htmlBody).window.document.body.textContent || '';
        // Clean up text
        textBody = textBody.replace(/\r|\n/g, '');
        textBody = textBody.replace(/\s{2,}/g, ' ');
      }

      return {
        id: message.id,
        subject,
        from,
        date,
        snippet: message.snippet || '',
        textBody: textBody.trim(),
        htmlBody: htmlBody.trim()
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return null;
    }
  }

  async getMessageById(messageId: string): Promise<GmailMessage | null> {
    try {
      const msgRes = await this.gmail.users.messages.get({ 
        userId: 'me', 
        id: messageId, 
        format: 'full' 
      });
      
      return this.processMessage(msgRes.data);
    } catch (error) {
      console.error('Error fetching message by ID:', error);
      return null;
    }
  }

  // AI-specific methods
  async getAIReadableMessages(maxResults: number = 50): Promise<AIReadableMessage[]> {
    const messages = await this.getMessages(maxResults);
    return messages.map(msg => this.convertToAIReadable(msg));
  }

  private convertToAIReadable(message: GmailMessage): AIReadableMessage {
    const cleanContent = this.cleanTextForAI(message.textBody);
    const senderInfo = this.parseSender(message.from);
    const messageType = this.classifyMessage(message);
    const extractedInfo = this.extractFinancialInfo(cleanContent);

    return {
      id: message.id,
      subject: message.subject,
      sender: senderInfo.name,
      senderEmail: senderInfo.email,
      date: new Date(message.date).toISOString(),
      content: cleanContent,
      summary: message.snippet,
      type: messageType,
      amount: extractedInfo.amount,
      merchant: extractedInfo.merchant
    };
  }

  private cleanTextForAI(text: string): string {
    if (!text) return '';
    
    // Remove excessive whitespace and normalize
    let cleaned = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    // Remove common email artifacts
    cleaned = cleaned
      .replace(/https?:\/\/[^\s]+/g, '[URL]') // Replace URLs with placeholder
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]') // Replace emails
      .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[CARD_NUMBER]') // Replace card numbers
      .replace(/\$\d+\.?\d*/g, '[AMOUNT]') // Replace dollar amounts
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // Replace SSNs
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]'); // Replace phone numbers
    
    return cleaned;
  }

  private parseSender(from: string): { name: string; email: string } {
    const match = from.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return {
        name: match[1].trim().replace(/"/g, ''),
        email: match[2].trim()
      };
    }
    return {
      name: from,
      email: from
    };
  }

  private classifyMessage(message: GmailMessage): 'receipt' | 'bill' | 'newsletter' | 'personal' | 'other' {
    const subject = message.subject.toLowerCase();
    const from = message.from.toLowerCase();
    const content = message.textBody.toLowerCase();

    // Receipt patterns
    if (subject.includes('receipt') || subject.includes('order') || subject.includes('purchase') ||
        content.includes('receipt') || content.includes('order confirmation')) {
      return 'receipt';
    }

    // Bill patterns
    if (subject.includes('bill') || subject.includes('invoice') || subject.includes('payment') ||
        subject.includes('statement') || content.includes('amount due') || content.includes('balance')) {
      return 'bill';
    }

    // Newsletter patterns
    if (subject.includes('newsletter') || subject.includes('unsubscribe') ||
        from.includes('noreply') || from.includes('no-reply')) {
      return 'newsletter';
    }

    // Personal patterns (from known contacts, no business indicators)
    if (!subject.includes('receipt') && !subject.includes('bill') && 
        !subject.includes('invoice') && !from.includes('noreply')) {
      return 'personal';
    }

    return 'other';
  }

  private extractFinancialInfo(content: string): { amount?: number; merchant?: string } {
    const result: { amount?: number; merchant?: string } = {};

    // Extract amounts
    const amountMatches = content.match(/\$(\d+(?:\.\d{2})?)/g);
    if (amountMatches && amountMatches.length > 0) {
      const amounts = amountMatches.map(match => 
        parseFloat(match.replace('$', ''))
      );
      result.amount = Math.max(...amounts); // Take the largest amount
    }

    // Extract merchant names (common patterns)
    const merchantPatterns = [
      /from\s+([A-Z][a-zA-Z\s&]+)/i,
      /merchant:\s*([A-Z][a-zA-Z\s&]+)/i,
      /vendor:\s*([A-Z][a-zA-Z\s&]+)/i,
      /at\s+([A-Z][a-zA-Z\s&]+)/i
    ];

    for (const pattern of merchantPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        result.merchant = match[1].trim();
        break;
      }
    }

    return result;
  }

  // Get messages as plain text for AI processing
  async getMessagesAsText(maxResults: number = 50): Promise<string> {
    const messages = await this.getAIReadableMessages(maxResults);
    
    return messages.map(msg => {
      return `Subject: ${msg.subject}
From: ${msg.sender} (${msg.senderEmail})
Date: ${msg.date}
Type: ${msg.type}
${msg.amount ? `Amount: $${msg.amount}` : ''}
${msg.merchant ? `Merchant: ${msg.merchant}` : ''}

Content:
${msg.content}

---`;
    }).join('\n\n');
  }

  // Get financial-related messages only
  async getFinancialMessages(maxResults: number = 50): Promise<AIReadableMessage[]> {
    const allMessages = await this.getAIReadableMessages(maxResults);
    return allMessages.filter(msg => 
      msg.type === 'receipt' || msg.type === 'bill' || msg.amount !== undefined
    );
  }
}
