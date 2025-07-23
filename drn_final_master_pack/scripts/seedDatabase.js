import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  await supabase.from('users').insert([{ name: 'Admin', email: 'admin@dronera.eu', kyc_status: 'approved' }]);
  await supabase.from('tokens').insert([
    { user_id: 'admin-id', drn_amount: 1000000, phase: 'Admin Reserve' }
  ]);
  console.log('Database seeded.');
}

seed();
