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

    // 1. Fetch All Problems for aggregation
    const { data: problemsRaw, error: problemsError } = await supabaseAdmin
      .from('problems')
      .select('category, status, created_at, upvotes');

    if (problemsError) throw problemsError;
    const problems = problemsRaw || [];

    // 2. Category Distribution
    const categoryMap = problems.reduce((acc: any, p: any) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // 3. Status Distribution (Open vs Resolved)
    const statusMap = problems.reduce((acc: any, p: any) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // 4. Monthly Trends (Last 6 Months)
    const monthlyMap = problems.reduce((acc: any, p: any) => {
       const month = new Date(p.created_at).toLocaleString('default', { month: 'short' });
       acc[month] = (acc[month] || 0) + 1;
       return acc;
    }, {});
    const trendData = Object.entries(monthlyMap).map(([name, reports]) => ({ name, reports }));

    // 5. Leaderboard (Top 5 Contributors based on points)
    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, name, village');
    
    const { data: allProbs, error: probErr } = await supabaseAdmin
      .from('problems')
      .select('reported_by, upvotes');

    if (profileErr || probErr) throw profileErr || probErr;

    const leaderboard = (profiles || []).map((p: any) => {
       const userProbs = (allProbs || []).filter(prob => prob.reported_by === p.id);
       const reportPoints = userProbs.length * 5;
       const upvotePoints = userProbs.reduce((acc: number, prob: any) => {
         const count = Array.isArray(prob.upvotes) ? prob.upvotes.length : (Number(prob.upvotes) || 0);
         return acc + count;
       }, 0);
       
       return {
         name: p.name || 'Anonymous',
         village: p.village || 'Global',
         points: reportPoints + upvotePoints,
         reports: userProbs.length
       };
    }).sort((a, b) => b.points - a.points).slice(0, 5);

    return NextResponse.json({
      categoryData,
      statusData,
      trendData,
      leaderboard,
      totalStats: {
        totalIssues: problems.length,
        resolved: problems.filter(p => p.status === 'resolved').length,
        open: problems.filter(p => p.status === 'open').length,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
