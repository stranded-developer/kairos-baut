import { createClient } from '@supabase/supabase-js';

/* ============================================================================
   Klien untuk halaman publik.

   Sengaja TIDAK memakai @supabase/ssr yang berbasis cookie: halaman publik
   tidak punya sesi, dan menyentuh cookie akan memaksa halaman jadi dinamis.
   Dengan klien polos ini halaman tetap bisa dirender statis lalu diperbarui
   berkala (revalidate), yang jauh lebih cepat untuk situs katalog.

   Memakai kunci publik, jadi RLS berlaku — hanya baca, dan hanya baris yang
   `published`.
   ========================================================================= */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/** URL publik sebuah berkas di bucket storage. */
export function storageUrl(bucket: string, path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
