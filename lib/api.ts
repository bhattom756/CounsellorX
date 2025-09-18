const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

export class GeminiAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = API_BASE_URL;
  }

  async generateContent(
    model: string = 'gemini-2.5-flash', // Default to Gemini 2.5 Flash
    request: GeminiRequest
  ): Promise<GeminiResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText} - ${
            errorData.error?.message || 'Unknown error'
          }`
        );
      }

      const data: GeminiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  async generateText(
    prompt: string,
    model: string = 'gemini-2.5-flash', // Default to Gemini 2.5 Flash
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const request: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
        topP: 0.8,
        topK: 40,
      },
    };

    const response = await this.generateContent(model, request);

    if (
      !response.candidates ||
      response.candidates.length === 0 ||
      !response.candidates[0].content ||
      !response.candidates[0].content.parts ||
      response.candidates[0].content.parts.length === 0 ||
      !response.candidates[0].content.parts[0].text
    ) {
      throw new Error('No response generated from Gemini API');
    }

    return response.candidates[0].content.parts[0].text;
  }

  async chat(
    messages: GeminiMessage[],
    model: string = 'gemini-2.5-flash', // Default to Gemini 2.5 Flash
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const request: GeminiRequest = {
      contents: messages,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
        topP: 0.8,
        topK: 40,
      },
    };

    const response = await this.generateContent(model, request);

    if (
      !response.candidates ||
      response.candidates.length === 0 ||
      !response.candidates[0].content ||
      !response.candidates[0].content.parts ||
      response.candidates[0].content.parts.length === 0 ||
      !response.candidates[0].content.parts[0].text
    ) {
      throw new Error('No response generated from Gemini API');
    }

    return response.candidates[0].content.parts[0].text;
  }
}

// Singleton instance
let geminiInstance: GeminiAPI | null = null;

export const getGeminiClient = (): GeminiAPI => {
  if (!geminiInstance) {
    const apiKey = process.env.GOOGLE_API_KEY; // Changed to use GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set');
    }
    geminiInstance = new GeminiAPI(apiKey);
  }
  return geminiInstance;
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
  const client = getGeminiClient();
  return client.generateText(prompt, options?.model || 'gemini-2.5-flash', {
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  });
};

// Utility function for chat conversations
export const chat = async (
  messages: GeminiMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
): Promise<string> => {
  const client = getGeminiClient();
  return client.chat(messages, options?.model || 'gemini-2.5-flash', {
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
