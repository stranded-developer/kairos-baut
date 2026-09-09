/* ============================================================================
   Isi bawaan halaman "Tentang Kami".

   Naskahnya dari user (surat Direktur Utama, 2026-09-09) — DISALIN APA ADANYA,
   tidak diringkas dan tidak diparafrase.

   Dua kegunaan berkas ini:
     1. cadangan kalau tabel `about_blocks` belum dibuat di Supabase. Migrasi
        0002 harus dijalankan manual lewat SQL editor (tidak ada psql maupun
        Supabase CLI di mesin ini), jadi halaman harus tetap tampil benar
        sebelum langkah itu dikerjakan;
     2. sumber tunggal isi awal — sama persis dengan yang di-seed 0002.

   Satu-satunya penyuntingan terhadap naskah asli: paragraf kedua dipotong
   pada kalimat motonya supaya moto bisa tampil sebagai kutipan besar (ikut
   rancangan rujukan). Tidak ada kata yang hilang — blok 'mutu' meneruskan
   kalimat sesudah moto.
   ========================================================================= */

export type BlokKind = 'teks' | 'kutipan' | 'tanda-tangan';

export type Blok = {
  key: string;
  label: string;
  kind: BlokKind;
  heading: string;
  body: string;         // paragraf dipisah baris kosong
  mediaKey: string | null;
  flip: boolean;        // true = foto di kanan
  caption: string;
  note: string;
  sortOrder: number;
};

export const BLOK_BAWAAN: Blok[] = [
  {
    key: 'sejarah', label: 'Sejarah perusahaan', kind: 'teks',
    heading: 'Berdiri sejak 2007.',
    body:
      'PT. Kairos Multi Sejahtera telah berdiri sejak tahun 2007 dan bergerak di bidang distribusi serta penjualan berbagai jenis pengencang besi (steel fasteners). Produk-produk kami mencakup material dari besi mentah hingga paduan logam seperti Stainless Steel dan Carbon Steel.\n\n' +
      'Seluruh produk telah tersertifikasi dan melalui berbagai uji kualitas yang ketat, serta digunakan di berbagai sektor industri di seluruh Indonesia, baik untuk proyek swasta, proyek pemerintah, maupun bidang manufaktur.',
    mediaKey: 'tentang-sejarah', flip: false, caption: '',
    note: 'Paragraf pembuka. Foto tampil di kiri.', sortOrder: 1,
  },
  {
    key: 'kepercayaan', label: 'Kepercayaan pelanggan', kind: 'teks',
    heading: 'Kepercayaan adalah pondasinya.',
    body:
      'Bagi kami, kepercayaan pelanggan merupakan pondasi utama dalam menjalankan bisnis. Oleh karena itu, kami di Kairos tidak hanya berkomitmen untuk menyediakan produk berkualitas tinggi, tetapi juga pelayanan pelanggan yang profesional dan responsif.',
    mediaKey: 'tentang-mutu', flip: true, caption: '',
    note: 'Foto tampil di kanan (kolom dibalik).', sortOrder: 2,
  },
  {
    key: 'moto', label: 'Moto perusahaan', kind: 'kutipan',
    heading: 'To do more than what is expected',
    body: 'Artinya, kami senantiasa berusaha memberikan lebih dari yang diharapkan oleh pelanggan dan mitra kami.',
    mediaKey: null, flip: false, caption: '',
    note: 'Judulnya dipakai sebagai kutipan besar. Tanpa foto.', sortOrder: 3,
  },
  {
    key: 'mutu', label: 'Pembelajaran berkelanjutan', kind: 'teks',
    heading: 'Belajar terus, supaya mutunya naik terus.',
    body: 'Kami percaya bahwa pembelajaran dan perbaikan berkelanjutan adalah kunci untuk menjaga dan meningkatkan mutu produk serta layanan kami kedepannya.',
    mediaKey: null, flip: false, caption: '',
    note: 'Paragraf lanjutan setelah moto. Tanpa foto.', sortOrder: 4,
  },
  {
    key: 'terima-kasih', label: 'Ucapan terima kasih', kind: 'teks',
    heading: 'Terima kasih.',
    body:
      'Kami juga ingin mengucapkan terima kasih yang sebesar-besarnya kepada seluruh pelanggan, mitra kerja, dan organisasi yang telah mendukung kami dalam berbagai aspek operasional bisnis.\n\n' +
      'Tak lupa, kami panjatkan rasa syukur yang mendalam kepada Tuhan Yang Maha Esa atas segala berkat dan tuntunan-Nya.',
    mediaKey: 'tentang-industri', flip: false, caption: '',
    note: 'Paragraf penutup. Foto tampil di kiri.', sortOrder: 5,
  },
  {
    key: 'tanda-tangan', label: 'Tanda tangan direktur', kind: 'tanda-tangan',
    heading: 'Oke Marokeh Rachmat',
    body: 'Hormat kami,',
    mediaKey: null, flip: false, caption: 'Direktur Utama',
    note: 'Judul = nama, isi = salam pembuka, keterangan = jabatan.', sortOrder: 6,
  },
];

/* Cadangan foto Tentang Kami — dipakai selama slotnya belum diunggahi admin.
   Semuanya foto stok yang sudah ada di /public/img, sesuai permintaan user
   untuk memakai foto yang sudah dipunyai. */
export const CADANGAN_TENTANG: Record<string, string> = {
  'tentang-banner': '/img/gudang.jpg',
  /* Bukan gudang.jpg lagi: spanduk dan baris pertama jadi foto yang sama
     persis, dan terlihat jelas karena keduanya berdekatan. automotive.jpg
     juga foto stok beresolusi paling besar (1600 px) di antara yang ada. */
  'tentang-sejarah': '/img/automotive.jpg',
  'tentang-mutu': '/img/machinery.jpg',
  'tentang-industri': '/img/konstruski.jpeg',
};

/* Teks alternatif bawaan. Dipakai selama baris site_media-nya belum ada —
   setelah migrasi 0002 jalan, kolom `alt` di basis data yang menang dan
   bisa disunting admin. Tanpa ini foto-foto itu tampil tanpa alt sama
   sekali sebelum migrasi. */
export const ALT_TENTANG: Record<string, string> = {
  'tentang-banner': 'Gudang dan stok baut PT Kairos Multi Sejahtera',
  'tentang-sejarah': 'Fastener Kairos dipakai di lini perakitan otomotif',
  'tentang-mutu': 'Pemeriksaan mutu fastener di lini produksi',
  'tentang-industri': 'Fastener Kairos dipakai di proyek industri',
};
