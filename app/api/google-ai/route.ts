import { NextRequest, NextResponse } from 'next/server';
import { createGoogleAIModel } from '@/utils/getGoogleAIToken';

export async function POST(request: NextRequest) {
  try {
    const { message, history, systemPrompt } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const model = await createGoogleAIModel();
    
    // Build conversation history with correct role mapping
    const chat = model.startChat({
      history: history?.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      })) || [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Send system prompt as first message if no history
    if (!history || history.length === 0) {
      await chat.sendMessage(systemPrompt || "You are a helpful assistant.");
    }

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Google AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
