import { NextRequest, NextResponse } from 'next/server';
import { formatSystemPrompt } from '@/agent/context';
import { AI_TOOL_DEFINITIONS } from '@/tools/definitions';

export async function POST(req: NextRequest) {
  try {
    const { query, context } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query prompt required' }, { status: 400 });
    }

    const systemPrompt = formatSystemPrompt(context);
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\nUSER REQUEST: "${query}"` }] }
              ],
              tools: [{ functionDeclarations: AI_TOOL_DEFINITIONS }],
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidate = data.candidates?.[0];
          const callPart = candidate?.content?.parts?.find((p: any) => p.functionCall);

          if (callPart?.functionCall) {
            return NextResponse.json({
              message: `AI called tool ${callPart.functionCall.name}`,
              actions: [
                {
                  name: callPart.functionCall.name,
                  args: callPart.functionCall.args || {},
                },
              ],
            });
          }
        }
      } catch (e) {
        console.warn('Gemini API call warning:', e);
      }
    }

    // Default response triggers local structured tool executor in frontend runner
    return NextResponse.json({
      message: 'Processing query with tool executor engine',
      actions: [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
