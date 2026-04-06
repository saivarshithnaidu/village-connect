import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request: Request) {
// ... (omitting for brevity as I'm replacing the whole file for safety)
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const isVerified = searchParams.get('isVerified');
    
    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    let query = supabaseAdmin
      .from('problems')
      .select('*, problem_upvotes(*)')
      .order('created_at', { ascending: false });

    if (category && category !== '') query = query.eq('category', category);
    if (status && status !== '') query = query.eq('status', status);
    if (isVerified && isVerified !== '') query = query.eq('is_verified', isVerified === 'true');

    const { data: problems, error } = await query;

    if (error) throw error;
    if (!problems) return NextResponse.json([]);

    // Bulk fetch profiles for performance and robustness
    const userIds = [...new Set(problems.map(p => p.reported_by))];
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', userIds);

    // Transform snake_case to camelCase and map profiles
    const transformedData = problems.map(p => {
      const profile = profiles?.find(u => u.id === p.reported_by);
      return {
        ...p,
        _id: p.id,
        isVerified: p.is_verified,
        createdAt: p.created_at,
        imagePreviews: p.image_urls || (p.image_url ? [p.image_url] : []),
        reportedBy: profile || { name: 'Anonymous', village: 'Unknown' },
        upvotes: p.problem_upvotes?.map((u: any) => u.user_id) || []
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
      .from('problems')
      .insert([
        {
          title: body.title || 'Untitled Issue',
          description: body.description || '',
          category: body.category || 'other',
          location: body.location || 'Near Village Center',
          priority: body.priority || 'medium',
          reported_by: user.id,
          status: 'open',
          // Hybrid support for single and multiple images
          image_url: body.imageUrls?.[0] || body.imageUrl || '',
          image_urls: body.imageUrls || [],
          district: body.district || 'General',
          location_lat: body.coordinates?.lat || 0,
          location_lng: body.coordinates?.lng || 0,
          is_urgent: body.is_urgent || body.priority === 'urgent',
          title_en: body.title || '',
          description_en: body.description || '',
          language: body.language || 'en'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('DATABASE INSERT ERROR:', error);
      throw error;
    }

    return NextResponse.json({ ...data, _id: data.id }, { status: 201 });
  } catch (error: any) {
    console.error('PROBLEM CREATION API FAILURE:', error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
