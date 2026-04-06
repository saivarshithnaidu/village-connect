import { NextResponse } from 'next/server';
import { analyzeProblemDraft, analyzeProblemImage } from '@/lib/aiService';

export async function POST(request: Request) {
  try {
    const { description, image, mimeType } = await request.json();

    if (image) {
      // IMAGE ANALYSIS
      const analysis = await analyzeProblemImage(image, mimeType || "image/jpeg");
      return NextResponse.json(analysis);
    } else {
      // TEXT DRAFT ANALYSIS (and Translation)
      if (!description) {
        return NextResponse.json({ message: 'Description is required' }, { status: 400 });
      }
      const draftAnalysis = await analyzeProblemDraft(description);
      return NextResponse.json(draftAnalysis);
    }

  } catch (error: any) {
    console.error('AI Analyze Error:', error);
    return NextResponse.json({ 
      message: 'AI Analysis failed', 
      error: error.message 
    }, { status: 500 });
  }
}
