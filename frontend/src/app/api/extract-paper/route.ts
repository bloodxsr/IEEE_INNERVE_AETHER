import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import pdfParse from "pdf-parse";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: "/api/extract-paper",
    accepts: ["POST"],
    message: "Telemetry probe OK. Use POST with multipart form-data file.",
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large. Limit is 8MB." }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const mimeType = file.type || "application/octet-stream";

    if (mimeType === "application/pdf") {
      const parsed = await pdfParse(Buffer.from(arrayBuffer));
      return NextResponse.json({ text: parsed.text || "" });
    }

    if (mimeType.startsWith("text/")) {
      const text = Buffer.from(arrayBuffer).toString("utf-8");
      return NextResponse.json({ text });
    }

    if (mimeType.startsWith("image/")) {
      const apiKey = process.env.GEMINI_API_KEY;
      const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

      if (!apiKey) {
        return NextResponse.json({ error: "Gemini API key missing." }, { status: 500 });
      }

      const ai = new GoogleGenAI({ apiKey });
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const prompt = "Extract the full research paper text from this image. Preserve line breaks where possible.";

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64 } }
            ]
          }
        ]
      });

      return NextResponse.json({ text: response.text || "" });
    }

    return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Extraction failed." }, { status: 500 });
  }
}
