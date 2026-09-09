'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-guard';

/* ============================================================================
   Penyuntingan naskah halaman Tentang Kami.

   Fotonya TIDAK diurus di sini — memakai Server Action `unggahFoto` milik
   /admin/foto lewat komponen MediaCard, supaya seluruh jalur unggah yang
   sudah teruji (rasio, pemotongan, WebP, teks alternatif) dipakai ulang apa
   adanya, bukan ditulis dua kali.
   ========================================================================= */

export type TentangState = { error?: string; ok?: string };

export async function simpanBlok(
  _prev: TentangState,
  fd: FormData
): Promise<TentangState> {
  await requireAdmin();

  const key = String(fd.get('key') ?? '').trim();
  if (!key) return { error: 'Blok tidak dikenal.' };

  const heading = String(fd.get('heading') ?? '').trim();
  const body = String(fd.get('body') ?? '').trim();
  const caption = String(fd.get('caption') ?? '').trim();
  /* Checkbox yang tidak dicentang tidak ikut terkirim sama sekali, jadi
     ketiadaannya berarti false — bukan "tidak berubah". */
  const flip = fd.get('flip') === 'on';

  if (!heading && !body) {
    return { error: 'Judul dan isi tidak boleh dua-duanya kosong.' };
  }

  const db = createAdminClient();
  const { error, count } = await db
    .from('about_blocks')
    .update({ heading, body, caption, flip }, { count: 'exact' })
    .eq('key', key);

  if (error) {
    /* Tabel belum ada = migrasi 0002 belum dijalankan. Disebut terang-terangan
       supaya tidak terbaca sebagai kegagalan yang misterius. */
    if (error.code === '42P01') {
      return {
        error:
          'Tabel about_blocks belum ada. Jalankan dulu supabase/migrations/0002_tentang.sql ' +
          'di SQL editor Supabase, lalu muat ulang halaman ini.',
      };
    }
    return { error: `Gagal menyimpan: ${error.message}` };
  }

  if (count === 0) return { error: `Blok "${key}" tidak ada di basis data.` };

  revalidatePath('/tentang');
  revalidatePath('/admin/tentang');
  return { ok: 'Tersimpan.' };
}
