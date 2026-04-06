import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');
    const status = searchParams.get('status');
    if (!supabaseAdmin) throw new Error('Admin client not initialized');
    
    let query = supabaseAdmin
      .from('solutions')
      .select('*')
      .order('created_at', { ascending: false });

    if (problemId) query = query.eq('problem_id', problemId);
    if (status) query = query.eq('status', status);

    const { data: solutions, error } = await query;

    if (error) throw error;
    if (!solutions) return NextResponse.json([]);

    // Bulk fetch profiles for robustness
    const userIds = [...new Set(solutions.map(s => s.proposed_by))];
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', userIds);

    // Transform for frontend
    const transformedData = solutions.map(s => {
      const profile = profiles?.find(u => u.id === s.proposed_by);
      return {
        ...s,
        _id: s.id,
        proposedBy: profile || { name: 'Unknown User', village: 'Unknown' }
      };
    });

    return NextResponse.json(transformedData);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Invalid session' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ message: 'Admin client not initialized' }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .from('solutions')
      .insert([
        {
          problem_id: body.problemId,
          title: body.title,
          description: body.description,
          proposed_by: user.id,
          status: 'pending',
          estimated_cost: body.estimatedCost,
          estimated_time: body.estimatedTime
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
