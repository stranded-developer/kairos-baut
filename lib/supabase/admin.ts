import 'server-only';
import { createClient } from '@supabase/supabase-js';

/* ============================================================================
   Klien berkunci rahasia — MELEWATI RLS SEPENUHNYA.

   `server-only` di atas membuat build gagal kalau berkas ini sampai terimpor
   dari komponen client, jadi kuncinya tidak mungkin bocor ke browser karena
   impor yang keliru.

   Dipakai hanya untuk: seed, unggah berkas ke storage, dan pembacaan di
   backoffice yang perlu melihat baris belum terbit. Operasi tulis biasa dari
   backoffice tetap lewat createClient() supaya RLS ikut memeriksa.
   ========================================================================= */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY belum diset');

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
