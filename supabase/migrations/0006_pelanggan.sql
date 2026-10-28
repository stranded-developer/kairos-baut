-- ===========================================================================
-- Pelanggan — pita "Kami telah bekerja sama dengan" di beranda. 2026-10-28
--
-- Sebelumnya: empat slot tetap di site_media (logo-adhi-karya dkk.). Slot
-- tetap tidak bisa ditambah, padahal itu yang diminta. Jadi pindah ke tabel
-- sendiri yang barisnya BOLEH ditambah, diurutkan, dan dihapus — pola sama
-- dengan `projects` (0003).
--
-- Logo boleh kosong: tanpa logo, nama perusahaan tampil sebagai teks — sama
-- persis dengan tampilan marquee sejak awal.
--
-- Baris site_media logo-* TIDAK dihapus di sini; hanya disembunyikan dari
-- /admin/foto. Kalau sudah ada logo yang diunggah ke sana, path-nya ikut
-- disalin ke tabel baru di bawah.
-- ===========================================================================

create table if not exists public.clients (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null,
  storage_path text,                               -- null = nama sebagai teks
  urutan       integer not null default 0,
  published    boolean not null default true,
  updated_at   timestamptz not null default now()
);

create index if not exists clients_urutan_idx on public.clients (urutan);

drop trigger if exists clients_touch on public.clients;
create trigger clients_touch before update on public.clients
  for each row execute function public.touch_updated_at();

alter table public.clients enable row level security;
drop policy if exists clients_public_read on public.clients;
create policy clients_public_read on public.clients for select using (published);
-- Sengaja TIDAK ada policy tulis — sama seperti tabel lain.

-- Isi awal: empat nama yang sudah tampil, urutan sama. Hanya diisi kalau
-- tabelnya masih kosong, jadi menjalankan ulang tidak menggandakan baris.
insert into public.clients (nama, storage_path, urutan)
select v.nama, m.storage_path, v.urutan
from (values
  ('logo-adhi-karya',         'Adhi Karya',         1),
  ('logo-karya-logam-agung',  'Karya Logam Agung',  2),
  ('logo-ihi-power-electric', 'IHI Power Electric', 3),
  ('logo-wijaya-karya',       'Wijaya Karya',       4)
) as v(key, nama, urutan)
left join public.site_media m on m.key = v.key
where not exists (select 1 from public.clients);
