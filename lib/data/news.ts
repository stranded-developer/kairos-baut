/* ============================================================================
   Isi contoh untuk halaman Berita.

   SEMUA TEKS DI SINI KARANGAN — dipakai supaya ketiga rancangan bisa dinilai
   dengan panjang naskah yang realistis. Belum ada tabel `news` di Supabase;
   keputusan itu sengaja ditunda sampai satu rancangan dipilih (lihat Bagian 8
   pada logs/PROGRESS.md). Mengikuti pola lib/data/posts.ts.

   Kalau nanti dipindah ke Supabase, bentuk datanya sudah cocok: satu tabel
   `news` dengan kolom tanggal, judul, ringkasan, kategori, dan slug.
   ========================================================================= */

export type Kategori = { slug: string; nama: string; ket: string };

/* Hub empat kolom pada rancangan "Ruang Berita" — meniru
   Press releases · Stories · Media library · Media contacts di rujukan ASML,
   diterjemahkan ke urusan yang benar-benar dipunyai Kairos. */
export const KATEGORI: Kategori[] = [
  { slug: 'siaran-pers', nama: 'Siaran pers', ket: 'Pengumuman resmi perusahaan: keagenan baru, sertifikasi, dan perluasan gudang.' },
  { slug: 'kegiatan', nama: 'Kegiatan & pameran', ket: 'Jadwal pameran industri, pelatihan teknis, dan kunjungan pabrik yang kami ikuti.' },
  { slug: 'berkas-media', nama: 'Berkas media', ket: 'Logo, foto gudang, dan foto produk resolusi tinggi — siap dipakai redaksi.' },
  { slug: 'kontak-media', nama: 'Kontak media', ket: 'Nama dan nomor yang bisa dihubungi wartawan, tanpa lewat sentral.' },
];

export type Berita = {
  slug: string;
  tanggal: string;      // sudah diformat untuk dibaca manusia
  iso: string;          // untuk atribut <time datetime>
  judul: string;
  ringkas: string;
  kategori: string;
  foto?: string;        // dipakai rancangan "Papan Berita"
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

/* Butir ringkasan berbentuk poin pada rancangan "Kronik" — meniru ringkasan
   di kepala siaran pers ASML. */
export const UTAMA_BUTIR = [
  'Gudang seluas 2.100 m² di Jababeka 1 mulai menerima barang sejak 25 Agustus.',
  'Kapasitas simpan gabungan naik dari 1.500 menjadi 2.400 item siap kirim.',
  'Pengiriman ke Jawa Barat dan Banten dipangkas rata-rata satu hari kerja.',
];

export const SARING = ['Semua', 'Siaran pers', 'Kegiatan', 'Produk baru', 'Sertifikasi'];
export const TAHUN = ['Semua', '2026', '2025', '2024', '2023'];

export type KontakMedia = { nama: string; peran: string; surel: string; telepon?: string };

export const KONTAK_MEDIA: KontakMedia[] = [
  { nama: 'Rina Hapsari', peran: 'Komunikasi Perusahaan', surel: 'marketing@kairosbaut.com', telepon: '+62 21 6500 888' },
  { nama: 'Bagus Prakoso', peran: 'Teknis & Produk', surel: 'marketing@kairosbaut.com', telepon: '+62 21 8983 2622' },
];

/* Ketiga rancangan yang sedang dinilai. Dipakai halaman pemilih di /berita
   dan batang pembanding di tiap rancangan. */
export type Rancangan = { slug: string; nama: string; ringkas: string; ide: string };

export const RANCANGAN: Rancangan[] = [
  {
    slug: 'ruang', nama: 'Ruang Berita',
    ringkas: 'Paling dekat ke rujukan ASML.',
    ide: 'Hub empat kolom, garis kolom vertikal, pita satu tombol, lalu kartu putih di atas pita hijau tua.',
  },
  {
    slug: 'kronik', nama: 'Kronik',
    ringkas: 'Daftar bertanggal, tanpa gambar.',
    ide: 'Kolom tanggal di kiri, judul dan ringkasan di kanan, dipisah garis rambut. Paling tegas dan paling murah dirawat.',
  },
  {
    slug: 'papan', nama: 'Papan Berita',
    ringkas: 'Paling ramah foto.',
    ide: 'Satu berita utama berfoto besar, lalu mosaik kartu. Meminjam kosakata kartu dari halaman Blog.',
  },
];
