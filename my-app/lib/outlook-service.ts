import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export interface OutlookMessage {
  id: string;
  subject: string;
  from: string;
  date: number;
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

export class OutlookService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Fetch Outlook messages
  async getMessages(maxResults: number = 50): Promise<OutlookMessage[]> {
    console.log("🔑 Outlook Access Token (partial):", this.accessToken?.slice(0, 40));

    const res = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages?$top=${maxResults}&$select=subject,body,from,receivedDateTime,bodyPreview`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("❌ Microsoft Graph API Error:", {
        status: res.status,
        statusText: res.statusText,
        body: errorBody,
      });
      throw new Error(`Microsoft Graph error: ${res.statusText} - ${errorBody}`);
    }

    const data = (await res.json()) as { value?: any[] };
    const messages = data.value || [];

    return messages.map((msg) => this.processMessage(msg)).filter(Boolean) as OutlookMessage[];
  }

  // Convert raw API message to our model
  private processMessage(msg: any): OutlookMessage | null {
    try {
      const from = msg.from?.emailAddress?.name || msg.from?.emailAddress?.address || "Unknown";
      const date = new Date(msg.receivedDateTime).getTime();

      const htmlBody = msg.body?.content || "";
      const textBody = this.stripHtml(htmlBody) || msg.bodyPreview || "";

      return {
        id: msg.id,
        subject: msg.subject || "(No Subject)",
        from,
        date,
        htmlBody: htmlBody.trim(),
        textBody: textBody.trim(),
      };
    } catch (error) {
      console.error("Error processing Outlook message:", error);
      return null;
    }
  }

  // Create AI-readable messages (like GmailService)
  async getAIReadableMessages(maxResults: number = 50): Promise<AIReadableMessage[]> {
    const messages = await this.getMessages(maxResults);
    return messages.map((msg) => this.convertToAIReadable(msg));
  }

  private convertToAIReadable(message: OutlookMessage): AIReadableMessage {
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
      summary: message.textBody.slice(0, 200),
      type: messageType,
      amount: extractedInfo.amount,
      merchant: extractedInfo.merchant,
    };
  }

  // Convert HTML → clean text for AI
  private stripHtml(html: string): string {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text;
  }

  private cleanTextForAI(text: string): string {
    if (!text) return '';
    let cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    cleaned = cleaned
      .replace(/https?:\/\/[^\s]+/g, '[URL]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
      .replace(/\$\d+\.?\d*/g, '[AMOUNT]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]');
    return cleaned;
  }

  private parseSender(from: string): { name: string; email: string } {
    const match = from.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: from, email: from };
  }

  private classifyMessage(message: OutlookMessage): 'receipt' | 'bill' | 'newsletter' | 'personal' | 'other' {
    const subject = message.subject.toLowerCase();
    const from = message.from.toLowerCase();
    const content = message.textBody.toLowerCase();

    if (subject.includes('receipt') || subject.includes('order') || content.includes('order confirmation'))
      return 'receipt';
    if (subject.includes('bill') || subject.includes('invoice') || content.includes('amount due'))
      return 'bill';
    if (subject.includes('newsletter') || from.includes('noreply') || from.includes('no-reply'))
      return 'newsletter';
    if (!subject.includes('receipt') && !subject.includes('bill') && !from.includes('noreply'))
      return 'personal';
    return 'other';
  }

  private extractFinancialInfo(content: string): { amount?: number; merchant?: string } {
    const result: { amount?: number; merchant?: string } = {};
    const amountMatches = content.match(/\$(\d+(?:\.\d{2})?)/g);
    if (amountMatches) {
      const amounts = amountMatches.map((match) => parseFloat(match.replace('$', '')));
      result.amount = Math.max(...amounts);
    }

    const merchantPatterns = [
      /from\s+([A-Z][a-zA-Z\s&]+)/i,
      /merchant:\s*([A-Z][a-zA-Z\s&]+)/i,
      /vendor:\s*([A-Z][a-zA-Z\s&]+)/i,
      /at\s+([A-Z][a-zA-Z\s&]+)/i,
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

  // Returns messages as AI-readable text
  async getMessagesAsText(maxResults: number = 50): Promise<string> {
    const messages = await this.getAIReadableMessages(maxResults);
    return messages
      .map(
        (msg) => `Subject: ${msg.subject}
From: ${msg.sender} (${msg.senderEmail})
Date: ${msg.date}
Type: ${msg.type}
${msg.amount ? `Amount: $${msg.amount}` : ''}
${msg.merchant ? `Merchant: ${msg.merchant}` : ''}

Content:
${msg.content}

---`
      )
      .join('\n\n');
  }

  async getFinancialMessages(maxResults: number = 50): Promise<AIReadableMessage[]> {
    const allMessages = await this.getAIReadableMessages(maxResults);
    return allMessages.filter(
      (msg) => msg.type === 'receipt' || msg.type === 'bill' || msg.amount !== undefined
    );
  }
}