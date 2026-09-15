-- ===========================================================================
-- Proyek — halaman /industri, 2026-09-15
--
-- Sumbernya halaman "OUR PROJECTS" pada public/KAIROS 2.pdf (hal. 11–14).
-- Fotonya sudah diekstrak ke /public/img/proyek dan dipakai sebagai cadangan
-- selama admin belum mengunggah gantinya.
--
-- BEDA DENGAN about_blocks: di sini barisnya BOLEH ditambah dan dihapus.
-- Daftar proyek memang tumbuh; mengunci barisnya seperti site_media justru
-- menghalangi. Karena itu ada kolom `published` dan `urutan`.
--
-- `sektor` TIDAK ada di PDF — dibuat supaya halaman Industri punya saringan.
-- Lihat catatan di lib/data/projects.ts.
-- ===========================================================================

create table if not exists public.projects (
  slug       text primary key,
  nama       text not null,
  sektor     text not null,
  ringkas    text not null default '',
  alt        text not null default '',
  -- null = pakai cadangan di /public/img/proyek/<slug>.jpg
  storage_path text,
  urutan     integer not null default 0,
  published  boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists projects_urutan_idx on public.projects (urutan);

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

alter table public.projects enable row level security;
drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select using (published);
-- Sengaja TIDAK ada policy tulis — sama seperti tabel lain.

insert into public.projects (slug, nama, sektor, ringkas, alt, urutan, published) values
  ('amman-mineral', 'Amman Mineral Smelting', 'Pertambangan & Smelter', '', 'Kawasan smelter Amman Mineral dilihat dari udara', 1, true),
  ('lotte-chemical', 'Lotte Chemical', 'Energi & Petrokimia', '', 'Tangki bulat raksasa dalam pembangunan di kompleks Lotte Chemical', 2, true),
  ('aeon-mall-cikarang', 'Aeon Mall Cikarang', 'Komersial & Properti', '', 'Bangunan Aeon Mall Cikarang dari sisi jalan utama', 3, true),
  ('jis', 'Jakarta International Stadium (JIS)', 'Olahraga & Publik', '', 'Lapangan dan tribun Jakarta International Stadium', 4, true),
  ('sumbawa-lng', 'Sumbawa LNG Terminal & Regas Facility', 'Energi & Petrokimia', '', 'Fasilitas terminal LNG di tepi pantai Sumbawa', 5, true),
  ('summarecon-bekasi', 'Summarecon Mall Bekasi Tahap 2', 'Komersial & Properti', '', 'Fasad Summarecon Mall Bekasi pada malam hari', 6, true),
  ('tangguh-expansion', 'Tangguh Expansion', 'Energi & Petrokimia', '', 'Kilang Tangguh dilihat dari udara pada malam hari', 7, true),
  ('freeport-manyar', 'Freeport Manyar', 'Pertambangan & Smelter', '', 'Pembangunan smelter Freeport di Manyar, Gresik', 8, true),
  ('ikea-jakarta-garden-city', 'IKEA Jakarta Garden City', 'Komersial & Properti', '', 'Gedung IKEA Jakarta Garden City', 9, true),
  ('kcic', 'Kereta Cepat Jakarta–Bandung (KCIC)', 'Infrastruktur', '', 'Pembangunan jalur layang kereta cepat di sisi jalan tol', 10, true),
  ('velodrome-rawamangun', 'Velodrome Rawamangun', 'Olahraga & Publik', '', 'Lintasan kayu dan atap rangka baja Velodrome Rawamangun', 11, true),
  ('kemang-village', 'Kemang Village', 'Komersial & Properti', '', 'Menara apartemen Kemang Village dilihat dari udara', 12, true),
  ('nice-pik-2', 'Nusantara International Convention Exhibition (NICE) PIK 2', 'Komersial & Properti', '', 'Gambar rancangan kawasan konvensi NICE di PIK 2', 13, true)
on conflict (slug) do nothing;
