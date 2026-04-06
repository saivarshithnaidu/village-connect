import { NextResponse } from 'next/server';
import { generateResolutionReport } from '@/lib/aiService';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const { problemId } = await request.json();

    if (!problemId) {
      return NextResponse.json({ message: 'Problem ID required' }, { status: 400 });
    }

    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    // 1. Fetch extensive problem context for the report
    const { data: problem } = await supabaseAdmin
      .from('problems')
      .select('*, solutions(*), comments:problem_comments(*, profiles(name))')
      .eq('id', problemId)
      .single();

    if (!problem) return NextResponse.json({ message: 'Problem not found' }, { status: 404 });

    // 2. Use AI Service to generate high-fidelity resolution report
    const report = await generateResolutionReport(problem);
    
    return NextResponse.json(report);

  } catch (error: any) {
    console.error('AI Resolution Report Error:', error);
    return NextResponse.json({ 
      message: 'AI Report generation failed', 
      error: error.message 
    }, { status: 500 });
  }
}
