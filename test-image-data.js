import { createClient } from '@supabase/supabase-js';

// Эти значения должны соответствовать вашей локальной конфигурации Supabase из .env
const supabaseUrl = 'http://178.212.198.23:8000';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testImageData() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('article, image')
      .limit(5);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Sample products with image field:');
      data.forEach(item => {
        console.log('Article:', item.article, '| Image:', item.image);
      });
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testImageData();