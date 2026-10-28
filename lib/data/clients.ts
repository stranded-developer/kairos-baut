/* ============================================================================
   Pelanggan di pita "Kami telah bekerja sama dengan" (beranda).

   Isi bawaan = cadangan sebelum migrasi 0006 dijalankan, sama persis dengan
   yang di-seed. Belum ada logo yang diunggah, jadi semuanya tampil sebagai
   nama — seperti marquee sejak awal.
   ========================================================================= */

export type Pelanggan = {
  id: string;
  nama: string;
  /** URL logo, atau null = nama tampil sebagai teks. */
  logo: string | null;
};

export const PELANGGAN_BAWAAN: Pelanggan[] = [
  { id: 'adhi-karya', nama: 'Adhi Karya', logo: null },
  { id: 'karya-logam-agung', nama: 'Karya Logam Agung', logo: null },
  { id: 'ihi-power-electric', nama: 'IHI Power Electric', logo: null },
  { id: 'wijaya-karya', nama: 'Wijaya Karya', logo: null },
];
