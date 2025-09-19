import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      response_format: "text",
    });

    // When response_format is "text", the SDK returns a plain string
    return NextResponse.json({ text: transcription });
  } catch (err: any) {
    console.error("Transcribe route error:", err);
    return NextResponse.json(
      { error: err?.message || "Transcription failed" },
      { status: 500 }
    );
  }
}


