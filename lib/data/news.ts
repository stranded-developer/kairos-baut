/* ============================================================================
   Isi contoh untuk halaman Berita.

   SEMUA TEKS DI SINI KARANGAN. Belum ada tabel `news` di Supabase — Berita
   belum bisa disunting dari /admin, tidak seperti halaman Tentang Kami.
   Mengikuti pola lib/data/posts.ts.

   Kalau nanti dipindah ke Supabase, bentuk datanya sudah cocok: satu tabel
   `news` dengan kolom tanggal, judul, ringkasan, kategori, dan slug.
   ========================================================================= */

export type Berita = {
  slug: string;
  tanggal: string;      // sudah diformat untuk dibaca manusia
  iso: string;          // untuk atribut <time datetime>
  judul: string;
  ringkas: string;
  kategori: string;
  foto?: string;
};

export const BERITA: Berita[] = [
  {
    slug: 'gudang-kedua-cikarang',
    tanggal: '28 Agustus 2026', iso: '2026-08-28',
    judul: 'Gudang kedua di Cikarang beroperasi, kapasitas simpan naik 60%',
    ringkas: 'Gudang 2.100 m² di Jababeka 1 mulai menerima barang. Pengiriman ke Jawa Barat dan Banten dipangkas rata-rata satu hari kerja.',
    kategori: 'Siaran pers', foto: '/img/gudang.jpg',
  },
  {
    slug: 'mill-certificate-per-batch',
    tanggal: '15 Juli 2026', iso: '2026-07-15',
    judul: 'Mill certificate per batch untuk seluruh lini mutu 8.8 dan 10.9',
    ringkas: 'Setiap pengiriman baut mutu tinggi kini disertai sertifikat pabrik yang bisa ditelusuri sampai nomor leburan.',
    kategori: 'Sertifikasi', foto: '/img/machinery.jpg',
  },
  {
    slug: 'distributor-resmi-tahan-karat',
    tanggal: '16 Mei 2026', iso: '2026-05-16',
    judul: 'Kairos ditunjuk jadi distributor resmi fastener tahan karat A2 dan A4',
    ringkas: 'Mencakup wilayah Jawa dan Sumatera, dengan stok penyangga yang disimpan di gudang Sunter.',
    kategori: 'Siaran pers', foto: '/img/automotive.jpg',
  },
  {
    slug: 'manufacturing-indonesia-2026',
    tanggal: '4 Maret 2026', iso: '2026-03-04',
    judul: 'Kairos Baut di Manufacturing Indonesia 2026, Hall B stan 214',
    ringkas: 'Tiga hari demonstrasi pengukuran torsi dan konsultasi pemilihan grade bersama tim teknis.',
    kategori: 'Kegiatan', foto: '/img/konstruski.jpeg',
  },
  {
    slug: 'hex-flange-din-6921',
    tanggal: '22 Januari 2026', iso: '2026-01-22',
    judul: 'Baut hex flange DIN 6921 masuk katalog, 42 ukuran sekaligus',
    ringkas: 'Permintaan dari lini perakitan otomotif jadi alasan utama penambahan lini ini.',
    kategori: 'Produk baru', foto: '/img/electrical.jpeg',
  },
  {
    slug: 'penelusuran-batch',
    tanggal: '8 November 2025', iso: '2025-11-08',
    judul: 'Sistem penelusuran batch mulai dipakai di seluruh gudang',
    ringkas: 'Setiap rak diberi kode; asal barang dan tanggal masuk bisa dicari dalam hitungan detik.',
    kategori: 'Siaran pers', foto: '/img/hero.jpeg',
  },
  {
    slug: 'pelatihan-fastener-mitra',
    tanggal: '30 September 2025', iso: '2025-09-30',
    judul: 'Pelatihan pemilihan fastener untuk 40 teknisi mitra konstruksi',
    ringkas: 'Materi disusun dari pertanyaan yang paling sering masuk ke tim penjualan sepanjang tahun.',
    kategori: 'Kegiatan', foto: '/img/machinery.jpg',
  },
  {
    slug: 'audit-mutu-pemasok',
    tanggal: '12 Juni 2025', iso: '2025-06-12',
    judul: 'Audit mutu pemasok tahunan selesai, tiga pabrik baru lolos',
    ringkas: 'Pemeriksaan mencakup dokumen leburan, uji tarik, dan konsistensi lapisan.',
    kategori: 'Sertifikasi', foto: '/img/gudang.jpg',
  },
  {
    slug: 'din-985-sampai-m36',
    tanggal: '19 Februari 2025', iso: '2025-02-19',
    judul: 'Ring per dan mur pengunci DIN 985 kini tersedia sampai M36',
    ringkas: 'Melengkapi permintaan dari proyek konstruksi baja berat di Sumatera.',
    kategori: 'Produk baru', foto: '/img/automotive.jpg',
  },
];

export const SARING = ['Semua', 'Siaran pers', 'Kegiatan', 'Produk baru', 'Sertifikasi'];

export type KontakMedia = { nama: string; peran: string; surel: string; telepon?: string };

export const KONTAK_MEDIA: KontakMedia[] = [
  { nama: 'Rina Hapsari', peran: 'Komunikasi Perusahaan', surel: 'marketing@kairosbaut.com', telepon: '+62 21 6500 888' },
  { nama: 'Bagus Prakoso', peran: 'Teknis & Produk', surel: 'marketing@kairosbaut.com', telepon: '+62 21 8983 2622' },
];
