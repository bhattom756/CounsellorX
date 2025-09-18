import { NextResponse } from 'next/server';
import genai from '@/lib/gemini';


export async function POST(req: Request) {
const body = await req.json();
const { statement, caseType, docIds, lang } = body;


// 1) If lang == 'auto', call genai.languageDetect
// 2) If not English, request translation
// 3) Build prompt: include parsed docs text, user statement
// 4) Ask model to: a) summarize, b) list missing docs, c) ask clarifying Qs, d) estimate winProbability


// For prototype we return dummy response
const resp = {
missingDocuments: ['Marriage Certificate', 'Bank statements'],
winProbability: 0.45,
recommendations: [
'Obtain certified copy of sale deed',
'Affidavit from two witnesses about possession'
],
};


return NextResponse.json(resp);
}