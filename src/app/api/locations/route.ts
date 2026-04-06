import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const mandalId = searchParams.get('mandalId');

    if (!supabaseAdmin) throw new Error('Database connection failed');

    // 1. Fetch Villages if Mandal ID provided
    if (mandalId) {
      const { data, error } = await supabaseAdmin
        .from('villages')
        .select('id, name, name_te')
        .eq('mandal_id', mandalId)
        .order('name');
      
      if (error) throw error;
      return NextResponse.json(data);
    }

    // 2. Fetch Mandals if District ID provided
    if (districtId) {
      const { data, error } = await supabaseAdmin
        .from('mandals')
        .select('id, name, name_te')
        .eq('district_id', districtId)
        .order('name');
      
      if (error) throw error;
      return NextResponse.json(data);
    }

    // 3. Default: Fetch all Districts
    const { data, error } = await supabaseAdmin
      .from('districts')
      .select('id, name, name_te')
      .order('name');
    
    if (error) throw error;
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Location API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch locations', error: error.message }, { status: 500 });
  }
}
