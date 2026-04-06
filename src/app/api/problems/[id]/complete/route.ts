import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { completionMessage } = body;

    const { data: problem, error: fetchError } = await supabase
      .from('problems')
      .update({ 
        is_completed_by_villager: true,
        completion_message: completionMessage
      })
      .eq('id', id)
      .select()
      .single();

    if (fetchError) throw fetchError;
    if (!problem) return NextResponse.json({ message: 'Problem not found' }, { status: 404 });

    return NextResponse.json(problem);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
