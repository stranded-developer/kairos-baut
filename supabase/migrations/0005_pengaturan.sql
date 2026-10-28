-- ===========================================================================
-- Pengaturan situs — kontak, WhatsApp, kaki halaman. 2026-10-28
--
-- POLA YANG DIIKUTI: slot bernama, sama seperti site_media dan about_blocks.
-- Barisnya tetap; admin hanya mengganti `value`. Daftar kunci dan isi
-- bawaannya bersumber dari lib/data/settings.ts — kalau menambah kunci,
-- tambahkan di dua tempat itu.
--
-- Kontak disimpan SEKALI di sini, lalu dipakai di blok Penawaran beranda,
-- kaki halaman, tombol WhatsApp, dan tombol "Tanya via WhatsApp" di /produk.
-- Sebelumnya tertulis dua kali di kode.
-- ===========================================================================

create table if not exists public.site_settings (
  key        text primary key,
  label      text not null,                      -- nama yang tampil di backoffice
  grp        text not null,                      -- pengelompokan di backoffice
  value      text not null default '',
  note       text not null default '',           -- petunjuk untuk admin
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists site_settings_grp_idx on public.site_settings (grp, sort_order);

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings for select using (true);
-- Sengaja TIDAK ada policy tulis — sama seperti tabel lain.

-- ---------------------------------------------------------------------------
-- Isi awal — persis seperti yang tertulis di kode sebelum migrasi ini.
-- Satu pengecualian: `catatan_kaki` sengaja kosong. Dulu isinya
-- "Mockup v5 — revisi catatan", sisa masa mockup.
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, label, grp, value, note, sort_order) values
  ('wa', 'Nomor WhatsApp', 'Kontak', '6287784085400',
   'Dipakai tombol WhatsApp melayang dan tombol "Tanya via WhatsApp" di halaman produk. Boleh ditulis 0877… atau +62 877… — dirapikan otomatis.', 1),
  ('email', 'Email', 'Kontak', 'marketing@kairosbaut.com',
   'Tampil di blok Penawaran beranda dan kaki halaman.', 2),
  ('telepon_kantor', 'Telepon kantor', 'Kontak', '+62 21 6500 888',
   'Ditulis seperti yang ingin tampil. Tautan teleponnya dibuat otomatis.', 3),
  ('alamat_kantor', 'Alamat kantor', 'Kontak', E'Perkantoran Mega Sunter Blok B No. 32\nJl. Danau Sunter Selatan\nJakarta 14350',
   'Satu baris per baris alamat. Di beranda, baris pertama ditebalkan dan sisanya disambung dengan koma.', 4),
  ('telepon_workshop', 'Telepon workshop', 'Kontak', '+62 21 8983 2622', '', 5),
  ('alamat_workshop', 'Alamat workshop', 'Kontak', E'Kawasan Industri Jababeka 1 Blok C 17 A\nPasirgombong, Cikarang Utara\nBekasi 17530',
   'Satu baris per baris alamat.', 6),
  ('jam_kerja', 'Jam kerja', 'Kontak', E'Senin – Jumat 08.00 – 17.00\nSabtu 08.00 – 12.00',
   'Satu baris per hari.', 7),

  ('tagline_kaki', 'Kalimat di bawah logo', 'Kaki halaman', 'PT Kairos Multi Sejahtera — distributor baut & mur untuk industri Indonesia.', '', 1),
  ('judul_kantor', 'Judul kolom kantor', 'Kaki halaman', 'Kantor', '', 2),
  ('judul_workshop', 'Judul kolom workshop', 'Kaki halaman', 'Workshop', '', 3),
  ('judul_jam', 'Judul kolom jam kerja', 'Kaki halaman', 'Jam Kerja', '', 4),
  ('hak_cipta', 'Baris hak cipta', 'Kaki halaman', '© 2026 PT Kairos Multi Sejahtera', 'Pojok kiri bawah.', 5),
  ('catatan_kaki', 'Catatan pojok kanan bawah', 'Kaki halaman', '', 'Kosongkan kalau tidak perlu.', 6)
on conflict (key) do nothing;
