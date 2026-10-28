-- ===========================================================================
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
  ('gudang-kedua-cikarang', 'Gudang kedua di Cikarang beroperasi, kapasitas simpan naik 60%', 'Gudang 2.100 m² di Jababeka 1 mulai menerima barang. Pengiriman ke Jawa Barat dan Banten dipangkas rata-rata satu hari kerja.', 'Siaran pers', '2026-08-28'::date, '/img/gudang.jpg', true),
  ('mill-certificate-per-batch', 'Mill certificate per batch untuk seluruh lini mutu 8.8 dan 10.9', 'Setiap pengiriman baut mutu tinggi kini disertai sertifikat pabrik yang bisa ditelusuri sampai nomor leburan.', 'Sertifikasi', '2026-07-15'::date, '/img/machinery.jpg', true),
  ('distributor-resmi-tahan-karat', 'Kairos ditunjuk jadi distributor resmi fastener tahan karat A2 dan A4', 'Mencakup wilayah Jawa dan Sumatera, dengan stok penyangga yang disimpan di gudang Sunter.', 'Siaran pers', '2026-05-16'::date, '/img/automotive.jpg', true),
  ('manufacturing-indonesia-2026', 'Kairos Baut di Manufacturing Indonesia 2026, Hall B stan 214', 'Tiga hari demonstrasi pengukuran torsi dan konsultasi pemilihan grade bersama tim teknis.', 'Kegiatan', '2026-03-04'::date, '/img/konstruski.jpeg', true),
  ('hex-flange-din-6921', 'Baut hex flange DIN 6921 masuk katalog, 42 ukuran sekaligus', 'Permintaan dari lini perakitan otomotif jadi alasan utama penambahan lini ini.', 'Produk baru', '2026-01-22'::date, '/img/electrical.jpeg', true),
  ('penelusuran-batch', 'Sistem penelusuran batch mulai dipakai di seluruh gudang', 'Setiap rak diberi kode; asal barang dan tanggal masuk bisa dicari dalam hitungan detik.', 'Siaran pers', '2025-11-08'::date, '/img/hero.jpeg', true),
  ('pelatihan-fastener-mitra', 'Pelatihan pemilihan fastener untuk 40 teknisi mitra konstruksi', 'Materi disusun dari pertanyaan yang paling sering masuk ke tim penjualan sepanjang tahun.', 'Kegiatan', '2025-09-30'::date, '/img/machinery.jpg', true),
  ('audit-mutu-pemasok', 'Audit mutu pemasok tahunan selesai, tiga pabrik baru lolos', 'Pemeriksaan mencakup dokumen leburan, uji tarik, dan konsistensi lapisan.', 'Sertifikasi', '2025-06-12'::date, '/img/gudang.jpg', true),
  ('din-985-sampai-m36', 'Ring per dan mur pengunci DIN 985 kini tersedia sampai M36', 'Melengkapi permintaan dari proyek konstruksi baja berat di Sumatera.', 'Produk baru', '2025-02-19'::date, '/img/automotive.jpg', true)
) as v(slug, judul, ringkas, kategori, tanggal, storage_path, contoh)
where not exists (select 1 from public.news);

insert into public.press_contacts (nama, peran, surel, telepon, urutan)
select * from (values
  ('Rina Hapsari', 'Komunikasi Perusahaan', 'marketing@kairosbaut.com', '+62 21 6500 888', 1),
  ('Bagus Prakoso', 'Teknis & Produk', 'marketing@kairosbaut.com', '+62 21 8983 2622', 2)
) as v(nama, peran, surel, telepon, urutan)
where not exists (select 1 from public.press_contacts);

insert into public.site_settings (key, label, grp, value, note, sort_order) values
  ('n_judul', 'Judul halaman', 'Berita · Kepala halaman', 'Kabar dari gudang.', '', 1),
  ('n_lede', 'Paragraf pembuka', 'Berita · Kepala halaman', 'Apa yang sedang terjadi di Kairos Baut — gudang baru, lini produk baru, pameran, dan pengumuman resmi.', '', 2),
  ('n_arsip_eyebrow', 'Arsip — label kecil', 'Berita · Kepala halaman', 'Arsip', '', 3),
  ('n_arsip_judul', 'Arsip — judul', 'Berita · Kepala halaman', 'Semua kabar.', '', 4),
  ('n_media_eyebrow', 'Label kecil', 'Berita · Untuk media', 'Untuk redaksi', '', 1),
  ('n_media_judul', 'Judul', 'Berita · Untuk media', 'Untuk media.', '', 2),
  ('n_media_lede', 'Paragraf', 'Berita · Untuk media', 'Permintaan wawancara, data, atau foto beresolusi tinggi — hubungi langsung, jangan lewat sentral.', '', 3),
  ('n_berkas_judul', 'Kartu "Berkas foto" — judul', 'Berita · Untuk media', 'Berkas foto', '', 4),
  ('n_berkas_isi', 'Kartu "Berkas foto" — isi', 'Berita · Untuk media', 'Logo, foto gudang, dan foto produk resolusi tinggi — satu arsip, siap unduh.', '', 5),
  ('n_berkas_tautan', 'Kartu "Berkas foto" — tautan', 'Berita · Untuk media', 'mailto:marketing@kairosbaut.com?subject=Permintaan%20berkas%20foto', 'Tautan unduhan (mis. Google Drive) atau mailto:. Kosongkan untuk menyembunyikan kartu ini.', 6),
  ('n_langganan_judul', 'Kartu "Berlangganan" — judul', 'Berita · Untuk media', 'Berlangganan', '', 7),
  ('n_langganan_isi', 'Kartu "Berlangganan" — isi', 'Berita · Untuk media', 'Satu surel tiap ada pengumuman resmi. Tanpa promosi.', '', 8),
  ('n_langganan_tautan', 'Kartu "Berlangganan" — tautan', 'Berita · Untuk media', 'mailto:marketing@kairosbaut.com?subject=Berlangganan%20kabar%20Kairos%20Baut', 'Kosongkan untuk menyembunyikan kartu ini.', 9)
on conflict (key) do nothing;
