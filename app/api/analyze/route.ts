import { NextResponse } from 'next/server';
import { generateText } from '@/lib/api';

type AnalyzeRequest = {
  statement: string;
  caseType: 'divorce' | 'rental_loan' | string;
  documents: Array<{ id: string; name: string; summary?: string }>;
  lang?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as AnalyzeRequest;
  const { statement, caseType, documents } = body;
  
  try {

    // Use Gemini for AI response
    const prompt = `You are a legal assistant. The user has a ${caseType} case and said: "${statement}". 

Provide a helpful, empathetic response in 2-3 sentences that:
1. Acknowledges their situation
2. Gives practical legal advice
3. Suggests next steps

Keep it conversational and supportive.`;

    const draftedStatement = await generateText(prompt, {
      temperature: 0.7,
      maxTokens: 1000,
      model: 'gemini-2.5-flash'
    });

    // Generate document requirements based on who is filing
    const documentPrompt = `Based on this ${caseType} case statement: "${statement}"

Determine:
1. Who is the plaintiff (person filing the case) and who is the defendant (person being sued)
2. Generate a specific list of required documents for the defendant in this case

Format your response as:
PLAINTIFF: [name/role]
DEFENDANT: [name/role]

REQUIRED DOCUMENTS FOR DEFENDANT:
- [Document 1]
- [Document 2]
- [Document 3]
- etc.

Be specific to this case and include documents that would help the defendant defend their position.`;

    const documentRequirements = await generateText(documentPrompt, {
      temperature: 0.7,
      maxTokens: 1200,
      model: 'gemini-2.5-flash'
    });

    return NextResponse.json({
      draftedStatement,
      documentRequirements,
      missingDocuments: [],
      risks: [],
      recommendations: [],
      winProbability: 0.5,
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Provide fallback responses based on case type
    let fallbackStatement = 'I understand your concern. Let me help you with your legal situation.';
    let fallbackDocuments = 'Based on your case, you may need relevant documents such as contracts, communications, and evidence.';
    
    if (caseType && caseType.toLowerCase().includes('divorce')) {
      fallbackStatement = 'I understand you\'re going through a difficult time with your marriage. I\'m here to help you navigate this legal process.';
      fallbackDocuments = 'PLAINTIFF: [To be determined based on your case details]\nDEFENDANT: [To be determined based on your case details]\n\nREQUIRED DOCUMENTS FOR DEFENDANT:\n- Marriage certificate\n- Financial statements\n- Property documents\n- Communication records\n- Any relevant evidence';
    }
    
    return NextResponse.json({ 
      draftedStatement: fallbackStatement,
      documentRequirements: fallbackDocuments,
      missingDocuments: [],
      risks: [],
      recommendations: [],
      winProbability: 0.5,
    });
  }
}


