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
    
    // Stream için chat başlat
    const chat = model.startChat({
      history: history?.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      })) || [],
      generationConfig: {
        maxOutputTokens: 300, // Stream için daha kısa
        temperature: 0.9, // Daha doğal konuşma
        topP: 0.95,
        topK: 50
      },
    });

    // System prompt gönder
    if (!history || history.length === 0) {
      await chat.sendMessage(systemPrompt || "You are an English teacher. Keep responses very short and conversational.");
    }

    // Stream yanıtı başlat
    const result = await chat.sendMessageStream(message);
    
    // Stream response oluştur
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(`data: ${JSON.stringify({ text, done: false })}\n\n`);
            }
          }
          controller.enqueue(`data: ${JSON.stringify({ done: true })}\n\n`);
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Google AI Stream API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
