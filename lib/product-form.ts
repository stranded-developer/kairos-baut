/* ============================================================================
   Pembacaan & pemeriksaan data formulir produk.

   Dipisahkan dari actions.ts supaya bisa diuji tanpa perlu menjalankan
   Next.js: fungsi di sini murni FormData → baris tabel, tanpa menyentuh
   cookie, jaringan, atau basis data.
   ========================================================================= */

export const KATEGORI = ['baut', 'mur', 'batang', 'angkur'] as const;
export const STOK = ['ready', 'low', 'indent'] as const;

export interface ProductRow {
  id: string; cat: string; art: string; name: string; sub: string;
  std: string; size: string; grade: string; mat: string; stock: string;
  description: string; spec: Record<string, string>;
  finish: string[]; apps: string[]; sort_order: number; published: boolean;
}

/* Pasangan label/nilai, URUT sesuai urutan di formulir.

   Urutan ini yang tampil di tabel spesifikasi situs, dan itulah alasan kolom
   `spec` bertipe `json` bukan `jsonb` — `jsonb` mengurutkan ulang kuncinya.
   Objek JS mempertahankan urutan penyisipan untuk kunci non-angka, jadi
   membangunnya berurutan di sini sudah cukup. */
export function ambilSpec(fd: FormData): Record<string, string> {
  const labels = fd.getAll('spec_label').map(String);
  const values = fd.getAll('spec_value').map(String);
  const out: Record<string, string> = {};
  labels.forEach((l, i) => {
    const label = l.trim();
    if (label) out[label] = (values[i] ?? '').trim();
  });
  return out;
}

export function ambilDaftar(fd: FormData, field: string): string[] {
  return fd.getAll(field).map((v) => String(v).trim()).filter(Boolean);
}

export type HasilBaca = { error: string } | { row: ProductRow };

export function bacaForm(fd: FormData): HasilBaca {
  const id = String(fd.get('id') ?? '').trim();
  const cat = String(fd.get('cat') ?? '');
  const stock = String(fd.get('stock') ?? '');
  const name = String(fd.get('name') ?? '').trim();

  if (!id) return { error: 'ID (slug) wajib diisi.' };
  if (!/^[a-z0-9-]+$/.test(id))
    return { error: 'ID hanya boleh huruf kecil, angka, dan tanda hubung.' };
  if (!name) return { error: 'Nama produk wajib diisi.' };
  if (!KATEGORI.includes(cat as (typeof KATEGORI)[number]))
    return { error: 'Kategori tidak sah.' };
  if (!STOK.includes(stock as (typeof STOK)[number]))
    return { error: 'Status stok tidak sah.' };

  return {
    row: {
      id, cat, stock, name,
      art: String(fd.get('art') ?? 'hex'),
      sub: String(fd.get('sub') ?? '').trim(),
      std: String(fd.get('std') ?? '').trim(),
      size: String(fd.get('size') ?? '').trim(),
      grade: String(fd.get('grade') ?? '').trim(),
      mat: String(fd.get('mat') ?? '').trim(),
      description: String(fd.get('description') ?? '').trim(),
      spec: ambilSpec(fd),
      finish: ambilDaftar(fd, 'finish'),
      apps: ambilDaftar(fd, 'apps'),
      sort_order: Number(fd.get('sort_order') ?? 0) || 0,
      published: fd.get('published') === 'on',
    },
  };
}
