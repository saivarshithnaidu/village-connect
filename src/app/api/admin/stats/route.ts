import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ message: 'Invalid session' }, { status: 401 });
    if (!supabaseAdmin) throw new Error('Admin client not initialized');

    console.log('Fetching Admin Stats for:', user.id);

    // 1. Get fundamental counts
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    
    const { count: totalProblems } = await supabaseAdmin
      .from('problems')
      .select('id', { count: 'exact', head: true });

    const { count: solvedProblems } = await supabaseAdmin
      .from('problems')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'resolved');

    const { count: unsolvedProblems } = await supabaseAdmin
      .from('problems')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'resolved');

    const { count: totalSolutions } = await supabaseAdmin
      .from('solutions')
      .select('id', { count: 'exact', head: true });

    // 2. Fetch Recent Problems (Avoiding joins for reliability)
    const { data: recentProblemsRaw, error: problemError } = await supabaseAdmin
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (problemError) throw problemError;

    // Bulk fetch profiles for recent problems
    const userIds = [...new Set(recentProblemsRaw?.map(p => p.reported_by) || [])];
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', userIds);

    const recentProblems = (recentProblemsRaw || []).map(p => ({
      ...p,
      _id: p.id,
      createdAt: p.created_at,
      reportedBy: profiles?.find(u => u.id === p.reported_by) || { name: 'Unknown User', village: 'N/A' }
    }));

    // 3. Status Distribution
    const { data: allStatus } = await supabaseAdmin.from('problems').select('status');
    const problemsByStatus = (allStatus || []).reduce((acc: any[], curr: any) => {
      const existing = acc.find(a => a._id === curr.status);
      if (existing) existing.count++;
      else acc.push({ _id: curr.status, count: 1 });
      return acc;
    }, []);

    // 4. Category Distribution  
    const { data: allCats } = await supabaseAdmin.from('problems').select('category');
    const problemsByCategory = (allCats || []).reduce((acc: any[], curr: any) => {
      const existing = acc.find(a => a._id === curr.category);
      if (existing) existing.count++;
      else acc.push({ _id: curr.category, count: 1 });
      return acc;
    }, []);

    const result = {
      totalUsers: totalUsers || 0,
      totalProblems: totalProblems || 0,
      solvedProblems: solvedProblems || 0,
      unsolvedProblems: unsolvedProblems || 0,
      totalSolutions: totalSolutions || 0,
      totalForumPosts: 0,
      problemsByStatus,
      problemsByCategory,
      recentProblems,
      recentSolutions: []
    };

    console.log('Successfully compiled Admin Stats');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('CRITICAL: Admin Stats API Failure:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
