import { createBrowserClient } from '@supabase/ssr';

/* Klien untuk komponen client. Memakai kunci publik — aksesnya dibatasi RLS,
   jadi aman terkirim ke browser. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
