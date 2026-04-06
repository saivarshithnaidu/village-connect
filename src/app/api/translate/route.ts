import { NextResponse } from 'next/server';
import translate from 'google-translate-api-next';

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text) {
      return NextResponse.json({ message: 'No text provided' }, { status: 400 });
    }

    // Google Translate codes: English is 'en', Telugu is 'te'
    const res = await translate(text, { to: targetLanguage || 'en' });

    return NextResponse.json({ 
      translatedText: res.text,
      from: res.from.language.iso
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Translation Error:', error.message);
    return NextResponse.json({ message: 'Translation failed' }, { status: 500 });
  }
}
