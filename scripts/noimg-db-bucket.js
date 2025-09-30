import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';

// Supabase config
const supabaseUrl = 'https://fquvncbvvkfukbwsjhns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdXZuY2J2dmtmdWtid3NqaG5zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk5OTU4MCwiZXhwIjoyMDcyNTc1NTgwfQ.aKXUr9UBujNl6KPg3KmycnXh2tpgXNIRcoTID70tTPE';
const supabase = createClient(supabaseUrl, supabaseKey, { fetch });

async function checkImages() {
  const { data: products, error } = await supabase
    .from('products')
    .select('article, image');

  if (error) {
    console.error('Ошибка запроса к БД:', error);
    return;
  }

  const noImgList = [];

  for (const product of products) {
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/image/img-site/${product.image}`;
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        console.log(`❌ Нет файла: ${product.article} -> ${fileUrl}`);
        noImgList.push(product.article);
      } else {
        console.log(`✅ Есть файл: ${product.article}`);
      }
    } catch (err) {
      console.error(`Ошибка при проверке ${fileUrl}:`, err);
    }
  }

  if (noImgList.length > 0) {
    fs.writeFileSync('noimg.txt', noImgList.join('\n'));
    console.log(`\nСписок отсутствующих файлов сохранён в noimg.txt`);
  } else {
    console.log('\nВсе картинки на месте 🎉');
  }
}

checkImages();
