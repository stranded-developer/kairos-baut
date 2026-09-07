import 'server-only';
import { createAdminClient } from './supabase/admin';

/* ============================================================================
   Unggah & hapus berkas di Supabase Storage.

   Semua penulisan memakai kunci rahasia di server. Bucket-nya publik untuk
   dibaca, tapi tidak ada policy tulis sama sekali — jadi browser tidak punya
   jalur unggah langsung. Satu-satunya cara masuk adalah lewat Server Action
   yang sudah lolos gerbang kata sandi.
   ========================================================================= */

export const BATAS_BYTE = 10 * 1024 * 1024; // 10 MB, sama dengan batas bucket

export const MIME_DIIZINKAN = [
  'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml',
];

const EKSTENSI: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/avif': 'avif', 'image/svg+xml': 'svg',
};

export function periksaBerkas(file: File): string | null {
  if (!file || file.size === 0) return 'Tidak ada berkas yang dipilih.';
  if (!MIME_DIIZINKAN.includes(file.type))
    return `Format ${file.type || 'tidak dikenal'} tidak didukung. Pakai JPG, PNG, WebP, AVIF, atau SVG.`;
  if (file.size > BATAS_BYTE)
    return `Berkas ${(file.size / 1048576).toFixed(1)} MB — melebihi batas 10 MB.`;
  return null;
}

/* Nama berkas selalu baru (ada stempel waktu). Alasannya: CDN Supabase
   meng-cache berdasarkan URL, jadi menimpa nama yang sama akan tetap
   menampilkan foto lama sampai cache-nya kedaluwarsa. */
export function buatPath(prefix: string, file: File): string {
  const ext = EKSTENSI[file.type] ?? 'bin';
  const acak = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${acak}.${ext}`;
}

export async function unggah(bucket: string, path: string, file: File): Promise<string | null> {
  const db = createAdminClient();
  const { error } = await db.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000', // nama berkas unik, jadi aman di-cache lama
    upsert: false,
  });
  return error ? error.message : null;
}

/** Menghapus berkas lama. Kegagalan sengaja diabaikan — berkas yatim jauh
    lebih ringan akibatnya daripada menggagalkan penyimpanan yang sudah sah. */
export async function hapusBerkas(bucket: string, path: string | null | undefined): Promise<void> {
  if (!path) return;
  const db = createAdminClient();
  await db.storage.from(bucket).remove([path]);
}
