const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('courses').select('*, lessons(*, concepts(*))');
  if (error) console.error(error);
  console.log(JSON.stringify(data, null, 2));
}

test();
