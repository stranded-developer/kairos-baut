import 'server-only';
import { cache } from 'react';
import { createPublicClient, storageUrl } from './supabase/public';
import type { Product, StockStatus, ProductCategory } from './data/products';
import type { Post, Topic } from './data/posts';
import { BLOK_BAWAAN, CADANGAN_TENTANG, type Blok } from './data/about';
import { PROYEK, type Proyek } from './data/projects';
import { PENGATURAN_BAWAAN, type Pengaturan } from './data/settings';
import { PELANGGAN_BAWAAN, type Pelanggan } from './data/clients';
import { BERANDA_BAWAAN } from './data/home';
import { BERITA, BERITA_TEKS_BAWAAN, KONTAK_MEDIA, tanggalPanjang, type Berita, type KontakMedia } from './data/news';

/* ============================================================================
   Pembacaan data untuk halaman publik.

   Fungsi di sini mengembalikan bentuk yang PERSIS SAMA dengan yang dulu
   diekspor lib/data/*.ts, supaya komponen halaman tidak perlu diubah sama
   sekali saat sumber datanya berpindah ke Supabase. Itu juga yang membuat
   hasil render bisa dibandingkan baris per baris dengan versi sebelumnya.
   ========================================================================= */

/* ---- produk ---- */
interface FotoRow {
  product_id: string; kind: string; storage_path: string; alt: string;
}

interface ProductRow {
  id: string; cat: string; art: string; name: string; sub: string;
  std: string; size: string; grade: string; mat: string; stock: string;
  description: string; spec: Record<string, string>;
  finish: string[]; apps: string[]; sort_order: number;
}

export async function getProducts(): Promise<Product[]> {
  const db = createPublicClient();
  const [{ data, error }, { data: fotoRows }] = await Promise.all([
    db.from('products')
      .select('id,cat,art,name,sub,std,size,grade,mat,stock,description,spec,finish,apps,sort_order')
      .order('sort_order'),
    db.from('product_photos').select('product_id,kind,storage_path,alt'),
  ]);

  if (error) throw new Error(`Gagal memuat produk: ${error.message}`);

  /* Foto dikelompokkan per produk per jenis. Jenis yang belum ada fotonya
     sengaja dibiarkan kosong — komponen akan memakai gambar vektor (ART),
     sama seperti sebelum ada unggahan. */
  const foto: Record<string, Partial<Record<string, { url: string; alt: string }>>> = {};
  for (const f of (fotoRows ?? []) as FotoRow[]) {
    (foto[f.product_id] ??= {})[f.kind] = {
      url: storageUrl('product-photos', f.storage_path),
      alt: f.alt ?? '',
    };
  }

  return (data as ProductRow[]).map((r) => ({
    photos: foto[r.id] ?? {},
    id: r.id,
    cat: r.cat as ProductCategory,
    art: r.art,
    name: r.name,
    sub: r.sub,
    std: r.std,
    size: r.size,
    grade: r.grade,
    mat: r.mat,
    stock: r.stock as StockStatus,
    desc: r.description,   // kolomnya `description`, komponen memakai `desc`
    spec: r.spec,
    finish: r.finish,
    apps: r.apps,
  }));
}

/* ---- tulisan ---- */
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** "2023-08-02" → "02 Agu 2023" — format yang dipakai kartu blog. */
export function formatTanggal(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d} ${BULAN[Number(m) - 1]} ${y}`;
}

interface PostRow {
  slug: string; title: string; topic: string; excerpt: string;
  art: string; reading_time: string | null; featured: boolean; published_at: string;
}

export async function getPosts(): Promise<Post[]> {
  const db = createPublicClient();
  const { data, error } = await db
    .from('posts')
    .select('slug,title,topic,excerpt,art,reading_time,featured,published_at')
    .order('featured', { ascending: false })
    .order('published_at', { ascending: true });

  if (error) throw new Error(`Gagal memuat tulisan: ${error.message}`);

  return (data as PostRow[]).map((r) => ({
    slug: r.slug,
    date: formatTanggal(r.published_at),
    topic: r.topic as Topic,
    title: r.title,
    excerpt: r.excerpt,
    art: r.art,
    ...(r.reading_time ? { readingTime: r.reading_time } : {}),
    ...(r.featured ? { featured: true } : {}),
  }));
}

/* ---- foto situs ---- */
export interface MediaSlot {
  /** URL yang siap dipakai <img src>. */
  src: string;
  alt: string;
  /** true kalau masih memakai berkas cadangan di /public, bukan unggahan. */
  fallback: boolean;
}

/* Berkas cadangan di /public/img untuk tiap slot. Selama admin belum
   mengunggah foto, inilah yang tampil — jadi tampilan situs tidak berubah
   sedikit pun dibanding mockup. */
/* Diekspor supaya /admin/foto memakai peta yang SAMA, bukan salinan.
   Sebelumnya ada dua salinan dan keduanya sempat berbeda: slot tentang-*
   ditambahkan di sini tapi tidak di sana, sehingga pratinjaunya kosong. */
export const CADANGAN: Record<string, string> = {
  'hero': '/img/hero.jpeg',
  'gudang': '/img/gudang.jpg',
  'industri-bg': '/img/machinery.jpg',
  'industri-machinery': '/img/machinery.jpg',
  'industri-automotive': '/img/automotive.jpg',
  'industri-konstruksi': '/img/konstruski.jpeg',
  'industri-electrical': '/img/electrical.jpeg',
  'logo-adhi-karya': '/img/logo/adhi-karya.png',
  'logo-karya-logam-agung': '/img/logo/karya-logam-agung.png',
  'logo-ihi-power-electric': '/img/logo/ihi-power-electric.png',
  'logo-wijaya-karya': '/img/logo/wijaya-karya.png',
  ...CADANGAN_TENTANG,
};

interface MediaRow {
  key: string; alt: string; storage_path: string | null;
}

export async function getSiteMedia(): Promise<Record<string, MediaSlot>> {
  const db = createPublicClient();
  const { data, error } = await db.from('site_media').select('key,alt,storage_path').order('sort_order');

  if (error) throw new Error(`Gagal memuat foto situs: ${error.message}`);

  const out: Record<string, MediaSlot> = {};
  for (const r of data as MediaRow[]) {
    out[r.key] = r.storage_path
      ? { src: storageUrl('site-photos', r.storage_path), alt: r.alt, fallback: false }
      : { src: CADANGAN[r.key] ?? '', alt: r.alt, fallback: true };
  }

  /* Slot yang punya cadangan tapi BARISNYA belum ada di basis data tetap
     dikembalikan. Tanpa ini, halaman Tentang Kami tampil tanpa foto sama
     sekali sampai migrasi 0002 dijalankan manual di SQL editor — bukan cuma
     kehilangan foto, tapi tata letaknya ikut berubah jadi satu kolom.
     Baris yang ada di basis data selalu menang. */
  for (const [key, src] of Object.entries(CADANGAN)) {
    out[key] ??= { src, alt: '', fallback: true };
  }
  return out;
}


/* ---- Tentang Kami ---- */
interface BlokRow {
  key: string; label: string; kind: string; heading: string; body: string;
  media_key: string | null; flip: boolean; caption: string; note: string;
  sort_order: number;
}

/**
 * Blok naskah halaman Tentang Kami.
 *
 * Sengaja TIDAK melempar kalau tabelnya belum ada. Migrasi 0002 dijalankan
 * manual lewat SQL editor Supabase (tidak ada psql/CLI di mesin ini), jadi
 * ada jeda antara kode ini terpasang dan tabelnya terbentuk. Selama jeda itu
 * halaman tetap tampil dengan isi bawaan dari lib/data/about.ts — isi yang
 * sama persis dengan yang di-seed migrasi.
 *
 * Beda dengan getSiteMedia() yang memang melempar: di sana tabelnya sudah
 * pasti ada sejak 0001.
 */
export async function getAboutBlocks(): Promise<Blok[]> {
  const db = createPublicClient();
  const { data, error } = await db
    .from('about_blocks')
    .select('key,label,kind,heading,body,media_key,flip,caption,note,sort_order')
    .order('sort_order');

  if (error || !data || data.length === 0) return BLOK_BAWAAN;

  return (data as BlokRow[]).map((r) => ({
    key: r.key,
    label: r.label,
    kind: r.kind as Blok['kind'],
    heading: r.heading,
    body: r.body,
    mediaKey: r.media_key,
    flip: r.flip,
    caption: r.caption,
    note: r.note,
    sortOrder: r.sort_order,
  }));
}


/* ---- proyek (halaman Industri) ---- */
interface ProyekRow {
  slug: string; nama: string; sektor: string; ringkas: string;
  alt: string; storage_path: string | null; urutan: number;
  /* Kolom rincian baru ada setelah migrasi 0004 — dibaca sebagai opsional
     supaya halaman tetap jalan (dan data admin tidak hilang) sebelum itu. */
  lokasi?: string; tahun?: string; klien?: string; lingkup?: string; body?: string;
}

/**
 * Daftar proyek. Seperti getAboutBlocks(), sengaja tidak melempar kalau
 * tabelnya belum ada — migrasi 0003 dijalankan manual di SQL editor, jadi
 * halaman harus tetap tampil dengan daftar bawaan selama jeda itu.
 */
export async function getProjects(): Promise<Proyek[]> {
  const db = createPublicClient();
  /* `*`, bukan daftar kolom: kalau migrasi 0004 belum dijalankan, menyebut
     kolom `lokasi` dkk. membuat seluruh kueri gagal — dan itu berarti jatuh
     ke data bawaan, MENGHILANGKAN suntingan admin dari layar. */
  const { data, error } = await db.from('projects').select('*').order('urutan');

  if (error || !data || data.length === 0) return PROYEK;

  return (data as ProyekRow[]).map((r) => ({
    slug: r.slug,
    nama: r.nama,
    sektor: r.sektor as Proyek['sektor'],
    ringkas: r.ringkas,
    /* Foto yang diunggah admin menang; kalau belum ada, pakai foto hasil
       ekstraksi dari company profile. */
    foto: r.storage_path
      ? storageUrl('site-photos', r.storage_path)
      : `/img/proyek/${r.slug}.jpg`,
    alt: r.alt,
    urutan: r.urutan,
    lokasi: r.lokasi ?? '',
    tahun: r.tahun ?? '',
    klien: r.klien ?? '',
    lingkup: r.lingkup ?? '',
    body: r.body ?? '',
  }));
}


/* ---- pengaturan situs ---- */

/**
 * Kontak, WhatsApp, dan teks kaki halaman.
 *
 * Seperti getAboutBlocks(), sengaja tidak melempar kalau tabelnya belum ada
 * (migrasi 0005 dijalankan manual) — isi bawaan dipakai. Per kunci juga:
 * kunci yang belum punya baris tetap dapat nilai bawaan.
 *
 * Dibungkus cache() karena satu halaman memanggilnya beberapa kali (kaki
 * halaman, tombol WhatsApp, blok Penawaran) — cukup satu kueri per render.
 */
export const getSettings = cache(async (): Promise<Pengaturan> => {
  const semua = await bacaSemuaSetelan();
  const out: Pengaturan = { ...PENGATURAN_BAWAAN };
  for (const k of Object.keys(out) as (keyof Pengaturan)[]) {
    const v = semua.get(k);
    if (v !== undefined) out[k] = v;
  }
  return out;
});

/* Seluruh isi site_settings dalam satu kueri — dipakai bersama oleh
   getSettings() dan getBeranda(). Peta kosong kalau tabelnya belum ada. */
const bacaSemuaSetelan = cache(async (): Promise<Map<string, string>> => {
  const db = createPublicClient();
  const { data, error } = await db.from('site_settings').select('key,value');
  if (error || !data) return new Map();
  return new Map((data as { key: string; value: string }[]).map((r) => [r.key, r.value]));
});

/**
 * Naskah beranda (kunci `b_*`, migrasi 0008). Mengembalikan fungsi `t(kunci)`
 * yang jatuh ke isi bawaan kalau barisnya belum ada.
 *
 * Kunci yang tidak dikenal MELEMPAR, bukan mengembalikan teks kosong: beranda
 * dirender saat build, jadi salah ketik nama kunci ketahuan di `next build`,
 * bukan diam-diam jadi lubang di halaman.
 */
export const getBeranda = cache(async (): Promise<(kunci: string) => string> => {
  const semua = await bacaSemuaSetelan();
  return (kunci: string) => {
    if (!(kunci in BERANDA_BAWAAN)) throw new Error(`Kunci naskah beranda tidak dikenal: ${kunci}`);
    return semua.get(kunci) ?? BERANDA_BAWAAN[kunci];
  };
});


/* ---- pelanggan (marquee beranda) ---- */

/**
 * Pelanggan yang terbit, urut. Tidak melempar: kalau tabelnya belum ada
 * (migrasi 0006 belum dijalankan) dipakai empat nama bawaan.
 *
 * Tabel yang ADA tapi kosong dikembalikan apa adanya (daftar kosong) — itu
 * keputusan admin, bukan keadaan rusak. Beranda lalu menyembunyikan pitanya.
 */
export async function getClients(): Promise<Pelanggan[]> {
  const db = createPublicClient();
  const { data, error } = await db
    .from('clients')
    .select('id,nama,storage_path')
    .order('urutan');

  if (error || !data) return PELANGGAN_BAWAAN;

  return (data as { id: string; nama: string; storage_path: string | null }[]).map((r) => ({
    id: r.id,
    nama: r.nama,
    logo: r.storage_path ? storageUrl('site-photos', r.storage_path) : null,
  }));
}


/* ---- merek (logo navbar & kaki halaman) ---- */
export interface Merek {
  depan: string;
  belakang: string;
  /** URL logo unggahan per latar; null = gambar vektor bawaan. */
  gelap: string | null;
  terang: string | null;
  alt: string;
}

/**
 * Teks merek dari site_settings + dua slot logo dari site_media. Dipakai
 * components/Logo.tsx yang muncul 2–3 kali per halaman, jadi di-cache().
 * Tidak melempar: sebelum migrasi 0007, hasilnya = merek lama apa adanya.
 */
export const getMerek = cache(async (): Promise<Merek> => {
  const db = createPublicClient();
  const [setelan, { data }] = await Promise.all([
    getSettings(),
    db.from('site_media').select('key,alt,storage_path').in('key', ['merek-gelap', 'merek-terang']),
  ]);

  const url = (key: string) => {
    const r = (data ?? []).find((m) => m.key === key);
    return r?.storage_path ? storageUrl('site-photos', r.storage_path) : null;
  };
  const alt = (data ?? []).find((m) => m.alt)?.alt
    || `${setelan.merek_depan} ${setelan.merek_belakang}`.trim()
    || 'Beranda';

  return {
    depan: setelan.merek_depan,
    belakang: setelan.merek_belakang,
    gelap: url('merek-gelap'),
    terang: url('merek-terang'),
    alt,
  };
});


/* ---- berita ---- */
interface BeritaRow {
  slug: string; judul: string; ringkas: string; body: string; kategori: string;
  tanggal: string; lokasi: string; storage_path: string | null; alt: string;
  unggulan: boolean;
}

function petaBerita(r: BeritaRow): Berita {
  return {
    slug: r.slug,
    iso: r.tanggal,
    tanggal: tanggalPanjang(r.tanggal),
    judul: r.judul,
    ringkas: r.ringkas,
    kategori: r.kategori,
    lokasi: r.lokasi,
    body: r.body,
    /* Berita contoh hasil seed menunjuk foto stok lewat storage_path
       berawalan "/" — itu berkas di /public, bukan di bucket. */
    foto: r.storage_path
      ? r.storage_path.startsWith('/') ? r.storage_path : storageUrl('site-photos', r.storage_path)
      : undefined,
    alt: r.alt,
  };
}

/**
 * Berita terbit, terbaru dulu — kecuali yang ditandai unggulan, yang selalu
 * jadi yang pertama (kartu besar). Tidak melempar: sebelum migrasi 0009,
 * dipakai isi bawaan.
 */
export const getBerita = cache(async (): Promise<Berita[]> => {
  const db = createPublicClient();
  const { data, error } = await db
    .from('news')
    .select('slug,judul,ringkas,body,kategori,tanggal,lokasi,storage_path,alt,unggulan')
    .order('unggulan', { ascending: false })
    .order('tanggal', { ascending: false });

  if (error || !data) return BERITA;
  return (data as BeritaRow[]).map(petaBerita);
});

export async function getBeritaSatu(slug: string): Promise<Berita | null> {
  return (await getBerita()).find((b) => b.slug === slug) ?? null;
}

export const getKontakMedia = cache(async (): Promise<KontakMedia[]> => {
  const db = createPublicClient();
  const { data, error } = await db
    .from('press_contacts')
    .select('id,nama,peran,surel,telepon')
    .order('urutan');
  if (error || !data) return KONTAK_MEDIA;
  return (data as KontakMedia[]).map((k) => ({ ...k, telepon: k.telepon || undefined }));
});

/** Naskah halaman /berita (kunci `n_*`). Sama dengan getBeranda(). */
export const getTeksBerita = cache(async (): Promise<(kunci: string) => string> => {
  const semua = await bacaSemuaSetelan();
  return (kunci: string) => {
    if (!(kunci in BERITA_TEKS_BAWAAN)) throw new Error(`Kunci naskah berita tidak dikenal: ${kunci}`);
    return semua.get(kunci) ?? BERITA_TEKS_BAWAAN[kunci];
  };
});
