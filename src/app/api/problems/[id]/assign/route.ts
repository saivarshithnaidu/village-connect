import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    // For simplicity in this demo, we're not verifying session on every move if token is present, 
    // but a real app would extract user_id from token.
    // Here we'll get user_id from a header if we want or just mock it as the first available volunteer for now.
    // BUT we should do it right: get user from header after session validation.
    
    // In a real environment we would check: 
    // const authHeader = request.headers.get('Authorization');
    // For now, let's assume we need to find out who called this.
    // We'll insert a fake volunteer id if not provided, or better, fail if no user context.
    
    // Since we don't have a robust server-side getuser in this snippet, let's try to get it from request body or metadata.
    // Actually, in the frontend we just call with token.
    
    // Let's assume there's a volunteer currently logged in.
    // For this prototype, if user_id is not in body, we'll try to find any volunteer.
    // THIS IS JUST FOR THE DEMO FIX.
    
    // BETTER: Expect userId in body since we have no server-side session yet.
    // BUT the frontend doesn't send it.
    
    // Let's check `user` metadata in Supabase.
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(request.headers.get('Authorization')?.split(' ')[1] || '');
    
    if (userError || !user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: problem, error: fetchError } = await supabaseAdmin
      .from('problems')
      .update({ 
        is_verified: true,
        verified_at: new Date().toISOString(),
        assigned_to: user.id,
        status: 'in-progress',
        assigned_at: new Date().toISOString(),
        in_progress_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (fetchError) throw fetchError;
    if (!problem) return NextResponse.json({ message: 'Problem not found' }, { status: 404 });

    // Notification for the reporter
    if (problem.reported_by) {
      await supabaseAdmin.from('notifications').insert([{
        user_id: problem.reported_by,
        type: 'claimed',
        message: `Volunteer ${user.user_metadata?.full_name || 'Someone'} has claimed your issue "${problem.title}"!`
      }]);
    }

    return NextResponse.json({ ...problem });
  } catch (error: any) {
    console.error('Assign error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
