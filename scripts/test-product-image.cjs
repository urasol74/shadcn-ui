const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fquvncbvvkfukbwsjhns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdXZuY2J2dmtmdWtid3NqaG5zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk5OTU4MCwiZXhwIjoyMDcyNTc1NTgwfQ.aKXUr9UBujNl6KPg3KmycnXh2tpgXNIRcoTID70tTPE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductImage() {
  try {
    console.log('Testing product image field...');
    
    // Get a product with image field
    const { data, error } = await supabase
      .from('products')
      .select('article, name, image')
      .not('image', 'is', null)
      .limit(5);

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    console.log('Products with image field:');
    data.forEach(product => {
      console.log(`- Article: ${product.article}`);
      console.log(`  Name: ${product.name}`);
      console.log(`  Image: ${product.image}`);
      console.log(`  Image type: ${typeof product.image}`);
      console.log('');
    });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testProductImage();