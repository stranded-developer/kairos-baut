import 'server-only';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifySessionValue } from './admin-auth';

/* ============================================================================
   Penjaga untuk setiap Server Action yang menulis.

   Middleware sudah menjaga rute /admin/*, tapi itu saja tidak cukup: Server
   Action adalah endpoint POST tersendiri yang bisa dipanggil siapa pun kalau
   ID aksinya diketahui. Karena itu setiap aksi yang mengubah data WAJIB
   memanggil requireAdmin() sendiri — pertahanan berlapis, bukan mengandalkan
   satu lapis saja.
   ========================================================================= */
export async function requireAdmin(): Promise<void> {
  const store = await cookies();
  const ok = await verifySessionValue(store.get(ADMIN_COOKIE)?.value);
  if (!ok) throw new Error('Tidak berwenang — sesi tidak sah atau sudah kedaluwarsa.');
}
