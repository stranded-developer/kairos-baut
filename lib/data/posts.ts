/* ============================================================================
   Catatan teknis (blog) — disalin apa adanya dari mockups/standalone/blog.html.

   BAGIAN 1: hardcoded di sini. BAGIAN 7: tabel `posts` di Supabase
   menggantikannya, berkas ini jadi data seed. Bentuk tipe menyusul kolom tabel.
   ========================================================================= */

export type Topic = 'Standar' | 'Material' | 'Komponen' | 'Pemasangan';

export interface Post {
  slug: string;
  date: string;
  topic: Topic;
  title: string;
  excerpt: string;
  /** Isi <svg viewBox="0 0 24 24"> untuk ilustrasi kartu. */
  art: string;
  readingTime?: string;
  featured?: boolean;
}

export const TOPICS: string[] = ['Semua', 'Standar', 'Material', 'Komponen', 'Pemasangan'];

export const POSTS: Post[] = [
  {
    slug: 'membaca-grade-baut',
    date: '02 Agu 2023',
    topic: 'Standar',
    title: 'Membaca grade baut 8.8, 10.9, dan 12.9',
    excerpt:
      'Angka di kepala baut bukan nomor seri. Yang pertama menunjukkan kuat tarik, yang kedua rasio kuat luluhnya — dan salah membacanya adalah cara paling umum sebuah sambungan gagal sebelum waktunya.',
    art: '<path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z"/><path d="M12 8v7"/><path d="M9.5 10.5 12 8l2.5 2.5"/>',
    readingTime: '6 menit baca',
    featured: true,
  },
  {
    slug: 'apa-itu-snap-ring',
    date: '22 Sep 2022',
    topic: 'Komponen',
    title: 'Apa itu snap ring? Ini beberapa jenisnya',
    excerpt: 'External, internal, dan E-clip — beda tempat pasang, beda cara ukur.',
    art: '<path d="M12 3a9 9 0 1 1-4 17" stroke-linecap="round"/><circle cx="12" cy="3" r="1.6" fill="currentColor" stroke="none"/><circle cx="8" cy="20" r="1.6" fill="currentColor" stroke="none"/>',
  },
  {
    slug: 'as-drat-stainless',
    date: '08 Mar 2023',
    topic: 'Material',
    title: 'As drat stainless steel: keunggulan dan kekurangan',
    excerpt: 'Tahan korosi, tapi kuat tariknya di bawah baja karbon grade 8.8.',
    art: '<path d="M3 10h18v4H3z"/><path d="M6 10v4M10 10v4M14 10v4M18 10v4"/>',
  },
  {
    slug: 'hdg-atau-zinc-plating',
    date: '17 Nov 2023',
    topic: 'Material',
    title: 'Hot-dip galvanized atau zinc plating?',
    excerpt: 'Ketebalan lapisan berbeda sepuluh kali lipat — begitu juga umurnya.',
    art: '<path d="M4 18V8l8-4 8 4v10"/><path d="M4 18h16"/><path d="M9 18v-5h6v5"/>',
  },
  {
    slug: 'torsi-pengencangan',
    date: '04 Feb 2024',
    topic: 'Pemasangan',
    title: 'Torsi pengencangan: tabel cepat untuk M8 – M24',
    excerpt: 'Angka pegangan untuk baut kering, berpelumas, dan galvanis.',
    art: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
  },
  {
    slug: 'isi-mill-certificate',
    date: '19 Jun 2024',
    topic: 'Standar',
    title: 'Isi mill certificate dan cara membacanya',
    excerpt: 'Komposisi kimia, hasil uji tarik, nomor heat — apa artinya bagi QC.',
    art: '<path d="M5 6h14v12H5z"/><path d="M8 10h8M8 14h5"/>',
  },
  {
    slug: 'angkur-j-bolt-l-bolt',
    date: '28 Jan 2025',
    topic: 'Komponen',
    title: 'Angkur J-bolt, L-bolt, dan angkur kimia',
    excerpt: 'Mana yang dipakai untuk beton baru, mana untuk beton lama.',
    art: '<path d="M12 4v16"/><path d="M7 9h10"/><path d="M9 20h6"/>',
  },
];
