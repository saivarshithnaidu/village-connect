import { NextResponse } from 'next/server';
import { getChatboxResponse } from '@/lib/aiService';

export async function POST(request: Request) {
  try {
    const { message, history, context } = await request.json();

    if (!message) {
      return NextResponse.json({ answer: 'Message is required' }, { status: 400 });
    }

    const aiResponse = await getChatboxResponse(message, history, context);
    return NextResponse.json(aiResponse);

  } catch (error: any) {
    console.error('Chat Error:', error);
    
    if (error.message?.includes('429')) {
      return NextResponse.json({ 
        answer: "Too many requests. Please wait a few seconds. Google's AI servers are a bit busy! 🚦",
        category: "System",
        suggested_action: "Retry in 30s"
      }, { status: 429 });
    }

    return NextResponse.json({ 
      answer: "I'm having trouble connecting to the village office. Please try again! 📡",
      category: "Maintenance",
      suggested_action: "Refresh the page"
    }, { status: 500 });
  }
}
