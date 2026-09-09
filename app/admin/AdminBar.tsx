import Link from 'next/link';
import Logo from '@/components/Logo';
import { logout } from './login/actions';

export default function AdminBar({ current }: { current?: string }) {
  const mark = (k: string) => (current === k ? { 'aria-current': 'page' as const } : {});
  return (
    <div className="adm-bar">
      <div className="adm-bar-in">
        <Logo />
        <nav>
          <Link href="/admin" {...mark('beranda')}>Ringkasan</Link>
          <Link href="/admin/produk" {...mark('produk')}>Produk</Link>
          <Link href="/admin/foto" {...mark('foto')}>Foto situs</Link>
          <Link href="/admin/blog" {...mark('blog')}>Blog</Link>
          <Link href="/admin/tentang" {...mark('tentang')}>Tentang Kami</Link>
          <Link href="/" target="_blank">Lihat situs ↗</Link>
        </nav>
        <form action={logout}>
          <button type="submit">Keluar</button>
        </form>
      </div>
    </div>
  );
}
