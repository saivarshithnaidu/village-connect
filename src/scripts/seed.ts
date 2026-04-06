import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log('🌱 Seeding VillageConnect database...');

  // 1. Create a dummy Admin if not exists
  const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@village.com',
    password: 'password123',
    email_confirm: true
  });

  if (adminAuth.user) {
    await supabase.from('profiles').upsert({
      id: adminAuth.user.id,
      name: 'Panchayat Admin',
      email: 'admin@village.com',
      role: 'admin',
      village: 'Green Valley'
    });
  }

  // 2. Create some sample problems
  const categories = ['Infrastructure', 'Water', 'Health', 'Electricity'];
  const statuses = ['open', 'verified', 'assigned', 'resolved'];
  
  const sampleProblems = [];
  for (let i = 1; i <= 12; i++) {
    sampleProblems.push({
      title: `${categories[i % 4]} Issue #${i}`,
      description: `Sample description for community issue ${i}. Needs urgent attention.`,
      category: categories[i % 4].toLowerCase(),
      status: statuses[i % 4],
      reported_by: adminAuth.user?.id,
      location_lat: 17.3850 + (Math.random() * 0.1),
      location_lng: 78.4867 + (Math.random() * 0.1),
      is_verified: i % 2 === 0,
      priority: i % 3 === 0 ? 'urgent' : 'medium',
      created_at: new Date(Date.now() - (i * 86400000)).toISOString()
    });
  }

  const { error: probError } = await supabase.from('problems').insert(sampleProblems);
  if (probError) console.error('Error seeding problems:', probError);

  console.log('✅ Seeding complete!');
}

seed();
