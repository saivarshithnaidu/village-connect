import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    const { data: problem, error: fetchError } = await supabaseAdmin
      .from('problems')
      .update({ 
        is_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (fetchError) throw fetchError;
    if (!problem) return NextResponse.json({ message: 'Problem not found' }, { status: 404 });

    // Trigger Notification for the reporter
    if (problem.reported_by) {
      await supabaseAdmin.from('notifications').insert([{
        user_id: problem.reported_by,
        type: 'verified',
        message: `Your issue "${problem.title}" has been officially verified!`
      }]);
    }

    return NextResponse.json({ ...problem, _id: problem.id });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
