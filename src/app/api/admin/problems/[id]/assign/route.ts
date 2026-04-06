import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { workerId } = body;

    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    const { data: problem, error: fetchError } = await supabaseAdmin
      .from('problems')
      .update({ 
        assigned_to: workerId,
        status: 'in-progress'
      })
      .eq('id', id)
      .select()
      .single();

    if (fetchError) throw fetchError;
    if (!problem) return NextResponse.json({ message: 'Problem not found' }, { status: 404 });

    return NextResponse.json({ ...problem, _id: problem.id });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
