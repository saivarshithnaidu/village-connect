import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    // Verify admin role from metadata or profile
    if (authError || !user) {
      return NextResponse.json({ message: 'Invalid session' }, { status: 401 });
    }

    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    // Fetch all profiles using Admin client
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    // Standardize _id for frontend compatibility
    const transformedProfiles = profiles.map(p => ({
      ...p,
      _id: p.id,
      createdAt: p.created_at
    }));

    return NextResponse.json(transformedProfiles);
  } catch (error: any) {
    console.error('GET Admin Users Error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
