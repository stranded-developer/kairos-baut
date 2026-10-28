/* ============================================================================
   Membuat supabase/migrations/0008_beranda.sql dari lib/data/home.ts.

   Isi awal naskah beranda TIDAK diketik ulang ke SQL — dibuat dari berkas
   yang sama dengan yang dipakai sebagai cadangan, supaya keduanya tidak
   mungkin berbeda.

   Jalankan:  npx tsx scripts/sql-beranda.ts
   ========================================================================= */
import { writeFileSync } from 'node:fs';
import { BERANDA, FONT } from '../lib/data/home';

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

const baris: string[] = [];
for (const k of BERANDA) {
  k.isian.forEach((i, n) => {
    baris.push(`  (${q(i.key)}, ${q(i.label)}, ${q(`Beranda · ${k.grp}`)}, ${q(i.value)}, ${q(i.note ?? '')}, ${n + 1})`);
  });
}
baris.push(
  `  ('font', 'Pasangan font', 'Tampilan', ${q(FONT[0].id)}, 'Berlaku untuk seluruh situs.', 1)`
);

const sql = `-- ===========================================================================
-- Naskah beranda + pasangan font. 2026-10-28
-- Butuh 0005 (site_settings) sudah dijalankan.
--
-- BERKAS INI DIBUAT OTOMATIS oleh scripts/sql-beranda.ts dari
-- lib/data/home.ts — jangan disunting tangan; ubah sumbernya lalu jalankan
-- ulang skripnya. Isinya = teks beranda persis seperti sebelum migrasi ini.
--
-- Disimpan di site_settings (kunci berawalan b_), bukan tabel baru: polanya
-- sama-sama slot bernama, dan aksi simpan /admin/pengaturan dipakai ulang.
-- ===========================================================================

insert into public.site_settings (key, label, grp, value, note, sort_order) values
${baris.join(',\n')}
on conflict (key) do nothing;
`;

writeFileSync(new URL('../supabase/migrations/0008_beranda.sql', import.meta.url), sql);
console.log(`0008_beranda.sql: ${baris.length} baris`);
