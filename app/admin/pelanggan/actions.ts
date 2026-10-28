'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-guard';
import { periksaBerkas, buatPath, unggah, hapusBerkas } from '@/lib/storage';
import { siapkanGambar } from '@/lib/image-rules';
import { ATURAN_LOGO } from '@/lib/image-specs';

/* ============================================================================
   CRUD pelanggan untuk marquee beranda. Pola sama dengan /admin/industri:
   baris boleh ditambah, diurutkan, disembunyikan, dan dihapus.

   Logo lewat siapkanGambar() yang sama dengan unggahan lain. Rasionya bebas
   dan tidak dipotong (ATURAN_LOGO) — wordmark lebarnya berbeda-beda. SVG
   dilewatkan apa adanya.
   ========================================================================= */

const BUCKET = 'site-photos';

export type PelangganState = { error?: string; ok?: string };

function segarkan() {
  revalidatePath('/');
  revalidatePath('/admin/pelanggan');
}

/** Tabel belum ada = migrasi 0006 belum dijalankan. */
function galatTabel(kode?: string): string | null {
  return kode === 'PGRST205' || kode === '42P01'
    ? 'Tabel clients belum ada. Jalankan dulu supabase/migrations/0006_pelanggan.sql ' +
      'di SQL editor Supabase, lalu muat ulang halaman ini.'
    : null;
}

/** Mengunggah logo kalau ada berkasnya. null = tidak ada berkas. */
async function unggahLogo(fd: FormData): Promise<{ path: string } | { error: string } | null> {
  const file = fd.get('file') as File | null;
  if (!file || file.size === 0) return null;

  const salah = periksaBerkas(file);
  if (salah) return { error: salah };

  /* Rasio bebas → bidang potong tidak dipakai. */
  const gambar = await siapkanGambar(file, ATURAN_LOGO, null);
  if ('error' in gambar) return { error: gambar.error };

  const path = buatPath('pelanggan', gambar.ext);
  const gagal = await unggah(BUCKET, path, gambar.buffer, gambar.contentType);
  if (gagal) return { error: `Gagal mengunggah logo: ${gagal}` };
  return { path };
}

export async function buatPelanggan(_prev: PelangganState, fd: FormData): Promise<PelangganState> {
  await requireAdmin();

  const nama = String(fd.get('nama') ?? '').trim();
  if (!nama) return { error: 'Nama perusahaan tidak boleh kosong.' };

  const logo = await unggahLogo(fd);
  if (logo && 'error' in logo) return { error: logo.error };

  const db = createAdminClient();
  const { data: akhir } = await db
    .from('clients').select('urutan').order('urutan', { ascending: false }).limit(1).maybeSingle();

  /* Langsung terbit: tanpa logo pun namanya sudah tampil rapi sebagai teks,
     jadi tidak ada keadaan "setengah jadi" yang perlu disembunyikan. */
  const { error } = await db.from('clients').insert({
    nama,
    storage_path: logo?.path ?? null,
    urutan: (akhir?.urutan ?? 0) + 1,
    published: true,
  });

  if (error) {
    if (logo) await hapusBerkas(BUCKET, logo.path);
    return { error: galatTabel(error.code) ?? `Gagal menambah: ${error.message}` };
  }

  segarkan();
  return { ok: `"${nama}" ditambahkan ke pita pelanggan.` };
}

export async function simpanPelanggan(_prev: PelangganState, fd: FormData): Promise<PelangganState> {
  await requireAdmin();

  const id = String(fd.get('id') ?? '').trim();
  const nama = String(fd.get('nama') ?? '').trim();
  const urutan = Number(fd.get('urutan') ?? 0);
  const published = fd.get('published') === 'on';
  const buangLogo = fd.get('buang_logo') === 'on';

  if (!id) return { error: 'Pelanggan tidak dikenal.' };
  if (!nama) return { error: 'Nama perusahaan tidak boleh kosong.' };
  if (!Number.isFinite(urutan)) return { error: 'Urutan harus berupa angka.' };

  const logo = await unggahLogo(fd);
  if (logo && 'error' in logo) return { error: logo.error };

  const db = createAdminClient();
  const { data: lama } = await db.from('clients').select('storage_path').eq('id', id).maybeSingle();

  /* Logo baru menang atas "hapus logo" kalau dua-duanya dipilih. */
  const ubahLogo = logo ? { storage_path: logo.path } : buangLogo ? { storage_path: null } : {};

  const { error } = await db
    .from('clients')
    .update({ nama, urutan, published, ...ubahLogo })
    .eq('id', id);

  if (error) {
    if (logo) await hapusBerkas(BUCKET, logo.path);
    return { error: galatTabel(error.code) ?? `Gagal menyimpan: ${error.message}` };
  }

  /* Berkas lama dibuang setelah perubahan tercatat, bukan sebelumnya. */
  if ('storage_path' in ubahLogo && lama?.storage_path) await hapusBerkas(BUCKET, lama.storage_path);

  segarkan();
  return { ok: logo ? 'Tersimpan, logo diperbarui.' : buangLogo ? 'Tersimpan, logo dihapus.' : 'Tersimpan.' };
}

export async function hapusPelanggan(_prev: PelangganState, fd: FormData): Promise<PelangganState> {
  await requireAdmin();

  const id = String(fd.get('id') ?? '').trim();
  if (!id) return { error: 'Pelanggan tidak dikenal.' };

  const db = createAdminClient();
  const { data: baris } = await db.from('clients').select('storage_path').eq('id', id).maybeSingle();

  const { error } = await db.from('clients').delete().eq('id', id);
  if (error) return { error: galatTabel(error.code) ?? `Gagal menghapus: ${error.message}` };

  await hapusBerkas(BUCKET, baris?.storage_path);

  segarkan();
  return { ok: 'Pelanggan dihapus.' };
}
