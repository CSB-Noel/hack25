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
}
