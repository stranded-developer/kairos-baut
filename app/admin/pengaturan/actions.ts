'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-guard';
import { rapikanWa } from '@/lib/data/settings';
import { FONT } from '@/lib/data/home';

/* ============================================================================
   Penyimpanan pengaturan situs — satu kelompok (Kontak / Kaki halaman) per
   kiriman. Nilai tiap kunci datang sebagai field `v:<kunci>`.
   ========================================================================= */

export type SetelanState = { error?: string; ok?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function simpanSetelan(
  _prev: SetelanState,
  fd: FormData
): Promise<SetelanState> {
  await requireAdmin();

  const keys = fd.getAll('key').map(String);
  if (keys.length === 0) return { error: 'Tidak ada yang dikirim.' };

  const nilai: Record<string, string> = {};
  for (const k of keys) {
    /* Baris kosong di tengah alamat dibuang, spasi pinggir dirapikan — supaya
       tidak muncul <br> berderet di kaki halaman. */
    nilai[k] = String(fd.get(`v:${k}`) ?? '')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .join('\n');
  }

  if ('wa' in nilai) {
    const wa = rapikanWa(nilai.wa);
    if (!wa) {
      return { error: 'Nomor WhatsApp tidak dikenali. Tulis seperti 0877 8408 5400 atau +62 877 8408 5400.' };
    }
    nilai.wa = wa;
  }
  if ('font' in nilai && !FONT.some((f) => f.id === nilai.font)) {
    return { error: 'Pasangan font tidak dikenal.' };
  }
  if (nilai.email && !EMAIL_RE.test(nilai.email)) {
    return { error: 'Alamat email tidak valid.' };
  }

  const db = createAdminClient();
  for (const [key, value] of Object.entries(nilai)) {
    const { error, count } = await db
      .from('site_settings')
      .update({ value }, { count: 'exact' })
      .eq('key', key);

    if (error) {
      /* Tabel belum ada = migrasi 0005 belum dijalankan. PostgREST
         melaporkannya sebagai PGRST205, Postgres mentah 42P01. */
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return {
          error:
            'Tabel site_settings belum ada. Jalankan dulu supabase/migrations/0005_pengaturan.sql ' +
            'di SQL editor Supabase, lalu muat ulang halaman ini.',
        };
      }
      return { error: `Gagal menyimpan "${key}": ${error.message}` };
    }
    if (count === 0) return { error: `Pengaturan "${key}" tidak ada di basis data.` };
  }

  /* Kontak tampil di kaki halaman SEMUA halaman, jadi seluruh situs
     disegarkan — bukan satu rute saja. */
  revalidatePath('/', 'layout');
  return { ok: 'Tersimpan.' };
}
