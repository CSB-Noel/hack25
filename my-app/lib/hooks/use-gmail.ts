"use client"

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { GmailMessage } from '@/lib/gmail-service';

export function useGmailMessages(maxResults: number = 50) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    if (!session?.accessToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/gmail/messages?maxResults=${maxResults}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Gmail messages');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching Gmail messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      fetchMessages();
    }
  }, [status, session?.accessToken, maxResults]);

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages
  };
}

export function useGmailMessage(messageId: string) {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState<GmailMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessage = async () => {
    if (!session?.accessToken || !messageId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/gmail/messages?messageId=${messageId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Gmail message');
      }
      
      const data = await response.json();
      setMessage(data.message || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching Gmail message:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken && messageId) {
      fetchMessage();
    }
  }, [status, session?.accessToken, messageId]);

  return {
    message,
    loading,
    error,
    refetch: fetchMessage
  };
}
