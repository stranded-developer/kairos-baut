/* ============================================================================
   Gerbang kata sandi untuk /admin.

   Berkas ini TIDAK ditandai `server-only` karena middleware ikut memakainya,
   dan middleware berjalan di luar bundle server Node. Itu aman: ADMIN_PASSWORD
   dan ADMIN_SESSION_SECRET tidak berawalan NEXT_PUBLIC_, jadi Next tidak
   pernah menyertakannya ke bundle browser. Kalau ada komponen client yang
   nekat mengimpor berkas ini, nilainya undefined dan fungsinya melempar —
   bukan membocorkan sandi.

   Satu kata sandi bersama, bukan akun per orang. Konsekuensinya disadari:
   tidak ada jejak siapa mengubah apa, dan mencabut akses satu orang berarti
   mengganti sandi untuk semua. Dipilih user pada 2026-09-07.

   Yang tetap dijaga:
     · Sandi TIDAK PERNAH dikirim ke browser — hanya dibandingkan di server.
     · Cookie sesi ditandatangani HMAC-SHA256, jadi tidak bisa dipalsukan.
       Isinya cuma waktu kedaluwarsa; tidak memuat sandi.
     · Perbandingan sandi memakai waktu tetap, supaya lama proses tidak
       membocorkan berapa banyak karakter awal yang benar.
     · Mengganti ADMIN_SESSION_SECRET mematikan semua sesi yang berjalan.
   ========================================================================= */

export const ADMIN_COOKIE = 'kairos_admin';
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 jam

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET belum diset');
  return s;
}

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return b64url(sig);
}

/** Perbandingan waktu tetap — tidak keluar lebih awal saat karakter berbeda. */
function timingSafeEqual(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  /* Panjang berbeda tetap diproses supaya lamanya tidak membocorkan panjang. */
  let diff = ab.length ^ bb.length;
  const n = Math.max(ab.length, bb.length);
  for (let i = 0; i < n; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('ADMIN_PASSWORD belum diset');
  return timingSafeEqual(input, expected);
}

/** Nilai cookie: "<kedaluwarsa-epoch>.<tanda-tangan>" */
export async function createSessionValue(): Promise<string> {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS);
  return `${exp}.${await sign(exp)}`;
}

export async function verifySessionValue(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const dot = value.lastIndexOf('.');
  if (dot < 1) return false;

  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;

  return timingSafeEqual(sig, await sign(exp));
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE_SECONDS,
};
