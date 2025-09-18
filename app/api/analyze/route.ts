import { NextResponse } from 'next/server';
import { generateText } from '@/lib/api';

type AnalyzeRequest = {
  statement: string;
  caseType: 'divorce' | 'rental_loan' | string;
  documents: Array<{ id: string; name: string; summary?: string }>;
  lang?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyzeRequest;
    const { statement, caseType, documents } = body;

    // Use Gemini for AI response
    const prompt = `You are a legal assistant. The user has a ${caseType} case and said: "${statement}". 

Provide a helpful, empathetic response in 2-3 sentences that:
1. Acknowledges their situation
2. Gives practical legal advice
3. Suggests next steps

Keep it conversational and supportive. After your response, I will show them document requirements.`;

    const draftedStatement = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 500,
      model: 'gemini-2.5-flash'
    });

    return NextResponse.json({
      draftedStatement,
      missingDocuments: [],
      risks: [],
      recommendations: [],
      winProbability: 0.5,
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ 
      draftedStatement: 'I understand your concern. Let me help you with your legal situation.',
      missingDocuments: [],
      risks: [],
      recommendations: [],
      winProbability: 0.5,
    });
  }
}


