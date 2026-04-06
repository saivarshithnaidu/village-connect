import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ message: 'Invalid problem ID format' }, { status: 400 });
    }

    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    // 1. Fetch core problem record
    const { data: problem, error: problemError } = await supabaseAdmin
      .from('problems')
      .select('*')
      .eq('id', id)
      .single();

    if (problemError) throw problemError;
    if (!problem) return NextResponse.json({ message: 'Problem not found' }, { status: 404 });

    // 2. Fetch reporter profile separately (more robust than joins)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', problem.reported_by)
      .single();

    // 3. Fetch solutions separately
    const { data: solutions } = await supabaseAdmin
      .from('solutions')
      .select('*')
      .eq('problem_id', problem.id);

    // 4. Fetch upvotes separately
    const { data: upvotes } = await supabaseAdmin
      .from('problem_upvotes')
      .select('user_id')
      .eq('problem_id', problem.id);

    // Transform for frontend (mapping snake_case to camelCase)
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
    console.error('Error in Problem Detail API:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!supabaseAdmin) throw new Error('Admin client not initialized');
    const body = await request.json();
    
    const updateData = { ...body };
    if (body.status === 'resolved' || body.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { data, error } = await supabaseAdmin
      .from('problems')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ...data, _id: data.id });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!supabaseAdmin) throw new Error('Admin client not initialized');
    
    const { error } = await supabaseAdmin
      .from('problems')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'Problem deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
