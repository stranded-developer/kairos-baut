import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifySessionValue } from '@/lib/admin-auth';

/* Semua /admin/* dijaga kecuali halaman masuk itu sendiri. Cookie yang tidak
   sah atau kedaluwarsa dianggap belum masuk. */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/admin/login') return NextResponse.next();

  const ok = await verifySessionValue(request.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/admin/login';
  /* Ingat tujuan semula supaya setelah masuk langsung diantar ke sana. */
  url.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname + search)}`;

  const res = NextResponse.redirect(url);
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}

export const config = { matcher: ['/admin/:path*'] };
