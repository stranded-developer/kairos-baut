import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/* Klien untuk Server Component / Server Action / route handler.
   Tetap memakai kunci publik, jadi RLS berlaku penuh dan identitas yang
   dipakai adalah pengguna yang sedang login (dari cookie). */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* Dipanggil dari Server Component — penyetelan cookie ditangani
               middleware. Aman diabaikan. */
          }
        },
      },
    }
  );
}
