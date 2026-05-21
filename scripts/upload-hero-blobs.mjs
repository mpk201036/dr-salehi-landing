import { put } from '@vercel/blob'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN
if (!TOKEN) { console.error('BLOB_READ_WRITE_TOKEN not set'); process.exit(1) }

const files = [
  'public/hero-sequence/hero-poster.jpg',
  'public/hero-sequence/1.mp4',
  'public/hero-sequence/2.mp4',
  'public/hero-sequence/3.mp4',
  'public/hero-sequence/4.mp4',
  'public/hero-sequence/5.mp4',
  'public/hero-sequence/6.mp4',
  'public/hero-sequence/7.mp4',
  'public/hero-sequence/8.mp4',
  'public/hero-sequence/9.mp4',
]

const urls = {}

for (const file of files) {
  const name = file.split('/').pop()
  const pathname = `hero-sequence/${name}`
  process.stdout.write(`Uploading ${name} ... `)
  const data = readFileSync(resolve(file))
  const contentType = name.endsWith('.jpg') ? 'image/jpeg' : 'video/mp4'
  const blob = await put(pathname, data, {
    access: 'public',
    token: TOKEN,
    contentType,
    addRandomSuffix: false,
  })
  urls[name] = blob.url
  console.log(`done → ${blob.url}`)
}

console.log('\n=== BLOB URLS ===')
console.log(JSON.stringify(urls, null, 2))
