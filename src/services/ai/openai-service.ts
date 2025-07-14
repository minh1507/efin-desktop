import OpenAI from 'openai';

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

// Interface for API response handlers
export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: any) => void;
}

// Initialize the OpenAI client with the API key
export function initOpenAI(apiKey: string) {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: In production, use server-side API calls
  });
  return openaiClient;
}

// Get or initialize OpenAI client
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Call initOpenAI first.');
  }
  return openaiClient;
}

// Function to generate chat completions with streaming
export async function generateChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>,
  callbacks: StreamCallbacks = {},
  options: { model?: string } = {}
) {
  try {
    const client = getOpenAIClient();
    const model = options.model || 'gpt-3.5-turbo';
    
    const stream = await client.chat.completions.create({
      model,
      messages,
      stream: true,
    });
    
    let fullText = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        callbacks.onToken?.(content);
      }
    }
    
    callbacks.onComplete?.(fullText);
    return fullText;
  } catch (error) {
    callbacks.onError?.(error);
    throw error;
  }
}

// Simple non-streaming chat completion
export async function simpleChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>,
  options: { model?: string } = {}
): Promise<string> {
  try {
    const client = getOpenAIClient();
    const model = options.model || 'gpt-3.5-turbo';
    
    const response = await client.chat.completions.create({
      model,
      messages,
    });
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error in chat completion:', error);
    throw error;
  }
} 