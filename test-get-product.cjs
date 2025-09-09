const { createClient } = require('@supabase/supabase-js');

// Подключение к локальному экземпляру Supabase используя правильные учетные данные из .env
const supabaseUrl = 'http://178.212.198.23:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getProduct(article) {
  if (!article) return { product: null, variants: [] }

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      id,
      article,
      name,
      season,
      gender,
      category_id,
      categories(name),
      image,
      variants(*)
    `)
    .eq('article', article)
    .single()

  if (error || !product) {
    console.error('Product error:', error)
    return { product: null, variants: [] }
  }

  console.log('Raw product data from Supabase:');
  console.log(JSON.stringify(product, null, 2));

  return {
    product: {
      product_id: product.id,
      article: product.article,
      name: product.name,
      season: product.season,
      gender: product.gender,
      category_id: product.category_id,
      category_name: (product.categories && product.categories.name) || '',
      // Берем поле image из продукта, а не из варианта
      image: product.image || null,
      // Добавляем все варианты для получения дополнительных изображений
      variants: product.variants || []
    },
    variants: product.variants || []
  }
}

// Проверяем продукт 101TDH01B
getProduct('101TDH01B').then(result => {
  console.log('\nProcessed product data:');
  console.log(JSON.stringify(result, null, 2));
});