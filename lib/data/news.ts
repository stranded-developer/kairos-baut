import type { Kelompok } from './home';

/* ============================================================================
   Berita — isi bawaan halaman /berita.

   ⚠️ KESEMBILAN BERITA DI BAWAH INI KARANGAN — contoh isi dari tahap mockup,
   bukan kejadian sungguhan. Migrasi 0009 memasukkannya dengan tanda
   `contoh = true`, dan /admin/berita menandainya "Contoh" supaya diganti atau
   dihapus sebelum situs dipromosikan. Tanda itu hilang begitu beritanya
   disimpan dari backoffice.

   Tiga kegunaan berkas ini (sama dengan lib/data/home.ts):
     1. cadangan sebelum migrasi 0009 dijalankan;
     2. label & petunjuk naskah halaman di backoffice (BERITA_TEKS);
     3. sumber isi awal 0009 — SQL-nya dibuat scripts/sql-berita.ts.
   ========================================================================= */

export type Berita = {
  slug: string;
  tanggal: string;      // sudah diformat untuk dibaca manusia
  iso: string;          // untuk atribut <time datetime>
  judul: string;
  ringkas: string;
  kategori: string;
  lokasi: string;       // baris tanggal di halaman artikel, mis. "Jakarta"
  body: string;         // isi lengkap; lihat components/Naskah.tsx untuk formatnya
  foto?: string;
  alt: string;
};

const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

/** "2026-08-28" → "28 Agustus 2026" — format kartu dan halaman berita. */
export function tanggalPanjang(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${Number(d)} ${BULAN_PANJANG[Number(m) - 1]} ${y}`;
}

type Sumber = Omit<Berita, 'tanggal' | 'lokasi' | 'body' | 'alt'>;

export const BERITA_SUMBER: Sumber[] = [
  {
    slug: 'gudang-kedua-cikarang', iso: '2026-08-28',
    judul: 'Gudang kedua di Cikarang beroperasi, kapasitas simpan naik 60%',
    ringkas: 'Gudang 2.100 m² di Jababeka 1 mulai menerima barang. Pengiriman ke Jawa Barat dan Banten dipangkas rata-rata satu hari kerja.',
    kategori: 'Siaran pers', foto: '/img/gudang.jpg',
  },
  {
    slug: 'mill-certificate-per-batch', iso: '2026-07-15',
    judul: 'Mill certificate per batch untuk seluruh lini mutu 8.8 dan 10.9',
    ringkas: 'Setiap pengiriman baut mutu tinggi kini disertai sertifikat pabrik yang bisa ditelusuri sampai nomor leburan.',
    kategori: 'Sertifikasi', foto: '/img/machinery.jpg',
  },
  {
    slug: 'distributor-resmi-tahan-karat', iso: '2026-05-16',
    judul: 'Kairos ditunjuk jadi distributor resmi fastener tahan karat A2 dan A4',
    ringkas: 'Mencakup wilayah Jawa dan Sumatera, dengan stok penyangga yang disimpan di gudang Sunter.',
    kategori: 'Siaran pers', foto: '/img/automotive.jpg',
  },
  {
    slug: 'manufacturing-indonesia-2026', iso: '2026-03-04',
    judul: 'Kairos Baut di Manufacturing Indonesia 2026, Hall B stan 214',
    ringkas: 'Tiga hari demonstrasi pengukuran torsi dan konsultasi pemilihan grade bersama tim teknis.',
    kategori: 'Kegiatan', foto: '/img/konstruski.jpeg',
  },
  {
    slug: 'hex-flange-din-6921', iso: '2026-01-22',
    judul: 'Baut hex flange DIN 6921 masuk katalog, 42 ukuran sekaligus',
    ringkas: 'Permintaan dari lini perakitan otomotif jadi alasan utama penambahan lini ini.',
    kategori: 'Produk baru', foto: '/img/electrical.jpeg',
  },
  {
    slug: 'penelusuran-batch', iso: '2025-11-08',
    judul: 'Sistem penelusuran batch mulai dipakai di seluruh gudang',
    ringkas: 'Setiap rak diberi kode; asal barang dan tanggal masuk bisa dicari dalam hitungan detik.',
    kategori: 'Siaran pers', foto: '/img/hero.jpeg',
  },
  {
    slug: 'pelatihan-fastener-mitra', iso: '2025-09-30',
    judul: 'Pelatihan pemilihan fastener untuk 40 teknisi mitra konstruksi',
    ringkas: 'Materi disusun dari pertanyaan yang paling sering masuk ke tim penjualan sepanjang tahun.',
    kategori: 'Kegiatan', foto: '/img/machinery.jpg',
  },
  {
    slug: 'audit-mutu-pemasok', iso: '2025-06-12',
    judul: 'Audit mutu pemasok tahunan selesai, tiga pabrik baru lolos',
    ringkas: 'Pemeriksaan mencakup dokumen leburan, uji tarik, dan konsistensi lapisan.',
    kategori: 'Sertifikasi', foto: '/img/gudang.jpg',
  },
  {
    slug: 'din-985-sampai-m36', iso: '2025-02-19',
    judul: 'Ring per dan mur pengunci DIN 985 kini tersedia sampai M36',
    ringkas: 'Melengkapi permintaan dari proyek konstruksi baja berat di Sumatera.',
    kategori: 'Produk baru', foto: '/img/automotive.jpg',
  },
];

export const BERITA: Berita[] = BERITA_SUMBER.map((b) => ({
  ...b, tanggal: tanggalPanjang(b.iso), lokasi: '', body: '', alt: '',
}));

/* Urutan tab saringan. Kategori lain yang dipakai admin ikut muncul sesudahnya. */
export const SARING = ['Semua', 'Siaran pers', 'Kegiatan', 'Produk baru', 'Sertifikasi'];

export type KontakMedia = { id: string; nama: string; peran: string; surel: string; telepon?: string };

export const KONTAK_MEDIA: KontakMedia[] = [
  { id: 'rina', nama: 'Rina Hapsari', peran: 'Komunikasi Perusahaan', surel: 'marketing@kairosbaut.com', telepon: '+62 21 6500 888' },
  { id: 'bagus', nama: 'Bagus Prakoso', peran: 'Teknis & Produk', surel: 'marketing@kairosbaut.com', telepon: '+62 21 8983 2622' },
];

/* Naskah halaman /berita — kunci `n_*` di site_settings. */
export const BERITA_TEKS: Kelompok[] = [
  {
    grp: 'Kepala halaman',
    isian: [
      { key: 'n_judul', label: 'Judul halaman', value: 'Kabar dari gudang.' },
      { key: 'n_lede', label: 'Paragraf pembuka', panjang: true, value: 'Apa yang sedang terjadi di Kairos Baut — gudang baru, lini produk baru, pameran, dan pengumuman resmi.' },
      { key: 'n_arsip_eyebrow', label: 'Arsip — label kecil', value: 'Arsip' },
      { key: 'n_arsip_judul', label: 'Arsip — judul', value: 'Semua kabar.' },
    ],
  },
  {
    grp: 'Untuk media',
    ket: 'Blok hijau tua di bawah halaman Berita dan setiap artikel. Kontak orangnya diatur di bawah.',
    isian: [
      { key: 'n_media_eyebrow', label: 'Label kecil', value: 'Untuk redaksi' },
      { key: 'n_media_judul', label: 'Judul', value: 'Untuk media.' },
      { key: 'n_media_lede', label: 'Paragraf', panjang: true, value: 'Permintaan wawancara, data, atau foto beresolusi tinggi — hubungi langsung, jangan lewat sentral.' },
      { key: 'n_berkas_judul', label: 'Kartu "Berkas foto" — judul', value: 'Berkas foto' },
      { key: 'n_berkas_isi', label: 'Kartu "Berkas foto" — isi', panjang: true, value: 'Logo, foto gudang, dan foto produk resolusi tinggi — satu arsip, siap unduh.' },
      {
        key: 'n_berkas_tautan', label: 'Kartu "Berkas foto" — tautan',
        value: 'mailto:marketing@kairosbaut.com?subject=Permintaan%20berkas%20foto',
        note: 'Tautan unduhan (mis. Google Drive) atau mailto:. Kosongkan untuk menyembunyikan kartu ini.',
      },
      { key: 'n_langganan_judul', label: 'Kartu "Berlangganan" — judul', value: 'Berlangganan' },
      { key: 'n_langganan_isi', label: 'Kartu "Berlangganan" — isi', panjang: true, value: 'Satu surel tiap ada pengumuman resmi. Tanpa promosi.' },
      {
        key: 'n_langganan_tautan', label: 'Kartu "Berlangganan" — tautan',
        value: 'mailto:marketing@kairosbaut.com?subject=Berlangganan%20kabar%20Kairos%20Baut',
        note: 'Kosongkan untuk menyembunyikan kartu ini.',
      },
    ],
  },
];

export const BERITA_TEKS_BAWAAN: Record<string, string> = Object.fromEntries(
  BERITA_TEKS.flatMap((k) => k.isian.map((i) => [i.key, i.value]))
);
