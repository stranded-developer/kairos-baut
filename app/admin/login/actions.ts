'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, COOKIE_OPTIONS, checkPassword, createSessionValue } from '@/lib/admin-auth';

/* ---------------------------------------------------------------------------
   Pembatas percobaan — menahan tebakan beruntun terhadap satu sandi bersama.
   Disimpan di memori proses: cukup untuk satu instance, dan hilang saat
   restart. Kalau nanti jalan di banyak instance dan ini terasa kurang,
   pindahkan hitungannya ke tabel Supabase.
   --------------------------------------------------------------------------- */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000; // 10 menit

const attempts = new Map<string, { count: number; first: number }>();

function rateLimit(ip: string): { ok: boolean; left: number } {
  const now = Date.now();
  const rec = attempts.get(ip);

  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
    return { ok: true, left: MAX_ATTEMPTS - 1 };
  }
  rec.count += 1;
  if (rec.count > MAX_ATTEMPTS) return { ok: false, left: 0 };
  return { ok: true, left: MAX_ATTEMPTS - rec.count };
}

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? 'local').split(',')[0].trim();

  const { ok, left } = rateLimit(ip);
  if (!ok) {
    return { error: 'Terlalu banyak percobaan. Coba lagi dalam 10 menit.' };
  }

  const password = String(formData.get('password') ?? '');
  if (!checkPassword(password)) {
    return {
      error: left > 0 ? `Kata sandi salah. Sisa ${left} percobaan.` : 'Kata sandi salah.',
    };
  }

  /* Berhasil — hapus hitungan percobaan untuk IP ini. */
  attempts.delete(ip);

  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSessionValue(), COOKIE_OPTIONS);

  const next = String(formData.get('next') ?? '');
  /* Hanya menerima path internal — mencegah open redirect. */
  const target = next.startsWith('/') && !next.startsWith('//') ? next : '/admin';
  redirect(target);
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect('/admin/login');
}
