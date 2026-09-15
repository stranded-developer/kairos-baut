'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-guard';
import { periksaBerkas, buatPath, unggah, hapusBerkas } from '@/lib/storage';
import { siapkanGambar, bacaPotong } from '@/lib/image-rules';
import { ATURAN_PROYEK } from '@/lib/image-specs';

/* ============================================================================
   CRUD proyek untuk halaman /industri.

   Beda dengan about_blocks: di sini baris BOLEH ditambah dan dihapus — daftar
   proyek memang tumbuh. Karena itu ada `buatProyek` dan `hapusProyek`.

   Fotonya masuk bucket `site-photos` (bucket yang sudah ada), lewat
   `siapkanGambar` yang sama dengan unggahan lain — jadi pemotong, pemeriksaan
   ukuran, dan konversi WebP berlaku juga di sini.
   ========================================================================= */

const BUCKET = 'site-photos';

export type ProyekState = { error?: string; ok?: string };

function segarkan() {
  revalidatePath('/industri');
  revalidatePath('/admin/industri');
}

/** Tabel belum dibuat = migrasi 0003 belum dijalankan. Disebut terang-terangan. */
function galatTabel(kode?: string): string | null {
  return kode === '42P01'
    ? 'Tabel projects belum ada. Jalankan dulu supabase/migrations/0003_proyek.sql ' +
      'di SQL editor Supabase, lalu muat ulang halaman ini.'
    : null;
}

function bacaSlug(nama: string): string {
  return nama
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function simpanProyek(_prev: ProyekState, fd: FormData): Promise<ProyekState> {
  await requireAdmin();

  const slug = String(fd.get('slug') ?? '').trim();
  const nama = String(fd.get('nama') ?? '').trim();
  const sektor = String(fd.get('sektor') ?? '').trim();
  const ringkas = String(fd.get('ringkas') ?? '').trim();
  const alt = String(fd.get('alt') ?? '').trim();
  const lokasi = String(fd.get('lokasi') ?? '').trim();
  const tahun = String(fd.get('tahun') ?? '').trim();
  const klien = String(fd.get('klien') ?? '').trim();
  const lingkup = String(fd.get('lingkup') ?? '').trim();
  const body = String(fd.get('body') ?? '').trim();
  const urutan = Number(fd.get('urutan') ?? 0);
  const published = fd.get('published') === 'on';

  if (!slug) return { error: 'Proyek tidak dikenal.' };
  if (!nama) return { error: 'Nama proyek tidak boleh kosong.' };
  if (!sektor) return { error: 'Sektor tidak boleh kosong.' };
  if (!Number.isFinite(urutan)) return { error: 'Urutan harus berupa angka.' };

  const db = createAdminClient();

  /* Foto hanya disentuh kalau ada berkas baru — menyimpan teks saja tidak
     boleh menghapus foto yang sudah ada. */
  const file = fd.get('file') as File | null;
  let path: string | null = null;

  if (file && file.size > 0) {
    const salah = periksaBerkas(file);
    if (salah) return { error: salah };

    const gambar = await siapkanGambar(file, ATURAN_PROYEK, bacaPotong(fd));
    if ('error' in gambar) return { error: gambar.error };

    path = buatPath(`proyek-${slug}`, gambar.ext);
    const gagal = await unggah(BUCKET, path, gambar.buffer, gambar.contentType);
    if (gagal) return { error: `Gagal mengunggah: ${gagal}` };
  }

  const { data: lama } = await db
    .from('projects').select('storage_path').eq('slug', slug).maybeSingle();

  const dasar = {
    nama, sektor, ringkas, alt, urutan, published,
    ...(path ? { storage_path: path } : {}),
  };
  const rinci = { lokasi, tahun, klien, lingkup, body };

  let { error } = await db.from('projects').update({ ...dasar, ...rinci }).eq('slug', slug);

  /* Kolom rincian belum ada → migrasi 0004 belum dijalankan. Menyimpan tidak
     boleh ikut gagal gara-gara itu: kolom dasarnya dicoba lagi sendirian,
     supaya nama/sektor/foto tetap bisa disunting seperti sebelum 0004 ada.
     Yang gagal cuma kelima kolom rincian, dan itu dikatakan apa adanya.

     DUA KODE, bukan satu. Postgres mentah memakai 42703, tapi yang benar-
     benar sampai ke sini lewat PostgREST adalah **PGRST204** ("Could not
     find the 'body' column ... in the schema cache"). Ketahuan dari menjalankan
     tombol Simpan sungguhan — memeriksa 42703 saja tidak pernah kena. */
  let rinciGagal = false;
  if (error?.code === '42703' || error?.code === 'PGRST204') {
    rinciGagal = true;
    ({ error } = await db.from('projects').update(dasar).eq('slug', slug));
  }

  if (error) {
    if (path) await hapusBerkas(BUCKET, path);
    return { error: galatTabel(error.code) ?? `Gagal menyimpan: ${error.message}` };
  }

  /* Foto lama dibuang setelah yang baru tercatat, bukan sebelumnya. */
  if (path && lama?.storage_path) await hapusBerkas(BUCKET, lama.storage_path);

  segarkan();
  if (rinciGagal) {
    return {
      ok:
        'Tersimpan — tapi kolom rincian (lokasi, tahun, pemberi kerja, lingkup, uraian) ' +
        'belum ada di basis data. Jalankan supabase/migrations/0004_proyek_detail.sql ' +
        'di SQL editor Supabase supaya bagian itu ikut tersimpan.',
    };
  }
  return { ok: path ? 'Tersimpan, foto diperbarui.' : 'Tersimpan.' };
}

export async function buatProyek(_prev: ProyekState, fd: FormData): Promise<ProyekState> {
  await requireAdmin();

  const nama = String(fd.get('nama') ?? '').trim();
  const sektor = String(fd.get('sektor') ?? '').trim();
  if (!nama) return { error: 'Nama proyek tidak boleh kosong.' };
  if (!sektor) return { error: 'Sektor tidak boleh kosong.' };

  const slug = bacaSlug(nama);
  if (!slug) return { error: 'Nama itu tidak menghasilkan slug yang sah.' };

  const db = createAdminClient();

  const { data: bentrok } = await db
    .from('projects').select('slug').eq('slug', slug).maybeSingle();
  if (bentrok) return { error: `Sudah ada proyek dengan slug "${slug}".` };

  /* Proyek baru ditaruh di urutan paling belakang. */
  const { data: akhir } = await db
    .from('projects').select('urutan').order('urutan', { ascending: false }).limit(1).maybeSingle();

  const { error } = await db.from('projects').insert({
    slug, nama, sektor, ringkas: '', alt: '',
    urutan: (akhir?.urutan ?? 0) + 1,
    /* Belum ada foto — sengaja tidak terbit dulu supaya tidak muncul kosong
       di halaman publik sebelum admin sempat melengkapinya. */
    published: false,
  });

  if (error) return { error: galatTabel(error.code) ?? `Gagal membuat: ${error.message}` };

  segarkan();
  return { ok: `Proyek "${nama}" dibuat. Lengkapi fotonya, lalu centang Tampilkan.` };
}

export async function hapusProyek(_prev: ProyekState, fd: FormData): Promise<ProyekState> {
  await requireAdmin();

  const slug = String(fd.get('slug') ?? '').trim();
  if (!slug) return { error: 'Proyek tidak dikenal.' };

  const db = createAdminClient();
  const { data: baris } = await db
    .from('projects').select('storage_path').eq('slug', slug).maybeSingle();

  const { error } = await db.from('projects').delete().eq('slug', slug);
  if (error) return { error: galatTabel(error.code) ?? `Gagal menghapus: ${error.message}` };

  await hapusBerkas(BUCKET, baris?.storage_path);

  segarkan();
  return { ok: 'Proyek dihapus.' };
}
