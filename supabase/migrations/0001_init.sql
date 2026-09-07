-- ============================================================================
-- Kairos Baut — skema awal
-- Dijalankan sekali lewat SQL Editor. Aman diulang (idempoten).
--
-- Sumber data: lib/data/products.ts dan lib/data/posts.ts. Bentuk kolom di
-- bawah mengikuti interface di kedua berkas itu supaya seed-nya tinggal salin.
--
-- ---------------------------------------------------------------------------
-- MODEL IZIN — penting, baca sebelum mengubah
--
-- Backoffice /admin memakai satu kata sandi bersama, BUKAN akun Supabase Auth.
-- Artinya `auth.uid()` selalu null untuk aplikasi ini, jadi policy berbasis
-- pengguna tidak akan pernah berlaku.
--
-- Yang dipakai:
--   · RLS menyala di semua tabel.
--   · HANYA ada policy SELECT. Tidak ada satu pun policy INSERT/UPDATE/DELETE,
--     jadi kunci publik sama sekali tidak punya jalur tulis — bukan sekadar
--     "dibatasi", tapi memang tidak ada policy yang mengizinkannya.
--   · Semua penulisan lewat Server Action di server memakai kunci rahasia,
--     yang melewati RLS. Gerbangnya adalah cookie sesi backoffice.
--
-- Jadi: browser hanya bisa membaca. Menulis hanya mungkin dari server, dan
-- hanya setelah lolos gerbang kata sandi.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Produk
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id          text primary key,                    -- slug, mis. 'hex-bolt'
  cat         text not null check (cat in ('baut', 'mur', 'batang', 'angkur')),
  art         text not null,                       -- kunci grafik vektor cadangan
  name        text not null,
  sub         text not null default '',
  std         text not null default '',
  size        text not null default '',
  grade       text not null default '',
  mat         text not null default '',
  stock       text not null default 'ready' check (stock in ('ready', 'low', 'indent')),
  description text not null default '',            -- `desc` kata kunci SQL
  spec        jsonb not null default '{}'::jsonb,  -- label → nilai, urutan dipertahankan
  finish      text[] not null default '{}',
  apps        text[] not null default '{}',
  sort_order  integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_cat_idx       on public.products (cat);
create index if not exists products_sort_idx      on public.products (sort_order);
create index if not exists products_published_idx on public.products (published);

-- ---------------------------------------------------------------------------
-- Foto produk — menggantikan grafik vektor begitu foto asli ada (Bagian 6)
-- ---------------------------------------------------------------------------
create table if not exists public.product_photos (
  id           uuid primary key default gen_random_uuid(),
  product_id   text not null references public.products (id) on delete cascade,
  kind         text not null default 'produk' check (kind in ('produk', 'teknis', 'kemasan')),
  storage_path text not null,                      -- path di bucket product-photos
  alt          text not null default '',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists product_photos_product_idx on public.product_photos (product_id, sort_order);

-- ---------------------------------------------------------------------------
-- Foto stok situs — slot bernama, bukan galeri bebas
--
-- Barisnya tetap; admin hanya mengganti storage_path dan alt. Dengan begitu
-- tata letak halaman tidak pernah kehilangan slot, dan cadangan vektor tetap
-- jalan selama fotonya belum diisi.
-- ---------------------------------------------------------------------------
create table if not exists public.site_media (
  key          text primary key,                   -- mis. 'hero', 'logo-adhi-karya'
  label        text not null,                      -- nama yang tampil di backoffice
  grp          text not null,                      -- pengelompokan di backoffice
  storage_path text,                               -- null = pakai cadangan
  alt          text not null default '',
  note         text not null default '',           -- petunjuk ukuran untuk admin
  sort_order   integer not null default 0,
  updated_at   timestamptz not null default now()
);

create index if not exists site_media_grp_idx on public.site_media (grp, sort_order);

-- ---------------------------------------------------------------------------
-- Blog / catatan teknis
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  slug         text primary key,
  title        text not null,
  topic        text not null check (topic in ('Standar', 'Material', 'Komponen', 'Pemasangan')),
  excerpt      text not null default '',
  body         text not null default '',           -- isi lengkap, dipakai Bagian 7
  art          text not null default '',           -- isi <svg viewBox="0 0 24 24">
  reading_time text,
  featured     boolean not null default false,
  published    boolean not null default true,
  published_at date not null default current_date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists posts_published_idx on public.posts (published, published_at desc);
create index if not exists posts_topic_idx     on public.posts (topic);

-- Hanya boleh ada satu tulisan unggulan.
create unique index if not exists posts_single_featured_idx
  on public.posts ((featured)) where featured;

-- ---------------------------------------------------------------------------
-- updated_at otomatis
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch   on public.products;
drop trigger if exists site_media_touch on public.site_media;
drop trigger if exists posts_touch      on public.posts;

create trigger products_touch   before update on public.products   for each row execute function public.touch_updated_at();
create trigger site_media_touch before update on public.site_media for each row execute function public.touch_updated_at();
create trigger posts_touch      before update on public.posts      for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — hanya baca, tidak ada policy tulis sama sekali
-- ---------------------------------------------------------------------------
alter table public.products       enable row level security;
alter table public.product_photos enable row level security;
alter table public.site_media     enable row level security;
alter table public.posts          enable row level security;

drop policy if exists products_public_read       on public.products;
drop policy if exists product_photos_public_read on public.product_photos;
drop policy if exists site_media_public_read     on public.site_media;
drop policy if exists posts_public_read          on public.posts;

create policy products_public_read       on public.products       for select using (published);
create policy product_photos_public_read on public.product_photos for select using (true);
create policy site_media_public_read     on public.site_media     for select using (true);
create policy posts_public_read          on public.posts          for select using (published);

-- Sengaja TIDAK ada policy insert/update/delete. Penulisan hanya lewat kunci
-- rahasia di server, yang melewati RLS.

-- ---------------------------------------------------------------------------
-- Slot foto situs — barisnya dibuat di sini supaya backoffice punya daftar
-- tetap untuk disunting. Foto belum diisi (storage_path null) → halaman
-- otomatis memakai gambar cadangan.
-- ---------------------------------------------------------------------------
insert into public.site_media (key, label, grp, alt, note, sort_order) values
  ('hero',              'Hero beranda',            'Beranda',  'Stok baut, mur, dan ring di gudang Kairos Baut, Cikarang', 'Dipakai selebar layar sebagai latar hero. Minimal 2000 px.', 1),
  ('gudang',            'Foto gudang (Tentang)',   'Beranda',  'Rak penyimpanan stok baut di gudang Kairos Baut',          'Rasio 2:1. Minimal 2000 px.',                               2),
  ('industri-bg',       'Latar pita Industri',     'Beranda',  '',                                                         'Digelapkan ~94%, terbaca sebagai tekstur. Ideal ~2400 px.',  3),
  ('industri-machinery','Industri 01 — Mesin',     'Industri', 'Fastener presisi untuk mesin produksi',                    'Rasio 4:3.',                                                4),
  ('industri-automotive','Industri 02 — Otomotif', 'Industri', 'Baut chassis dan engine mounting otomotif',                'Rasio 4:3.',                                                5),
  ('industri-konstruksi','Industri 03 — Konstruksi','Industri','Baut struktur dan angkur untuk konstruksi',                'Rasio 4:3.',                                                6),
  ('industri-electrical','Industri 04 — Kelistrikan','Industri','Fastener tahan korosi untuk instalasi kelistrikan',       'Rasio 4:3.',                                                7),
  ('logo-adhi-karya',        'Logo — Adhi Karya',         'Logo klien', 'Adhi Karya',         'PNG transparan atau SVG. Tinggi minimal 120 px. Pastikan ada izin klien.', 8),
  ('logo-karya-logam-agung', 'Logo — Karya Logam Agung',  'Logo klien', 'Karya Logam Agung',  'PNG transparan atau SVG. Tinggi minimal 120 px. Pastikan ada izin klien.', 9),
  ('logo-ihi-power-electric','Logo — IHI Power Electric', 'Logo klien', 'IHI Power Electric', 'PNG transparan atau SVG. Tinggi minimal 120 px. Pastikan ada izin klien.', 10),
  ('logo-wijaya-karya',      'Logo — Wijaya Karya',       'Logo klien', 'Wijaya Karya',       'PNG transparan atau SVG. Tinggi minimal 120 px. Pastikan ada izin klien.', 11)
on conflict (key) do nothing;
