/* ============================================================================
   Seed Supabase dari data yang masih hardcoded di lib/data/*.ts.

   Jalankan:  npm run seed

   Memakai KUNCI RAHASIA — melewati RLS. Aman diulang: semua operasi upsert
   berdasarkan primary key, jadi menjalankan dua kali tidak menggandakan data.
   ========================================================================= */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/* ---- env ---- */
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  if (line.includes('=') && !line.trim().startsWith('#')) {
    const i = line.indexOf('=');
    process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim();
  }
}

/* ---- data TS → JS supaya bisa diimpor apa adanya (bukan disalin ulang) ---- */
const out = mkdtempSync(join(tmpdir(), 'kairos-seed-'));
execSync(
  `npx tsc lib/data/products.ts lib/data/posts.ts --outDir ${out} ` +
  `--module esnext --target es2022 --moduleResolution bundler --skipLibCheck`,
  { stdio: 'inherit' }
);
const { PRODUCTS } = await import(`file://${out}/products.js`);
const { POSTS } = await import(`file://${out}/posts.js`);

/* Langsung ke PostgREST lewat fetch, bukan lewat supabase-js.
   Alasannya: supabase-js 2.115 selalu menyiapkan klien realtime, yang butuh
   WebSocket bawaan (Node 22+). Skrip seed tidak perlu realtime sama sekali,
   jadi tidak ada gunanya menyeret ketergantungan itu ke sini. */
const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SECRET_KEY;

async function upsert(table, rows, onConflict) {
  const res = await fetch(`${BASE}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });
  const body = await res.json();
  if (!res.ok) return { error: body };
  return { data: body };
}

/* ---- "02 Agu 2023" → "2023-08-02" ---- */
const BULAN = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', Mei:'05', Jun:'06',
                Jul:'07', Agu:'08', Sep:'09', Okt:'10', Nov:'11', Des:'12' };
function tanggal(s) {
  const [d, b, y] = s.split(' ');
  const m = BULAN[b];
  if (!m) throw new Error(`Bulan tidak dikenal: "${b}" pada "${s}"`);
  return `${y}-${m}-${d.padStart(2, '0')}`;
}

/* ---- produk ---- */
const produkRows = PRODUCTS.map((p, i) => ({
  id: p.id,
  cat: p.cat,
  art: p.art,
  name: p.name,
  sub: p.sub,
  std: p.std,
  size: p.size,
  grade: p.grade,
  mat: p.mat,
  stock: p.stock,
  description: p.desc,      // `desc` kata kunci SQL
  spec: p.spec,
  finish: p.finish,
  apps: p.apps,
  sort_order: i + 1,
  published: true,
}));

/* ---- tulisan ---- */
const postRows = POSTS.map((p) => ({
  slug: p.slug,
  title: p.title,
  topic: p.topic,
  excerpt: p.excerpt,
  body: '',
  art: p.art,
  reading_time: p.readingTime ?? null,
  featured: !!p.featured,
  published: true,
  published_at: tanggal(p.date),
}));

/* ---- tulis ---- */
console.log(`\nMengirim ${produkRows.length} produk…`);
const r1 = await upsert('products', produkRows, 'id');
if (r1.error) { console.error('  GAGAL:', r1.error); process.exit(1); }
console.log(`  ok — ${r1.data.length} baris`);

console.log(`Mengirim ${postRows.length} tulisan…`);
const r2 = await upsert('posts', postRows, 'slug');
if (r2.error) { console.error('  GAGAL:', r2.error); process.exit(1); }
console.log(`  ok — ${r2.data.length} baris`);

console.log('\nSelesai.');
