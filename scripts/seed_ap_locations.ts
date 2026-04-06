import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

// Load environment variables from .env.local
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Full Dataset for all 26 Andhra Pradesh Districts
const AP_DATA = {
  districts: [
    { name: 'Anakapalli', name_te: 'అనకాపల్లి' },
    { name: 'Anantapuramu', name_te: 'అనంతపురము' },
    { name: 'Alluri Sitharama Raju', name_te: 'అల్లూరి సీతారామ రాజు' },
    { name: 'Bapatla', name_te: 'బాపట్ల' },
    { name: 'Chittoor', name_te: 'చిత్తూరు' },
    { name: 'East Godavari', name_te: 'తూర్పు గోదావరి' },
    { name: 'Eluru', name_te: 'ఏలూరు' },
    { name: 'Guntur', name_te: 'గుంటూరు' },
    { name: 'Kakinada', name_te: 'కాకినాడ' },
    { name: 'Konaseema', name_te: 'కోనసీమ' },
    { name: 'Krishna', name_te: 'కృష్ణా' },
    { name: 'Kurnool', name_te: 'కర్నూలు' },
    { name: 'Manyam', name_te: 'మన్యం' },
    { name: 'NTR', name_te: 'NTR' },
    { name: 'Nandyal', name_te: 'నంద్యాల' },
    { name: 'Palnadu', name_te: 'పల్నాడు' },
    { name: 'Prakasam', name_te: 'ప్రకాశం' },
    { name: 'SPSR Nellore', name_te: 'SPSR నెల్లూరు' },
    { name: 'Sri Sathya Sai', name_te: 'శ్రీ సత్య సాయి' },
    { name: 'Srikakulam', name_te: 'శ్రీకాకుళం' },
    { name: 'Tirupati', name_te: 'తిరుపతి' },
    { name: 'Visakhapatnam', name_te: 'విశాఖపట్నం' },
    { name: 'Vizianagaram', name_te: 'విజయనగరం' },
    { name: 'West Godavari', name_te: 'పశ్చిమ గోదావరి' },
    { name: 'YSR', name_te: 'YSR' },
  ]
};

async function seed() {
  console.log('--- SEEDING AP DISTRICTS ---');
  
  for (const d of AP_DATA.districts) {
    const { error: dError } = await supabase
      .from('districts')
      .upsert({ name: d.name, name_te: d.name_te }, { onConflict: 'name' });

    if (dError) {
      console.error(`Error in ${d.name}:`, dError.message);
    } else {
      console.log(`✓ District: ${d.name}`);
    }
  }

  console.log('--- SEEDING COMPLETE ---');
}

seed();
