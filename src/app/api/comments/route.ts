import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');
    if (!problemId) return NextResponse.json({ message: 'Missing problemId' }, { status: 400 });

    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    const { data: comments, error } = await supabaseAdmin
      .from('problem_comments')
      .select('*')
      .eq('problem_id', problemId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Bulk fetch profiles for comments
    const userIds = [...new Set(comments.map(c => c.user_id))];
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', userIds);

    const transformed = comments.map(c => ({
      ...c,
      user: profiles?.find(p => p.id === c.user_id) || { name: 'Unknown User' }
    }));

    return NextResponse.json(transformed);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ message: 'Invalid session' }, { status: 401 });

    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    const { data, error } = await supabaseAdmin
      .from('problem_comments')
      .insert([{
        problem_id: body.problemId,
        user_id: user.id,
        content: body.content
      }])
      .select()
      .single();

    if (error) throw error;

    // Create Notification for the reporter if commenter is different
    const { data: problem } = await supabaseAdmin.from('problems').select('reported_by, title').eq('id', body.problemId).single();
    if (problem && problem.reported_by !== user.id) {
       await supabaseAdmin.from('notifications').insert([{
         user_id: problem.reported_by,
         type: 'comment',
         message: `${user.user_metadata?.name || 'Someone'} commented on your issue: "${problem.title}"`
       }]);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
