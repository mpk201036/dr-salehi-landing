import { put, list } from '@vercel/blob'
import { readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN
if (!TOKEN) { console.error('BLOB_READ_WRITE_TOKEN not set'); process.exit(1) }

const FRAMES_DIR = resolve('public/hero-frames')
const files = readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpg')).sort()

console.log(`Uploading ${files.length} frames...`)

// Check which frames already exist
const { blobs } = await list({ prefix: 'hero-frames/', token: TOKEN, limit: 2000 })
const existing = new Set(blobs.map(b => b.pathname))
console.log(`Already uploaded: ${existing.size}`)

const CONCURRENCY = 12
let done = 0

const uploadBatch = async (batch) => {
  await Promise.all(batch.map(async (file) => {
    const pathname = `hero-frames/${file}`
    if (existing.has(pathname)) { done++; return }
    const data = readFileSync(resolve(FRAMES_DIR, file))
    await put(pathname, data, { access: 'public', token: TOKEN, contentType: 'image/jpeg', addRandomSuffix: false })
    done++
    if (done % 50 === 0 || done === files.length) {
      process.stdout.write(`\r${done}/${files.length} frames uploaded`)
    }
  }))
}

for (let i = 0; i < files.length; i += CONCURRENCY) {
  await uploadBatch(files.slice(i, i + CONCURRENCY))
}

console.log('\nDone.')
console.log(`Base URL: https://aishlohl6lhgqkkq.public.blob.vercel-storage.com/hero-frames/f0000.jpg`)
