const API_BASE_URL = 'https://api.openai.com/v1';

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = API_BASE_URL;
  }

  async generateContent(
    model: string = 'gpt-4o', // Default to GPT-4o for best reasoning
    request: OpenAIRequest
  ): Promise<OpenAIResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText} - ${
            errorData.error?.message || 'Unknown error'
          }`
        );
      }

      const data: OpenAIResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  async generateText(
    prompt: string,
    model: string = 'gpt-4o', // Default to GPT-4o for best reasoning
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const request: OpenAIRequest = {
      model: model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
      top_p: 0.9,
    };

    const response = await this.generateContent(model, request);

    // Debug logging
    console.log('OpenAI API Response:', JSON.stringify(response, null, 2));

    if (
      !response.choices ||
      response.choices.length === 0
    ) {
      console.error('No choices in response');
      throw new Error('No response generated from OpenAI API - no choices');
    }

    const choice = response.choices[0];
    
    if (!choice.message) {
      console.error('No message in choice');
      throw new Error('No response generated from OpenAI API - no message');
    }

    const text = choice.message.content;
    if (!text) {
      console.error('No content in message');
      console.error('Finish reason:', choice.finish_reason);
      
      // Handle specific finish reasons
      if (choice.finish_reason === 'length') {
        throw new Error('Response was truncated due to token limit. Please try a shorter prompt or increase maxTokens.');
      } else if (choice.finish_reason === 'content_filter') {
        throw new Error('Response blocked by content filter. Please rephrase your request.');
      }
      
      throw new Error(`No response generated from OpenAI API - no content. Finish reason: ${choice.finish_reason}`);
    }

    return text;
  }

  async chat(
    messages: OpenAIMessage[],
    model: string = 'gpt-4o', // Default to GPT-4o for best reasoning
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const request: OpenAIRequest = {
      model: model,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
      top_p: 0.9,
    };

    const response = await this.generateContent(model, request);

    if (
      !response.choices ||
      response.choices.length === 0 ||
      !response.choices[0].message ||
      !response.choices[0].message.content
    ) {
      throw new Error('No response generated from OpenAI API');
    }

    return response.choices[0].message.content;
  }
}

// Singleton instance
let openaiInstance: OpenAIClient | null = null;

export const getOpenAIClient = (): OpenAIClient => {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiInstance = new OpenAIClient(apiKey);
  }
  return openaiInstance;
};

// Utility function for simple text generation
export const generateText = async (
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
): Promise<string> => {
  const client = getOpenAIClient();
  return client.generateText(prompt, options?.model || 'gpt-4o', {
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  });
};

// Utility function for chat conversations
export const chat = async (
  messages: OpenAIMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
): Promise<string> => {
  const client = getOpenAIClient();
  return client.chat(messages, options?.model || 'gpt-4o', {
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  });
};

export async function uploadDocumentMetas(files: Array<{ name: string; size: number; type?: string }>) {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
  });
  if (!response.ok) throw new Error(`Error: ${response.statusText}`);
  return response.json();
}

export async function analyzeCase(payload: {
  statement: string;
  caseType: string;
  documents: Array<{ id: string; name: string; summary?: string }>;
  lang?: string;
}) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Error: ${response.statusText}`);
  return response.json();
}
