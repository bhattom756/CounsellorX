import { NextResponse } from 'next/server';

type IncomingFileMeta = {
  name: string;
  size: number;
  type?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { files?: IncomingFileMeta[] };
    const files = body?.files ?? [];

    const documents = files.map((file, index) => ({
      id: `doc_${index + 1}`,
      name: file.name,
      summary:
        'Mock summary: extracted parties, key clauses, obligations, and a brief overview. (No files stored).',
    }));

    // Minimal retention: do not store; compute and return only
    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}


