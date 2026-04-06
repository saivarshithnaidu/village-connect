import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Invalid session' }, { status: 401 });
    }

    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    // 1. Toggle upvote in the junction table
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('problem_upvotes')
      .select('*')
      .eq('user_id', user.id)
      .eq('problem_id', id);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      // Remove upvote
      await supabaseAdmin
        .from('problem_upvotes')
        .delete()
        .eq('user_id', user.id)
        .eq('problem_id', id);
    } else {
      // Add upvote
      await supabaseAdmin
        .from('problem_upvotes')
        .insert([{ user_id: user.id, problem_id: id }]);

      // Create Notification for the reporter
      const { data: problem } = await supabaseAdmin.from('problems').select('reported_by, title').eq('id', id).single();
      if (problem && problem.reported_by !== user.id) {
        await supabaseAdmin.from('notifications').insert([{
          user_id: problem.reported_by,
          type: 'upvote',
          message: `Someone upvoted your issue: "${problem.title}"`
        }]);
      }
    }

    // 2. Fetch updated state (fetching separately for maximum robustness)
    const { data: problem, error: problemError } = await supabaseAdmin
      .from('problems')
      .select('*')
      .eq('id', id)
      .single();

    if (problemError) throw problemError;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', problem.reported_by)
      .single();

    const { data: solutions } = await supabaseAdmin
      .from('solutions')
      .select('*')
      .eq('problem_id', problem.id);

    const { data: upvotes } = await supabaseAdmin
      .from('problem_upvotes')
      .select('user_id')
      .eq('problem_id', problem.id);

    // 3. Transform to match the ProblemDetailPage's expected format
    const transformedData = {
      ...problem,
      _id: problem.id,
      isVerified: problem.is_verified,
      createdAt: problem.created_at,
      reportedBy: profile || { name: 'Unknown User', village: 'Unknown' },
      solutions: solutions || [],
      upvotes: upvotes?.map((u: any) => u.user_id) || []
    };

    return NextResponse.json(transformedData);
  } catch (error: any) {
    console.error('Error in Upvote API:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
