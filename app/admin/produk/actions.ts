'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-guard';
import { bacaForm } from '@/lib/product-form';

export type SaveState = { error?: string; ok?: string };

/* Halaman publik dibangun statis — tanpa ini perubahan baru tampil setelah
   jendela revalidate 5 menit habis. */
function segarkanHalamanPublik() {
  revalidatePath('/produk');
  revalidatePath('/');
}

export async function simpanProduk(_prev: SaveState, fd: FormData): Promise<SaveState> {
  await requireAdmin();

  const parsed = bacaForm(fd);
  if ('error' in parsed) return { error: parsed.error };

  const db = createAdminClient();
  const { error } = await db.from('products').upsert(parsed.row, { onConflict: 'id' });
  if (error) return { error: `Gagal menyimpan: ${error.message}` };

  segarkanHalamanPublik();
  revalidatePath('/admin/produk');
  return { ok: 'Tersimpan.' };
}

export async function buatProduk(_prev: SaveState, fd: FormData): Promise<SaveState> {
  await requireAdmin();

  const parsed = bacaForm(fd);
  if ('error' in parsed) return { error: parsed.error };

  const db = createAdminClient();
  const { data: ada } = await db.from('products').select('id').eq('id', parsed.row.id).maybeSingle();
  if (ada) return { error: `ID "${parsed.row.id}" sudah dipakai produk lain.` };

  const { error } = await db.from('products').insert(parsed.row);
  if (error) return { error: `Gagal membuat: ${error.message}` };

  segarkanHalamanPublik();
  revalidatePath('/admin/produk');
  redirect(`/admin/produk/${parsed.row.id}?baru=1`);
}

export async function hapusProduk(fd: FormData): Promise<void> {
  await requireAdmin();

  const id = String(fd.get('id') ?? '');
  if (!id) return;

  const db = createAdminClient();
  await db.from('products').delete().eq('id', id);

  segarkanHalamanPublik();
  revalidatePath('/admin/produk');
  redirect('/admin/produk');
}
