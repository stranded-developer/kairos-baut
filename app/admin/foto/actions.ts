'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-guard';
import { periksaBerkas, buatPath, unggah, hapusBerkas } from '@/lib/storage';
import { siapkanGambar, aturanSlot } from '@/lib/image-rules';

const BUCKET = 'site-photos';

export type FotoState = { error?: string; ok?: string };

function segarkan() {
  revalidatePath('/');
  revalidatePath('/admin/foto');
}

export async function unggahFoto(_prev: FotoState, fd: FormData): Promise<FotoState> {
  await requireAdmin();

  const key = String(fd.get('key') ?? '');
  const file = fd.get('file') as File | null;
  if (!key) return { error: 'Slot tidak dikenal.' };
  if (!file) return { error: 'Tidak ada berkas yang dipilih.' };

  const salah = periksaBerkas(file);
  if (salah) return { error: salah };

  /* Tiap slot punya rasionya sendiri (lihat lib/image-rules.ts) — hero 3:2,
     gudang 2:1, panel industri 4:3, logo klien bebas. Diperiksa sebelum
     apa pun ditulis. */
  const gambar = await siapkanGambar(file, aturanSlot(key));
  if ('error' in gambar) return { error: gambar.error };

  const db = createAdminClient();
  const { data: baris } = await db
    .from('site_media').select('storage_path').eq('key', key).maybeSingle();
  if (!baris) return { error: `Slot "${key}" tidak ada.` };

  const path = buatPath(key, gambar.ext);
  const gagal = await unggah(BUCKET, path, gambar.buffer, gambar.contentType);
  if (gagal) return { error: `Gagal mengunggah: ${gagal}` };

  const { error } = await db.from('site_media').update({ storage_path: path }).eq('key', key);
  if (error) {
    /* Basis data gagal — buang berkas yang barusan naik supaya tidak jadi
       yatim yang tidak dirujuk apa pun. */
    await hapusBerkas(BUCKET, path);
    return { error: `Gagal menyimpan: ${error.message}` };
  }

  /* Foto lama dihapus setelah yang baru tercatat, bukan sebelumnya —
     kalau urutannya dibalik dan penyimpanan gagal, slotnya jadi kosong. */
  await hapusBerkas(BUCKET, baris.storage_path);

  segarkan();
  return { ok: `Foto diperbarui — disimpan ${gambar.lebar}\u00d7${gambar.tinggi} px.` };
}

export async function simpanAlt(_prev: FotoState, fd: FormData): Promise<FotoState> {
  await requireAdmin();

  const key = String(fd.get('key') ?? '');
  const alt = String(fd.get('alt') ?? '').trim();
  if (!key) return { error: 'Slot tidak dikenal.' };

  const db = createAdminClient();
  const { error } = await db.from('site_media').update({ alt }).eq('key', key);
  if (error) return { error: `Gagal menyimpan: ${error.message}` };

  segarkan();
  return { ok: 'Teks alternatif disimpan.' };
}

export async function hapusFoto(_prev: FotoState, fd: FormData): Promise<FotoState> {
  await requireAdmin();

  const key = String(fd.get('key') ?? '');
  if (!key) return { error: 'Slot tidak dikenal.' };

  const db = createAdminClient();
  const { data: baris } = await db
    .from('site_media').select('storage_path').eq('key', key).maybeSingle();

  const { error } = await db.from('site_media').update({ storage_path: null }).eq('key', key);
  if (error) return { error: `Gagal menghapus: ${error.message}` };

  await hapusBerkas(BUCKET, baris?.storage_path);

  segarkan();
  return { ok: 'Foto dilepas — kembali ke gambar cadangan.' };
}
