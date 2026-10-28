'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-guard';
import { bacaFormBerita } from '@/lib/berita-form';
import { periksaBerkas, buatPath, unggah, hapusBerkas } from '@/lib/storage';
import { siapkanGambar, bacaPotong } from '@/lib/image-rules';
import { ATURAN_BERITA } from '@/lib/image-specs';

/* ============================================================================
   CRUD berita + kontak media. Pola gabungan /admin/blog (formulir panjang,
   slug, satu unggulan) dan /admin/industri (foto lewat siapkanGambar).
   ========================================================================= */

const BUCKET = 'site-photos';

export type BeritaState = { error?: string; ok?: string };

/* 'layout' → /berita DAN setiap /berita/<slug> ikut disegarkan. */
function segarkan() {
  revalidatePath('/berita', 'layout');
  revalidatePath('/admin/berita');
}

function galatTabel(kode?: string): string | null {
  return kode === 'PGRST205' || kode === '42P01'
    ? 'Tabel berita belum ada. Jalankan dulu supabase/migrations/0009_berita.sql ' +
      'di SQL editor Supabase, lalu muat ulang halaman ini.'
    : null;
}

/** Path di bucket milik unggahan admin; path "/img/…" adalah foto stok contoh. */
const milikBucket = (p: string | null | undefined) => !!p && !p.startsWith('/');

async function unggahFotoBerita(fd: FormData, slug: string) {
  const file = fd.get('file') as File | null;
  if (!file || file.size === 0) return null;

  const salah = periksaBerkas(file);
  if (salah) return { error: salah };

  const gambar = await siapkanGambar(file, ATURAN_BERITA, bacaPotong(fd));
  if ('error' in gambar) return { error: gambar.error };

  const path = buatPath(`berita-${slug}`, gambar.ext);
  const gagal = await unggah(BUCKET, path, gambar.buffer, gambar.contentType);
  if (gagal) return { error: `Gagal mengunggah foto: ${gagal}` };
  return { path };
}

/* Hanya boleh satu unggulan (indeks unik di basis data). Unggulan lama
   diturunkan dulu supaya penyimpanan tidak gagal dengan pesan Postgres. */
async function turunkanUnggulanLain(slug: string) {
  const db = createAdminClient();
  await db.from('news').update({ unggulan: false }).eq('unggulan', true).neq('slug', slug);
}

export async function simpanBerita(_prev: BeritaState, fd: FormData): Promise<BeritaState> {
  await requireAdmin();

  const parsed = bacaFormBerita(fd);
  if ('error' in parsed) return { error: parsed.error };
  const { row } = parsed;

  const foto = await unggahFotoBerita(fd, row.slug);
  if (foto && 'error' in foto) return { error: foto.error };

  const db = createAdminClient();
  const { data: lama } = await db.from('news').select('storage_path').eq('slug', row.slug).maybeSingle();

  if (row.unggulan) await turunkanUnggulanLain(row.slug);

  const buangFoto = fd.get('buang_foto') === 'on';
  const ubahFoto = foto ? { storage_path: foto.path } : buangFoto ? { storage_path: null } : {};

  /* Disimpan dari backoffice = sudah ditinjau manusia → bukan contoh lagi. */
  const { error, count } = await db
    .from('news')
    .update({ ...row, ...ubahFoto, contoh: false }, { count: 'exact' })
    .eq('slug', row.slug);

  if (error || count === 0) {
    if (foto) await hapusBerkas(BUCKET, foto.path);
    if (error) return { error: galatTabel(error.code) ?? `Gagal menyimpan: ${error.message}` };
    return { error: `Berita "${row.slug}" tidak ditemukan.` };
  }

  if ('storage_path' in ubahFoto && milikBucket(lama?.storage_path)) {
    await hapusBerkas(BUCKET, lama!.storage_path);
  }

  segarkan();
  return { ok: foto ? 'Tersimpan, foto diperbarui.' : 'Tersimpan.' };
}

export async function buatBerita(_prev: BeritaState, fd: FormData): Promise<BeritaState> {
  await requireAdmin();

  const parsed = bacaFormBerita(fd);
  if ('error' in parsed) return { error: parsed.error };
  const { row } = parsed;

  const db = createAdminClient();
  const { data: ada, error: galatCek } = await db.from('news').select('slug').eq('slug', row.slug).maybeSingle();
  if (galatCek) return { error: galatTabel(galatCek.code) ?? `Gagal memeriksa slug: ${galatCek.message}` };
  if (ada) return { error: `Slug "${row.slug}" sudah dipakai berita lain.` };

  const foto = await unggahFotoBerita(fd, row.slug);
  if (foto && 'error' in foto) return { error: foto.error };

  if (row.unggulan) await turunkanUnggulanLain(row.slug);

  const { error } = await db.from('news').insert({ ...row, storage_path: foto?.path ?? null });
  if (error) {
    if (foto) await hapusBerkas(BUCKET, foto.path);
    return { error: galatTabel(error.code) ?? `Gagal membuat: ${error.message}` };
  }

  segarkan();
  redirect(`/admin/berita/${row.slug}?baru=1`);
}

export async function hapusBerita(fd: FormData): Promise<void> {
  await requireAdmin();

  const slug = String(fd.get('slug') ?? '');
  if (!slug) return;

  const db = createAdminClient();
  const { data } = await db.from('news').select('storage_path').eq('slug', slug).maybeSingle();
  await db.from('news').delete().eq('slug', slug);
  if (milikBucket(data?.storage_path)) await hapusBerkas(BUCKET, data!.storage_path);

  segarkan();
  redirect('/admin/berita');
}

/* ---- kontak media ---- */

function bacaKontak(fd: FormData) {
  const s = (k: string) => String(fd.get(k) ?? '').trim();
  return { nama: s('nama'), peran: s('peran'), surel: s('surel'), telepon: s('telepon'), urutan: Number(fd.get('urutan') ?? 0) };
}

export async function simpanKontak(_prev: BeritaState, fd: FormData): Promise<BeritaState> {
  await requireAdmin();
  const id = String(fd.get('id') ?? '');
  const k = bacaKontak(fd);
  if (!id) return { error: 'Kontak tidak dikenal.' };
  if (!k.nama) return { error: 'Nama wajib diisi.' };
  if (!k.surel) return { error: 'Email wajib diisi — kartunya membuka email ke alamat ini.' };
  if (!Number.isFinite(k.urutan)) return { error: 'Urutan harus berupa angka.' };

  const db = createAdminClient();
  const { error } = await db.from('press_contacts').update(k).eq('id', id);
  if (error) return { error: galatTabel(error.code) ?? `Gagal menyimpan: ${error.message}` };

  segarkan();
  return { ok: 'Tersimpan.' };
}

export async function buatKontak(_prev: BeritaState, fd: FormData): Promise<BeritaState> {
  await requireAdmin();
  const k = bacaKontak(fd);
  if (!k.nama) return { error: 'Nama wajib diisi.' };
  if (!k.surel) return { error: 'Email wajib diisi — kartunya membuka email ke alamat ini.' };

  const db = createAdminClient();
  const { data: akhir } = await db
    .from('press_contacts').select('urutan').order('urutan', { ascending: false }).limit(1).maybeSingle();
  const { error } = await db.from('press_contacts').insert({ ...k, urutan: (akhir?.urutan ?? 0) + 1 });
  if (error) return { error: galatTabel(error.code) ?? `Gagal menambah: ${error.message}` };

  segarkan();
  return { ok: `${k.nama} ditambahkan.` };
}

export async function hapusKontak(_prev: BeritaState, fd: FormData): Promise<BeritaState> {
  await requireAdmin();
  const id = String(fd.get('id') ?? '');
  if (!id) return { error: 'Kontak tidak dikenal.' };

  const db = createAdminClient();
  const { error } = await db.from('press_contacts').delete().eq('id', id);
  if (error) return { error: galatTabel(error.code) ?? `Gagal menghapus: ${error.message}` };

  segarkan();
  return { ok: 'Kontak dihapus.' };
}
