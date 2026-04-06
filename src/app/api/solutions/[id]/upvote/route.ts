import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Toggle upvote in junction table
    const { data: existing, error: checkError } = await supabase
      .from('solution_upvotes')
      .select('*')
      .eq('user_id', user.id)
      .eq('solution_id', id);

    if (checkError) throw checkError;

    if (existing && existing.length > 0) {
      await supabase
        .from('solution_upvotes')
        .delete()
        .eq('user_id', user.id)
        .eq('solution_id', id);
    } else {
      await supabase
        .from('solution_upvotes')
        .insert([{ user_id: user.id, solution_id: id }]);
    }

    // Fetch updated solution
    const { data: solution, error: fetchError } = await supabase
      .from('solutions')
      .select('*, solution_upvotes(*)')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({
      ...solution,
      upvotes: solution.solution_upvotes.map((u: any) => u.user_id)
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
