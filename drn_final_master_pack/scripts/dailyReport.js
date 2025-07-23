import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function generateDailyReport() {
  const { data: tokens } = await supabase.from('tokens').select('drn_amount');
  const { data: payments } = await supabase.from('payments').select('*').eq('status', 'completed');

  const totalTokens = tokens.reduce((sum, t) => sum + t.drn_amount, 0);
  console.log(`Daily report: ${totalTokens} DRN sold, ${payments.length} payments.`);
}

generateDailyReport();
