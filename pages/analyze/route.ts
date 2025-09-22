import type { NextApiRequest, NextApiResponse } from 'next';
import { getOpenAIClient } from '@/lib/api';

// Single Pages Router endpoint to analyze a case and optionally generate a mock trial
// POST /pages/analyze/route.ts
// Body: { chatId, caseType: 'divorce'|'property', statement: string, documents: any[], mockTrial?: boolean }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { chatId, caseType, statement, documents, mockTrial } = req.body || {};
    if (!statement) return res.status(400).json({ error: 'Missing statement' });

    const client = getOpenAIClient();
    const docsText = (documents || []).map((d: any) => {
      const name = d.filename || d.name || 'document';
      const parsed = d.parsed || {};
      const summary = parsed.summary || d.summary || '';
      const clauses = (parsed.key_clauses || []).join('; ');
      const obligations = (parsed.obligations || []).join('; ');
      const evidence = (parsed.evidence || []).join('; ');
      return `Filename: ${name}\nSummary: ${summary}\nKey clauses: ${clauses}\nObligations: ${obligations}\nEvidence: ${evidence}`;
    }).join('\n\n');

    // Part 1: case analysis
    const system = 'You are an expert litigation assistant. Return strict JSON only.';
    const analyzeUser = `Case type: ${caseType}.\nStatement: ${statement}\n\nDocuments:\n${docsText}\n\nReturn JSON with keys: admissibility{status:'admissible'|'inadmissible'|'partial',reasons[]}, winProbability(0..1), missingDocuments[], suggestions[]`;

    const analyzeText = await client.chat([
      { role: 'system', content: system },
      { role: 'user', content: analyzeUser },
    ], 'gpt-4o', { temperature: 0.3, maxTokens: 900 });

    const parseJson = (t: string) => {
      try {
        const s = t.indexOf('{');
        const e = t.lastIndexOf('}');
        return JSON.parse(t.slice(s, e + 1));
      } catch {
        return { error: 'Model JSON parse error', raw: t };
      }
    };

    const analysis = parseJson(analyzeText);

    // Part 2 (optional): mock trial
    let mock: any = undefined;
    if (mockTrial) {
      const docsShort = (documents || []).map((d: any) => `- ${(d.filename || d.name || 'document')}: ${(d.parsed?.summary || d.summary || '')}`).join('\n');
      const prompt = `Simulate a courtroom trial for a ${caseType} case. Return strict JSON: mockTrial{judge[],plaintiffLawyer[],defenseLawyer[],jury[],verdict,judgeSummary}.\nStatement:\n${statement}\n\nDocuments:\n${docsShort}`;
      const mockText = await client.generateText(prompt, 'gpt-4o', { temperature: 0.7, maxTokens: 1200 });
      mock = parseJson(mockText)?.mockTrial || parseJson(mockText);
    }

    return res.status(200).json({ chatId, caseType, analysis, ...(mockTrial ? { mockTrial: mock } : {}) });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Analyze failed' });
  }
}


