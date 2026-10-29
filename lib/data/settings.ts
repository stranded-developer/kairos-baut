/* ============================================================================
   Pengaturan situs — kontak, WhatsApp, kaki halaman.

   Dua kegunaan berkas ini, sama seperti lib/data/about.ts:
     1. cadangan kalau tabel `site_settings` belum dibuat — migrasi 0005
        dijalankan manual di SQL editor Supabase, jadi situs harus tetap
        tampil benar sebelum langkah itu dikerjakan;
     2. sumber tunggal isi awal — sama persis dengan yang di-seed 0005.
   ========================================================================= */

export type KunciPengaturan =
  | 'wa' | 'email' | 'email_penawaran' | 'telepon_kantor' | 'alamat_kantor' | 'telepon_workshop'
  | 'alamat_workshop' | 'jam_kerja'
  | 'tagline_kaki' | 'judul_kantor' | 'judul_workshop' | 'judul_jam'
  | 'hak_cipta' | 'catatan_kaki'
  | 'merek_depan' | 'merek_belakang'
  | 'font';

export type Pengaturan = Record<KunciPengaturan, string>;

export const PENGATURAN_BAWAAN: Pengaturan = {
  wa: '6287784085400',
  email: 'marketing@kairosbaut.com',
  email_penawaran: '',   // kosong = dikirim ke `email`; diisi lewat 0010
  telepon_kantor: '+62 21 6500 888',
  alamat_kantor: 'Perkantoran Mega Sunter Blok B No. 32\nJl. Danau Sunter Selatan\nJakarta 14350',
  telepon_workshop: '+62 21 8983 2622',
  alamat_workshop: 'Kawasan Industri Jababeka 1 Blok C 17 A\nPasirgombong, Cikarang Utara\nBekasi 17530',
  jam_kerja: 'Senin – Jumat 08.00 – 17.00\nSabtu 08.00 – 12.00',
  tagline_kaki: 'PT Kairos Multi Sejahtera — distributor baut & mur untuk industri Indonesia.',
  judul_kantor: 'Kantor',
  judul_workshop: 'Workshop',
  judul_jam: 'Jam Kerja',
  hak_cipta: '© 2026 PT Kairos Multi Sejahtera',
  catatan_kaki: '',
  merek_depan: 'Kairos',
  merek_belakang: 'Baut',
  font: 'archivo',        // lihat FONT di lib/data/home.ts
};

/** "+62 21 6500 888" → "+62216500888", untuk tautan tel:. */
export function telHref(tampil: string): string {
  return `tel:${tampil.replace(/[^\d+]/g, '')}`;
}

/**
 * Nomor WhatsApp apa pun bentuknya → format wa.me (hanya angka, diawali 62).
 * "0877-8408-5400", "+62 877 8408 5400", "6287784085400" → "6287784085400".
 * Mengembalikan null kalau hasilnya jelas bukan nomor Indonesia yang wajar.
 */
export function rapikanWa(masukan: string): string | null {
  let n = masukan.replace(/\D/g, '');
  if (n.startsWith('0')) n = `62${n.slice(1)}`;
  else if (n.startsWith('8')) n = `62${n}`;
  return /^62\d{8,13}$/.test(n) ? n : null;
}

/** Teks banyak baris → daftar baris, tanpa baris kosong. */
export function baris(teks: string): string[] {
  return teks.split('\n').map((s) => s.trim()).filter(Boolean);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "a@x.com, b@y.com" atau satu per baris → daftar alamat yang valid. */
export function daftarEmail(teks: string): string[] {
  return teks.split(/[,;\n]/).map((s) => s.trim()).filter((s) => EMAIL_RE.test(s));
}
