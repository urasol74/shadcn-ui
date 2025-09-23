const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fquvncbvvkfukbwsjhns.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdXZuY2J2dmtmdWtid3NqaG5zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk5OTU4MCwiZXhwIjoyMDcyNTc1NTgwfQ.aKXUr9UBujNl6KPg3KmycnXh2tpgXNIRcoTID70tTPE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  try {
    console.log('Testing Supabase Storage access...');
    
    // List files in the bucket
    const { data, error } = await supabase
      .storage
      .from('image')
      .list('img-site', {
        limit: 10,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('Error listing files:', error);
      return;
    }

    console.log('Files in img-site directory:');
    data.forEach(file => {
      console.log(`- ${file.name}`);
    });

    // Try to get public URL for a specific file
    if (data.length > 0) {
      const fileName = data[0].name;
      const { data: publicUrl } = supabase
        .storage
        .from('image')
        .getPublicUrl(`img-site/${fileName}`);

      console.log('\nPublic URL for', fileName, ':');
      console.log(publicUrl.publicUrl);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testStorage();