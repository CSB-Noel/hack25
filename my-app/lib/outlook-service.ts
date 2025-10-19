import fetch from 'node-fetch';

export class OutlookService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getMessages(maxResults = 20): Promise<any[]> {
    console.log("Access Token:", this.accessToken?.slice(0, 40));


    const res = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages?$top=${maxResults}&$select=subject,body,from,receivedDateTime`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Microsoft Graph API Error:", {
        status: res.status,
        statusText: res.statusText,
        body: errorBody
      });
      throw new Error(`Microsoft Graph error: ${res.statusText} - ${errorBody}`);
    }

    const data = (await res.json()) as { value?: any[] };
    return data.value || [];
  }

  async getMessagesAsText(maxResults = 20): Promise<string> {
    const messages = await this.getMessages(maxResults);

    // Turn into simple text blocks for AI
    return messages
      .map(
        (msg) =>
          `From: ${msg.from?.emailAddress?.name || "Unknown"} <${msg.from?.emailAddress?.address}>
Subject: ${msg.subject}
Date: ${msg.receivedDateTime}

${stripHtml(msg.body?.content || "")}`
      )
      .join("\n\n---\n\n");
  }
}

// helper to remove HTML tags from email bodies
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}