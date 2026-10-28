/* ============================================================================
   Pembacaan & pemeriksaan formulir berita. Dipisah dari actions.ts supaya
   bisa diuji tanpa Next — pola yang sama dengan lib/post-form.ts.
   ========================================================================= */

export interface BeritaRow {
  slug: string; judul: string; kategori: string; tanggal: string; lokasi: string;
  ringkas: string; body: string; alt: string; unggulan: boolean; published: boolean;
}

export type HasilBacaBerita = { error: string } | { row: BeritaRow };

export function bacaFormBerita(fd: FormData): HasilBacaBerita {
  const s = (k: string) => String(fd.get(k) ?? '').trim();

  const slug = s('slug');
  const judul = s('judul');
  const kategori = s('kategori');
  const tanggal = s('tanggal');

  if (!judul) return { error: 'Judul wajib diisi.' };
  if (!slug) return { error: 'Slug wajib diisi.' };
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: 'Slug hanya boleh huruf kecil, angka, dan tanda hubung.' };
  if (!kategori) return { error: 'Kategori wajib diisi.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || Number.isNaN(Date.parse(tanggal))) {
    return { error: 'Tanggal tidak sah.' };
  }

  return {
    row: {
      slug, judul, kategori, tanggal,
      lokasi: s('lokasi'),
      ringkas: s('ringkas'),
      /* Isi tidak di-trim per baris — baris kosong pemisah paragraf penting. */
      body: String(fd.get('body') ?? '').replace(/\r\n/g, '\n').trim(),
      alt: s('alt'),
      unggulan: fd.get('unggulan') === 'on',
      published: fd.get('published') === 'on',
    },
  };
}
