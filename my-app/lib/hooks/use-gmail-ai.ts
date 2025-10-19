"use client"

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { AIReadableMessage } from '@/lib/gmail-service';

export function useGmailAI() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForAI = async (options: {
    maxResults?: number;
    format?: 'structured' | 'text' | 'financial';
    type?: 'all' | 'financial' | 'receipts' | 'bills';
  } = {}) => {
    if (!session?.accessToken) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (options.maxResults) params.set('maxResults', options.maxResults.toString());
      if (options.format) params.set('format', options.format);
      if (options.type) params.set('type', options.type);

      const response = await fetch(`/api/gmail/ai?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Gmail data for AI');
      }
      
      if (options.format === 'text') {
        return await response.text();
      } else {
        return await response.json();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching Gmail data for AI:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getFinancialSummary = async () => {
    const data = await fetchForAI({ format: 'financial', maxResults: 100 });
    if (!data) return null;

    const messages = data.messages as AIReadableMessage[];
    
    // Calculate summary statistics
    const totalAmount = messages.reduce((sum, msg) => sum + (msg.amount || 0), 0);
    const merchants = [...new Set(messages.map(msg => msg.merchant).filter(Boolean))];
    const receipts = messages.filter(msg => msg.type === 'receipt');
    const bills = messages.filter(msg => msg.type === 'bill');

    return {
      totalAmount,
      transactionCount: messages.length,
      receiptCount: receipts.length,
      billCount: bills.length,
      merchants,
      averageAmount: totalAmount / messages.length,
      messages
    };
  };

  const getTextForAI = async (maxResults: number = 50) => {
    return await fetchForAI({ format: 'text', maxResults });
  };

  const getStructuredData = async (type: 'all' | 'financial' | 'receipts' | 'bills' = 'all') => {
    return await fetchForAI({ format: 'structured', type });
  };

  return {
    loading,
    error,
    fetchForAI,
    getFinancialSummary,
    getTextForAI,
    getStructuredData,
    isAuthenticated: status === 'authenticated'
  };
}
