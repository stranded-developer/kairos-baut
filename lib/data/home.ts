/* ============================================================================
   Naskah beranda — semua teks yang bisa disunting di /admin/beranda.

   Polanya slot bernama seperti site_settings (dan memang disimpan di tabel
   itu, kunci berawalan `b_`). Yang bisa diubah adalah ISI teksnya; susunan
   halaman (jumlah pil, kartu, panel, ikon, tautan kartu kategori) tetap.

   Berkas ini sumber tunggal untuk tiga hal:
     1. cadangan — sebelum migrasi 0008 dijalankan, beranda tampil dengan
        nilai di sini, yang SAMA PERSIS dengan teks lama di app/page.tsx;
     2. label dan petunjuk di backoffice;
     3. isi awal migrasi 0008 — SQL-nya DIBUAT dari berkas ini oleh
        scripts/sql-beranda.ts, bukan diketik ulang.

   `panjang` = tampil sebagai textarea. Baris baru di judul (mis. judul
   Industri) dirender sebagai <br>.
   ========================================================================= */

export type Isian = { key: string; label: string; value: string; note?: string; panjang?: boolean };
export type Kelompok = { grp: string; ket?: string; isian: Isian[] };

const pil = (n: number, label: string, tautan: string): Isian[] => [
  { key: `b_pil_${n}_label`, label: `Pil ${n} — teks`, value: label },
  { key: `b_pil_${n}_tautan`, label: `Pil ${n} — tautan`, value: tautan },
];

const trust = (n: number, judul: string, isi: string): Isian[] => [
  { key: `b_trust_${n}_judul`, label: `Poin ${n} — judul`, value: judul },
  { key: `b_trust_${n}_isi`, label: `Poin ${n} — keterangan`, value: isi },
];

const angka = (n: number, nilai: string, label: string): Isian[] => [
  {
    key: `b_angka_${n}`, label: `Angka ${n}`, value: nilai,
    note: n === 1 ? 'Angka bulat, boleh diakhiri "+". Angka dihitung naik saat digulir ke layar. Selain angka (mis. "ISO") tampil apa adanya.' : undefined,
  },
  { key: `b_angka_${n}_label`, label: `Angka ${n} — keterangan`, value: label },
];

const panel = (n: number, idx: string, judul: string, isi: string): Isian[] => [
  { key: `b_panel_${n}_idx`, label: `Panel ${n} — label kecil`, value: idx },
  { key: `b_panel_${n}_judul`, label: `Panel ${n} — judul`, value: judul },
  { key: `b_panel_${n}_isi`, label: `Panel ${n} — isi`, value: isi, panjang: true },
];

const kartu = (n: number, std: string, judul: string, isi: string, ajakan: string): Isian[] => [
  { key: `b_kartu_${n}_std`, label: `Kartu ${n} — standar`, value: std },
  { key: `b_kartu_${n}_judul`, label: `Kartu ${n} — judul`, value: judul },
  { key: `b_kartu_${n}_isi`, label: `Kartu ${n} — keterangan`, value: isi },
  { key: `b_kartu_${n}_ajakan`, label: `Kartu ${n} — tautan`, value: ajakan },
];

export const BERANDA: Kelompok[] = [
  {
    grp: 'Hero',
    ket: 'Bagian paling atas, di atas foto besar.',
    isian: [
      { key: 'b_hero_eyebrow', label: 'Label kecil di atas judul', value: 'PT Kairos Multi Sejahtera · Sejak 2009' },
      { key: 'b_hero_judul', label: 'Judul', value: 'Cari baut yang tepat,' },
      { key: 'b_hero_sorotan', label: 'Judul — bagian berwarna hijau', value: 'sekali jalan.', note: 'Tampil langsung setelah judul, berwarna hijau.' },
      { key: 'b_hero_lede', label: 'Paragraf', panjang: true, value: '2.400 item baut, mur, dan ring siap kirim ke seluruh Indonesia — lengkap dengan sertifikat material. Cari langsung di bawah, atau kirim spesifikasi Anda ke tim kami.' },
      { key: 'b_cari_placeholder', label: 'Kotak cari — teks samar', value: 'Cari: hex bolt M16, as drat SS304, snap ring…' },
      { key: 'b_cari_tombol', label: 'Tombol cari', value: 'Cari' },
      { key: 'b_cari_tombol_lebar', label: 'Tombol cari — tambahan di layar lebar', value: 'Produk', note: 'Disembunyikan di ponsel, jadi tombolnya tetap pendek.' },
    ],
  },
  {
    grp: 'Pil pencarian cepat',
    ket: 'Enam tombol kecil di bawah kotak cari. Tautan boleh ke /produk?q=… (cari) atau /produk?f=… (saring kategori).',
    isian: [
      ...pil(1, 'Hex Bolt', '/produk?q=hex%20bolt'),
      ...pil(2, 'Mur & Ring', '/produk?f=mur'),
      ...pil(3, 'As Drat', '/produk?f=batang'),
      ...pil(4, 'Anchor Bolt', '/produk?f=angkur'),
      ...pil(5, 'Stainless 304', '/produk?q=SS304'),
      ...pil(6, 'Galvanis', '/produk?q=HDG'),
    ],
  },
  {
    grp: 'Pita keunggulan',
    ket: 'Empat poin dalam kotak putih tepat di bawah hero. Ikonnya tetap.',
    isian: [
      ...trust(1, 'Sertifikat lengkap', 'Mill cert & uji tarik per batch'),
      ...trust(2, 'Kirim 34 provinsi', 'Dari Jakarta & Cikarang'),
      ...trust(3, 'Balas 1×24 jam', 'Penawaran pada hari kerja'),
      ...trust(4, 'Gudang sendiri', 'Stok fisik, bukan dropship'),
    ],
  },
  {
    grp: 'Tentang kami',
    isian: [
      { key: 'b_tentang_eyebrow', label: 'Label kecil', value: 'Tentang kami' },
      { key: 'b_tentang_judul', label: 'Judul', value: 'Satu baut yang salah grade sudah cukup.' },
      { key: 'b_tentang_lede', label: 'Paragraf', panjang: true, value: 'Itu sebabnya setiap pengiriman kami disertai mill certificate, hasil uji tarik, dan laporan dimensi. Bukan formalitas — itu yang membedakan pemasok baut dengan mitra teknis. Lima belas tahun kami melayani kontraktor dan pabrik yang tidak punya ruang untuk menebak.' },
      { key: 'b_tentang_tautan', label: 'Tautan ke formulir', value: 'Bicara dengan tim teknis kami' },
      { key: 'b_gudang_keterangan', label: 'Keterangan foto gudang', value: 'Gudang Cikarang · Jababeka 1' },
      ...angka(1, '15+', 'Tahun melayani industri'),
      ...angka(2, '2400', 'Item stok siap kirim'),
      ...angka(3, '34', 'Provinsi terjangkau'),
      { key: 'b_profil_tombol', label: 'Tombol unduh profil', value: 'Profil Perusahaan' },
      { key: 'b_profil_meta', label: 'Keterangan di samping tombol', value: 'PDF · 3,8 MB' },
    ],
  },
  {
    grp: 'Pelanggan',
    ket: 'Daftar perusahaannya diatur di menu Pelanggan.',
    isian: [
      { key: 'b_klien_eyebrow', label: 'Label di atas pita', value: 'Kami telah bekerja sama dengan' },
    ],
  },
  {
    grp: 'Industri',
    ket: 'Bagian hijau tua dengan empat panel foto. Fotonya diatur di Foto situs.',
    isian: [
      { key: 'b_industri_eyebrow', label: 'Label kecil', value: 'Industri' },
      { key: 'b_industri_judul', label: 'Judul', panjang: true, value: 'Empat sektor,\nsatu standar.', note: 'Baris baru tampil sebagai pindah baris.' },
      { key: 'b_industri_lede', label: 'Paragraf', panjang: true, value: 'Kami berkomitmen memberikan pelayanan yang lebih dari yang diharapkan — mulai dari konsultasi spesifikasi sampai pengiriman ke lokasi proyek.' },
      ...panel(1, '01 — Machinery', 'Mesin produksi', 'Fastener presisi dengan toleransi ketat dan stok berkelanjutan, supaya penggantian saat downtime tidak perlu menunggu impor.'),
      ...panel(2, '02 — Automotive', 'Otomotif', 'Baut bodi, chassis, dan engine mounting untuk workshop maupun manufaktur komponen kendaraan.'),
      ...panel(3, '03 — Konstruksi', 'Konstruksi', 'Baut struktur A325 dan A490, angkur, serta as drat galvanis untuk proyek gedung dan infrastruktur.'),
      ...panel(4, '04 — Elektrikal', 'Kelistrikan', 'Fastener tahan korosi untuk tower transmisi, panel distribusi, dan instalasi luar ruang.'),
    ],
  },
  {
    grp: 'Kategori produk',
    ket: 'Delapan kartu. Gambar dan tujuan tautannya tetap; yang bisa diubah teksnya.',
    isian: [
      { key: 'b_katalog_eyebrow', label: 'Label kecil', value: 'Katalog' },
      { key: 'b_katalog_judul', label: 'Judul', value: 'Kategori produk.' },
      { key: 'b_katalog_tautan', label: 'Tautan ke indeks', value: 'Lihat indeks lengkap' },
      ...kartu(1, 'DIN 933 · M4–M48', 'Hex Bolt', 'Grade 4.8 sampai 12.9.', 'Lihat detail'),
      ...kartu(2, 'DIN 603 · M6–M20', 'Carriage Bolt', 'Kepala bulat, leher persegi.', 'Lihat detail'),
      ...kartu(3, 'DIN 934 · M4–M48', 'Hex Nut & Mur', 'Biasa, nylock, dan flange.', 'Lihat detail'),
      ...kartu(4, 'DIN 125 · M4–M42', 'Ring / Washer', 'Plat, per, dan ring gigi.', 'Lihat detail'),
      ...kartu(5, 'DIN 471 · 3–120 mm', 'Snap Ring', 'External, internal, E-clip.', 'Lihat detail'),
      ...kartu(6, 'DIN 975 · M6–M36', 'As Drat / Stud', 'Batang ulir 1 meter.', 'Lihat detail'),
      ...kartu(7, 'ASTM F1554 · M12–M42', 'Anchor Bolt', 'J-bolt, L-bolt, angkur kimia.', 'Lihat detail'),
      ...kartu(8, 'Custom · Indent', 'Pesanan Khusus', 'Ukuran & material non-standar.', 'Kirim spesifikasi'),
    ],
  },
  {
    grp: 'Penawaran',
    ket: 'Blok hijau tua di atas formulir. Nomor, email, dan alamatnya diatur di menu Kontak.',
    isian: [
      { key: 'b_penawaran_eyebrow', label: 'Label kecil', value: 'Penawaran' },
      { key: 'b_penawaran_judul', label: 'Judul', value: 'Minta penawaran.' },
      { key: 'b_penawaran_lede', label: 'Paragraf', panjang: true, value: 'Isi formulir ini, atau langsung chat WhatsApp kalau butuh cepat. Belum yakin spesifikasinya? Kirim gambar kerja atau foto barang lama — tim kami bantu identifikasi.' },
      { key: 'b_kontak_telepon_ket', label: 'Keterangan di bawah telepon', value: 'Kantor Jakarta' },
      { key: 'b_kontak_email_ket', label: 'Keterangan di bawah email', value: 'Balas 1×24 jam kerja' },
    ],
  },
  {
    grp: 'Formulir penawaran',
    ket: 'Label, teks samar, pilihan, dan pesan formulir. Susunan kolomnya tetap.',
    isian: [
      { key: 'b_form_label_nama', label: 'Nama — label', value: 'Nama' },
      { key: 'b_form_ph_nama', label: 'Nama — teks samar', value: 'Nama lengkap' },
      { key: 'b_form_label_perusahaan', label: 'Perusahaan — label', value: 'Perusahaan' },
      { key: 'b_form_ph_perusahaan', label: 'Perusahaan — teks samar', value: 'PT / CV' },
      { key: 'b_form_opsional', label: 'Penanda kolom opsional', value: '(opsional)' },
      { key: 'b_form_label_email', label: 'Email — label', value: 'Email' },
      { key: 'b_form_ph_email', label: 'Email — teks samar', value: 'nama@perusahaan.co.id' },
      { key: 'b_form_label_wa', label: 'WhatsApp — label', value: 'Nomor WhatsApp' },
      { key: 'b_form_ph_wa', label: 'WhatsApp — teks samar', value: '08xx xxxx xxxx' },
      { key: 'b_form_label_kategori', label: 'Kategori — label', value: 'Kategori produk' },
      {
        key: 'b_form_pilihan', label: 'Kategori — pilihan', panjang: true,
        value: 'Hex Bolt\nCarriage Bolt\nMur & Ring\nAs Drat / Stud\nAnchor Bolt\nSnap Ring\nLainnya',
        note: 'Satu pilihan per baris. Yang pertama terpilih sebagai bawaan.',
      },
      { key: 'b_form_label_spek', label: 'Spesifikasi — label', value: 'Spesifikasi & jumlah' },
      { key: 'b_form_ph_spek', label: 'Spesifikasi — teks samar', value: 'Hex bolt M16 × 60, grade 8.8, HDG — 500 pcs' },
      { key: 'b_form_tombol', label: 'Tombol kirim', value: 'Kirim Permintaan' },
      { key: 'b_form_tombol_terkirim', label: 'Tombol setelah terkirim', value: 'Terkirim ✓' },
      { key: 'b_form_catatan', label: 'Catatan di samping tombol', value: 'Dibalas dalam 1×24 jam kerja.' },
      { key: 'b_form_galat', label: 'Pesan kalau kolom wajib kosong', value: 'Lengkapi dulu kolom yang wajib diisi.' },
      { key: 'b_form_berhasil', label: 'Pesan setelah terkirim', value: 'Permintaan diterima. Tim kami membalas dalam 1×24 jam kerja.' },
    ],
  },
];

/** Kunci → isi bawaan. */
export const BERANDA_BAWAAN: Record<string, string> = Object.fromEntries(
  BERANDA.flatMap((k) => k.isian.map((i) => [i.key, i.value]))
);

/* ---------------------------------------------------------------------------
   Pasangan font. Dipilih di /admin/beranda, berlaku untuk SELURUH situs —
   font yang hanya berganti di beranda akan terasa seperti situs yang rusak.

   Semuanya punya tebal 800, karena judul di kairos.css memakai 800 dengan
   jarak huruf rapat. Font tanpa 800 akan dipalsukan browser dan terlihat
   jelek. URL Google Fonts tiap pasangan sudah diperiksa menjawab 200.
   --------------------------------------------------------------------------- */
export type PasanganFont = {
  id: string;
  nama: string;
  ket: string;
  sans: string;
  mono: string;
  url: string;
};

const CADANGAN_SANS = '"Helvetica Neue", Helvetica, "Segoe UI", Arial, sans-serif';
const CADANGAN_MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export const FONT: PasanganFont[] = [
  {
    id: 'archivo', nama: 'Archivo + Roboto Mono', ket: 'Bawaan — yang disetujui di mockup. Tegas, agak lebar, nuansa industri.',
    sans: `"Archivo", ${CADANGAN_SANS}`, mono: `"Roboto Mono", ${CADANGAN_MONO}`,
    url: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400..800&family=Roboto+Mono:wght@400..600&display=swap',
  },
  {
    id: 'jakarta', nama: 'Plus Jakarta Sans + JetBrains Mono', ket: 'Dirancang di Jakarta. Lebih ramah dan modern, tetap rapi.',
    sans: `"Plus Jakarta Sans", ${CADANGAN_SANS}`, mono: `"JetBrains Mono", ${CADANGAN_MONO}`,
    url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..800&family=JetBrains+Mono:wght@400..600&display=swap',
  },
  {
    id: 'inter', nama: 'Inter Tight + IBM Plex Mono', ket: 'Netral dan padat, nuansa korporat-teknis.',
    sans: `"Inter Tight", ${CADANGAN_SANS}`, mono: `"IBM Plex Mono", ${CADANGAN_MONO}`,
    url: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400..800&family=IBM+Plex+Mono:wght@400;500;600&display=swap',
  },
  {
    id: 'manrope', nama: 'Manrope + JetBrains Mono', ket: 'Bulat dan lapang, paling lembut dari keempatnya.',
    sans: `"Manrope", ${CADANGAN_SANS}`, mono: `"JetBrains Mono", ${CADANGAN_MONO}`,
    url: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&family=JetBrains+Mono:wght@400..600&display=swap',
  },
];

export function pasanganFont(id: string): PasanganFont {
  return FONT.find((f) => f.id === id) ?? FONT[0];
}
