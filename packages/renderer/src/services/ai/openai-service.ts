import OpenAI from 'openai';
import axios from 'axios';

// Initialize OpenAI client
let openaiClient: OpenAI | null = null;

// Interface for API response handlers
export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: any) => void;
}

export interface AIModelConfig {
  type: 'openai' | 'custom';
  apiKey: string;
  model?: string;
  endpoint?: string;
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
  options: { model?: string, config?: AIModelConfig } = {}
) {
  try {
    // If a custom config is provided, use it
    if (options.config && options.config.type === 'custom') {
      return generateCustomChatCompletion(messages, callbacks, options.config);
    }
    
    // Otherwise use OpenAI
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

// Function to generate chat completions with custom API
export async function generateCustomChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>,
  callbacks: StreamCallbacks = {},
  config: AIModelConfig
) {
  try {
    if (!config.endpoint) {
      throw new Error('Custom endpoint URL is required for custom API');
    }
    
    const model = config.model || 'v_chat';
    
    // For v_chat endpoint
    if (model === 'v_chat') {
      const response = await axios.post(
        config.endpoint,
        {
          model: model,
          messages: messages,
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      // Extract content from the response based on the structure
      const content = response.data.choices[0].message.content;
      callbacks.onComplete?.(content);
      return content;
    }
    
    // For v_chatv4 endpoint
    if (model === 'v_chatv4') {
      const response = await axios.post(
        config.endpoint,
        {
          model: model,
          messages: messages,
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          }
        }
      );
      
      // Extract content from the response based on the structure
      const content = response.data.choices[0].message.content;
      callbacks.onComplete?.(content);
      return content;
    }
    
    throw new Error(`Unsupported custom model: ${model}`);
    
  } catch (error) {
    callbacks.onError?.(error);
    throw error;
  }
}

// Simple non-streaming chat completion
export async function simpleChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>,
  options: { model?: string, config?: AIModelConfig } = {}
): Promise<string> {
  try {
    // If a custom config is provided, use it
    if (options.config && options.config.type === 'custom') {
      return generateCustomChatCompletion(
        messages, 
        {
          onComplete: () => {},
          onError: (error) => console.error('Error in custom chat completion:', error)
        }, 
        options.config
      );
    }
    
    // Otherwise use OpenAI
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