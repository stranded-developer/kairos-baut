'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-guard';
import { periksaBerkas, buatPath, unggah, hapusBerkas } from '@/lib/storage';

const BUCKET = 'product-photos';
const JENIS = ['produk', 'teknis', 'kemasan'] as const;

export type FotoProdukState = { error?: string; ok?: string };

function segarkan(id: string) {
  revalidatePath('/produk');
  revalidatePath('/');
  revalidatePath(`/admin/produk/${id}`);
}

export async function unggahFotoProduk(
  _prev: FotoProdukState,
  fd: FormData
): Promise<FotoProdukState> {
  await requireAdmin();

  const productId = String(fd.get('product_id') ?? '');
  const kind = String(fd.get('kind') ?? 'produk');
  const file = fd.get('file') as File | null;

  if (!productId) return { error: 'Produk tidak dikenal.' };
  if (!JENIS.includes(kind as (typeof JENIS)[number])) return { error: 'Jenis foto tidak sah.' };
  if (!file) return { error: 'Tidak ada berkas yang dipilih.' };

  const salah = periksaBerkas(file);
  if (salah) return { error: salah };

  const db = createAdminClient();

  /* Satu foto per jenis per produk — unggahan baru menggantikan yang lama.
     Cari dulu yang lama supaya berkasnya bisa dibuang setelah berhasil. */
  const { data: lama } = await db
    .from('product_photos')
    .select('id,storage_path')
    .eq('product_id', productId)
    .eq('kind', kind)
    .maybeSingle();

  const path = buatPath(`${productId}-${kind}`, file);
  const gagal = await unggah(BUCKET, path, file);
  if (gagal) return { error: `Gagal mengunggah: ${gagal}` };

  const alt = String(fd.get('alt') ?? '').trim();

  if (lama) {
    const { error } = await db
      .from('product_photos')
      .update({ storage_path: path, alt })
      .eq('id', lama.id);
    if (error) { await hapusBerkas(BUCKET, path); return { error: `Gagal menyimpan: ${error.message}` }; }
    await hapusBerkas(BUCKET, lama.storage_path);
  } else {
    const { error } = await db
      .from('product_photos')
      .insert({ product_id: productId, kind, storage_path: path, alt });
    if (error) { await hapusBerkas(BUCKET, path); return { error: `Gagal menyimpan: ${error.message}` }; }
  }

  segarkan(productId);
  return { ok: 'Foto diunggah.' };
}

export async function hapusFotoProduk(
  _prev: FotoProdukState,
  fd: FormData
): Promise<FotoProdukState> {
  await requireAdmin();

  const id = String(fd.get('photo_id') ?? '');
  const productId = String(fd.get('product_id') ?? '');
  if (!id) return { error: 'Foto tidak dikenal.' };

  const db = createAdminClient();
  const { data: baris } = await db
    .from('product_photos').select('storage_path').eq('id', id).maybeSingle();

  const { error } = await db.from('product_photos').delete().eq('id', id);
  if (error) return { error: `Gagal menghapus: ${error.message}` };

  await hapusBerkas(BUCKET, baris?.storage_path);

  segarkan(productId);
  return { ok: 'Foto dihapus — kembali ke gambar vektor.' };
}

/* Sunting teks alternatif tanpa harus mengunggah ulang fotonya. */
export async function simpanAltProduk(
  _prev: FotoProdukState,
  fd: FormData
): Promise<FotoProdukState> {
  await requireAdmin();

  const id = String(fd.get('photo_id') ?? '');
  const productId = String(fd.get('product_id') ?? '');
  const alt = String(fd.get('alt') ?? '').trim();
  if (!id) return { error: 'Foto tidak dikenal.' };

  const db = createAdminClient();
  const { error } = await db.from('product_photos').update({ alt }).eq('id', id);
  if (error) return { error: `Gagal menyimpan: ${error.message}` };

  segarkan(productId);
  return { ok: 'Teks alternatif disimpan.' };
}
