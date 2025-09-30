import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// 🔑 Используй service_role key (из Supabase Settings → API)
const supabaseUrl = 'https://fquvncbvvkfukbwsjhns.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdXZuY2J2dmtmdWtid3NqaG5zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk5OTU4MCwiZXhwIjoyMDcyNTc1NTgwfQ.aKXUr9UBujNl6KPg3KmycnXh2tpgXNIRcoTID70tTPE'  
const supabase = createClient(supabaseUrl, supabaseKey)

const bucket = 'image'
const folderInBucket = 'img-site/'   // папка внутри bucket
const localFolder = '/home/ubuntu/shadcn-ui/static/pic/'

async function uploadFiles() {
  const files = fs.readdirSync(localFolder)

  for (const file of files) {
    const filePath = path.join(localFolder, file)
    const content = fs.readFileSync(filePath)

    const remotePath = `${folderInBucket}${file}` // img-site/filename.jpg

    console.log(`⏫ Загружаю: ${remotePath}...`)

    const { error } = await supabase.storage
      .from(bucket)
      .upload(remotePath, content, {
        upsert: true,
        contentType: file.endsWith('.png')
          ? 'image/png'
          : file.endsWith('.jpg') || file.endsWith('.jpeg')
          ? 'image/jpeg'
          : 'application/octet-stream',
      })

    if (error) {
      console.error(`❌ Ошибка при загрузке ${file}:`, error.message)
    } else {
      console.log(`✅ Успешно загружено: ${file}`)
    }
  }
}

uploadFiles()
