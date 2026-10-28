/* ============================================================================
   Membuat supabase/migrations/0009_berita.sql dari lib/data/news.ts.
   Jalankan:  npx tsx scripts/sql-berita.ts
   ========================================================================= */
import { writeFileSync } from 'node:fs';
import { BERITA_SUMBER, BERITA_TEKS, KONTAK_MEDIA } from '../lib/data/news';

const q = (s: string | undefined) => (s ? `'${s.replace(/'/g, "''")}'` : `''`);

const berita = BERITA_SUMBER.map(
  (b) => `  (${q(b.slug)}, ${q(b.judul)}, ${q(b.ringkas)}, ${q(b.kategori)}, '${b.iso}'::date, ${b.foto ? q(b.foto) : 'null'}, true)`
);

const kontak = KONTAK_MEDIA.map(
  (k, i) => `  (${q(k.nama)}, ${q(k.peran)}, ${q(k.surel)}, ${q(k.telepon)}, ${i + 1})`
);

const teks: string[] = [];
for (const k of BERITA_TEKS) {
  k.isian.forEach((i, n) => {
    teks.push(`  (${q(i.key)}, ${q(i.label)}, ${q(`Berita · ${k.grp}`)}, ${q(i.value)}, ${q(i.note)}, ${n + 1})`);
  });
}

const sql = `-- ===========================================================================
-- Berita — halaman /berita, artikel /berita/<slug>, kontak media. 2026-10-28
-- Butuh 0005 (site_settings) sudah dijalankan.
--
-- BERKAS INI DIBUAT OTOMATIS oleh scripts/sql-berita.ts dari
-- lib/data/news.ts — jangan disunting tangan.
--
-- ⚠️ Kesembilan berita awal adalah KARANGAN dari tahap mockup. Ditandai
-- contoh = true; /admin/berita menampilkan label "Contoh" sampai beritanya
-- disimpan ulang (atau dihapus).
--
-- storage_path berawalan "/" = berkas di /public (foto stok), bukan bucket.
-- Hanya dipakai berita contoh; unggahan admin selalu masuk bucket.
-- ===========================================================================

create table if not exists public.news (
  slug         text primary key,
  judul        text not null,
  ringkas      text not null default '',
  body         text not null default '',
  kategori     text not null,
  tanggal      date not null default current_date,
  lokasi       text not null default '',          -- baris tanggal artikel, mis. "Jakarta"
  storage_path text,
  alt          text not null default '',
  unggulan     boolean not null default false,    -- true = kartu besar di /berita
  published    boolean not null default true,
  contoh       boolean not null default false,    -- isi karangan dari mockup
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists news_tanggal_idx on public.news (published, tanggal desc);
-- Hanya boleh satu unggulan — sama seperti posts.
create unique index if not exists news_single_unggulan_idx on public.news ((unggulan)) where unggulan;

drop trigger if exists news_touch on public.news;
create trigger news_touch before update on public.news
  for each row execute function public.touch_updated_at();

alter table public.news enable row level security;
drop policy if exists news_public_read on public.news;
create policy news_public_read on public.news for select using (published);

create table if not exists public.press_contacts (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,
  peran      text not null default '',
  surel      text not null default '',
  telepon    text not null default '',
  urutan     integer not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists press_contacts_touch on public.press_contacts;
create trigger press_contacts_touch before update on public.press_contacts
  for each row execute function public.touch_updated_at();

alter table public.press_contacts enable row level security;
drop policy if exists press_contacts_public_read on public.press_contacts;
create policy press_contacts_public_read on public.press_contacts for select using (true);
-- Sengaja TIDAK ada policy tulis di kedua tabel — sama seperti tabel lain.

-- Isi awal — hanya kalau tabelnya masih kosong, jadi aman diulang.
insert into public.news (slug, judul, ringkas, kategori, tanggal, storage_path, contoh)
select * from (values
${berita.join(',\n')}
) as v(slug, judul, ringkas, kategori, tanggal, storage_path, contoh)
where not exists (select 1 from public.news);

insert into public.press_contacts (nama, peran, surel, telepon, urutan)
select * from (values
${kontak.join(',\n')}
) as v(nama, peran, surel, telepon, urutan)
where not exists (select 1 from public.press_contacts);

insert into public.site_settings (key, label, grp, value, note, sort_order) values
${teks.join(',\n')}
on conflict (key) do nothing;
`;

writeFileSync(new URL('../supabase/migrations/0009_berita.sql', import.meta.url), sql);
console.log(`0009_berita.sql: ${berita.length} berita, ${kontak.length} kontak, ${teks.length} teks`);
