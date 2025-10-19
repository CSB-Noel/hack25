// Example: How to use Gmail data with an AI agent

import { useGmailAI } from '@/lib/hooks/use-gmail-ai';

export function AIAnalysisExample() {
  const { getTextForAI, getFinancialSummary, getStructuredData } = useGmailAI();

  const analyzeWithAI = async () => {
    // Method 1: Get raw text for AI processing
    const rawText = await getTextForAI(20);
    console.log('Raw text for AI:', rawText);

    // Method 2: Get structured financial data
    const financialData = await getFinancialSummary();
    console.log('Financial summary:', financialData);

    // Method 3: Get structured data for specific analysis
    const receipts = await getStructuredData('receipts');
    console.log('Receipt data:', receipts);

    // Example AI prompt with the data
    const aiPrompt = `
    Analyze the following Gmail data and provide insights:

    ${rawText}

    Please provide:
    1. Spending patterns
    2. Top merchants
    3. Unusual transactions
    4. Recommendations for savings
    `;

    // Send to your AI service (OpenAI, Anthropic, etc.)
    // const aiResponse = await callAI(aiPrompt);
  };

  return (
    <div>
      <button onClick={analyzeWithAI}>
        Analyze Gmail with AI
      </button>
    </div>
  );
}

// Example AI service integration
export async function callAI(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a financial advisor analyzing email data. Provide clear, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
