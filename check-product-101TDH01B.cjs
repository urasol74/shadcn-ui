const { createClient } = require('@supabase/supabase-js');

// Подключение к локальному экземпляру Supabase используя правильные учетные данные из .env
const supabaseUrl = 'http://178.212.198.23:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
  console.log('Проверка продукта 101TDH01B в локальной базе данных Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('article, image')
      .eq('article', '101TDH01B');
      
    if (error) {
      console.error('Ошибка при получении данных:', error);
    } else {
      console.log('Данные продукта из Supabase:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data && data.length > 0) {
        console.log('\nНайден продукт:');
        console.log('Артикул:', data[0].article);
        console.log('Изображение:', data[0].image);
      } else {
        console.log('Продукт 101TDH01B не найден в базе данных');
      }
    }
  } catch (err) {
    console.error('Ошибка выполнения запроса:', err);
  }
}

checkProduct();