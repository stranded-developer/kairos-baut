/* ============================================================================
   Pembacaan & pemeriksaan formulir tulisan blog.

   Dipisah dari actions.ts supaya bisa diuji tanpa menjalankan Next —
   pola yang sama dengan lib/product-form.ts.
   ========================================================================= */

export const TOPIK = ['Standar', 'Material', 'Komponen', 'Pemasangan'] as const;

export interface PostRow {
  slug: string; title: string; topic: string; excerpt: string; body: string;
  art: string; reading_time: string | null; featured: boolean;
  published: boolean; published_at: string;
}

/** Membuat slug dari judul: huruf kecil, tanpa tanda baca, dipisah tanda hubung. */
export function buatSlug(judul: string): string {
  return judul
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // buang diakritik
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Perkiraan waktu baca — 200 kata/menit, dibulatkan ke atas, minimal 1. */
export function hitungWaktuBaca(teks: string): string {
  const kata = teks.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(kata / 200))} menit baca`;
}

export type HasilBacaPost = { error: string } | { row: PostRow };

export function bacaFormPost(fd: FormData): HasilBacaPost {
  const slug = String(fd.get('slug') ?? '').trim();
  const title = String(fd.get('title') ?? '').trim();
  const topic = String(fd.get('topic') ?? '');
  const tanggal = String(fd.get('published_at') ?? '').trim();
  const body = String(fd.get('body') ?? '');

  if (!title) return { error: 'Judul wajib diisi.' };
  if (!slug) return { error: 'Slug wajib diisi.' };
  if (!/^[a-z0-9-]+$/.test(slug))
    return { error: 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.' };
  if (!TOPIK.includes(topic as (typeof TOPIK)[number]))
    return { error: 'Topik tidak sah.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal))
    return { error: 'Tanggal harus dalam format YYYY-MM-DD.' };

  /* Waktu baca dihitung otomatis dari isi kalau tidak diisi manual. */
  const manual = String(fd.get('reading_time') ?? '').trim();
  const reading_time = manual || (body.trim() ? hitungWaktuBaca(body) : null);

  return {
    row: {
      slug, title, topic,
      excerpt: String(fd.get('excerpt') ?? '').trim(),
      body,
      art: String(fd.get('art') ?? '').trim(),
      reading_time,
      featured: fd.get('featured') === 'on',
      published: fd.get('published') === 'on',
      published_at: tanggal,
    },
  };
}
