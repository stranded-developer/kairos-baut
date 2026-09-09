-- ===========================================================================
-- Halaman "Tentang Kami" — 2026-09-09
--
-- Naskahnya dari user (surat Direktur Utama), rancangannya mengikuti
-- matraturbine.com/about-us (tangkapan layar di mockups/img/screenshot/).
--
-- POLA YANG DIIKUTI: sama seperti site_media — **slot bernama, bukan blok
-- bebas**. Barisnya tetap; admin menyunting isinya, tidak menambah atau
-- menghapus. Alasannya sama dengan yang ditulis di 0001 untuk site_media:
-- tata letak halaman tidak pernah kehilangan bagian, dan backoffice punya
-- daftar tetap yang gampang dipahami orang non-teknis.
--
-- FOTONYA TIDAK DI SINI. Foto halaman ini memakai site_media (grp 'Tentang
-- Kami'), supaya seluruh jalur unggah yang sudah jadi — pemeriksaan rasio,
-- pemotongan, WebP, teks alternatif — dipakai ulang apa adanya. Kolom
-- `media_key` di bawah yang menyambungkan blok ke slot fotonya.
-- ===========================================================================

create table if not exists public.about_blocks (
  key        text primary key,                   -- mis. 'sejarah', 'moto'
  label      text not null,                      -- nama yang tampil di backoffice
  kind       text not null check (kind in ('teks', 'kutipan', 'tanda-tangan')),
  heading    text not null default '',
  body       text not null default '',           -- paragraf dipisah baris kosong
  media_key  text references public.site_media (key) on delete set null,
  flip       boolean not null default false,     -- true = foto di kanan
  caption    text not null default '',
  note       text not null default '',           -- petunjuk untuk admin
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists about_blocks_sort_idx on public.about_blocks (sort_order);

drop trigger if exists about_blocks_touch on public.about_blocks;
create trigger about_blocks_touch before update on public.about_blocks
  for each row execute function public.touch_updated_at();

alter table public.about_blocks enable row level security;
drop policy if exists about_blocks_public_read on public.about_blocks;
create policy about_blocks_public_read on public.about_blocks for select using (true);
-- Sengaja TIDAK ada policy tulis — sama seperti tabel lain.

-- ---------------------------------------------------------------------------
-- Slot foto untuk halaman Tentang Kami.
--
-- Rasionya diatur lib/image-specs.ts, bukan kolom `note` ini — `note` cuma
-- keterangan tambahan. Cadangan (kalau storage_path masih null) memakai foto
-- stok yang sudah ada di /public/img.
-- ---------------------------------------------------------------------------
insert into public.site_media (key, label, grp, alt, note, sort_order) values
  ('tentang-banner', 'Tentang — spanduk atas',   'Tentang Kami', 'Gudang dan stok baut PT Kairos Multi Sejahtera', 'Tampil selebar layar di balik judul, digelapkan supaya tulisannya terbaca.', 20),
  ('tentang-sejarah','Tentang — foto sejarah',   'Tentang Kami', 'Rak penyimpanan stok baut di gudang Kairos Baut',  'Mendampingi paragraf sejarah perusahaan.',                                  21),
  ('tentang-mutu',   'Tentang — foto mutu',      'Tentang Kami', 'Pemeriksaan mutu fastener di lini produksi',       'Mendampingi paragraf kepercayaan dan mutu.',                                22),
  ('tentang-industri','Tentang — foto industri', 'Tentang Kami', 'Fastener Kairos dipakai di proyek industri',       'Mendampingi paragraf ucapan terima kasih.',                                 23)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Isi awal — naskah persis seperti yang dikirim user, tidak diringkas.
--
-- Satu-satunya penyuntingan: paragraf kedua dipotong pada kalimat motonya,
-- supaya moto bisa tampil sebagai kutipan besar (lihat rancangan rujukan).
-- Tidak ada kata yang hilang: 'mutu' meneruskan kalimat setelah moto.
-- ---------------------------------------------------------------------------
insert into public.about_blocks (key, label, kind, heading, body, media_key, flip, caption, note, sort_order) values
  (
    'sejarah', 'Sejarah perusahaan', 'teks',
    'Berdiri sejak 2007.',
    'PT. Kairos Multi Sejahtera telah berdiri sejak tahun 2007 dan bergerak di bidang distribusi serta penjualan berbagai jenis pengencang besi (steel fasteners). Produk-produk kami mencakup material dari besi mentah hingga paduan logam seperti Stainless Steel dan Carbon Steel.

Seluruh produk telah tersertifikasi dan melalui berbagai uji kualitas yang ketat, serta digunakan di berbagai sektor industri di seluruh Indonesia, baik untuk proyek swasta, proyek pemerintah, maupun bidang manufaktur.',
    'tentang-sejarah', false, '',
    'Paragraf pembuka. Foto tampil di kiri.', 1
  ),
  (
    'kepercayaan', 'Kepercayaan pelanggan', 'teks',
    'Kepercayaan adalah pondasinya.',
    'Bagi kami, kepercayaan pelanggan merupakan pondasi utama dalam menjalankan bisnis. Oleh karena itu, kami di Kairos tidak hanya berkomitmen untuk menyediakan produk berkualitas tinggi, tetapi juga pelayanan pelanggan yang profesional dan responsif.',
    'tentang-mutu', true, '',
    'Foto tampil di kanan (kolom dibalik).', 2
  ),
  (
    'moto', 'Moto perusahaan', 'kutipan',
    'To do more than what is expected',
    'Artinya, kami senantiasa berusaha memberikan lebih dari yang diharapkan oleh pelanggan dan mitra kami.',
    null, false, '',
    'Judulnya dipakai sebagai kutipan besar. Tanpa foto.', 3
  ),
  (
    'mutu', 'Pembelajaran berkelanjutan', 'teks',
    'Belajar terus, supaya mutunya naik terus.',
    'Kami percaya bahwa pembelajaran dan perbaikan berkelanjutan adalah kunci untuk menjaga dan meningkatkan mutu produk serta layanan kami kedepannya.',
    null, false, '',
    'Paragraf lanjutan setelah moto. Tanpa foto.', 4
  ),
  (
    'terima-kasih', 'Ucapan terima kasih', 'teks',
    'Terima kasih.',
    'Kami juga ingin mengucapkan terima kasih yang sebesar-besarnya kepada seluruh pelanggan, mitra kerja, dan organisasi yang telah mendukung kami dalam berbagai aspek operasional bisnis.

Tak lupa, kami panjatkan rasa syukur yang mendalam kepada Tuhan Yang Maha Esa atas segala berkat dan tuntunan-Nya.',
    'tentang-industri', false, '',
    'Paragraf penutup. Foto tampil di kiri.', 5
  ),
  (
    'tanda-tangan', 'Tanda tangan direktur', 'tanda-tangan',
    'Oke Marokeh Rachmat',
    'Hormat kami,',
    null, false, 'Direktur Utama',
    'Judul = nama, isi = salam pembuka, keterangan = jabatan.', 6
  )
on conflict (key) do nothing;
