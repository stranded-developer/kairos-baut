import Link from 'next/link';
import Logo from './Logo';

export type NavKey = 'produk' | 'berita' | 'blog' | null;

/* `home` menentukan ke mana jangkar #industri / #tentang menunjuk: di beranda
   cukup hash, di halaman lain harus lewat "/" dulu.
   `current` memasang aria-current="page" — ditandai garis hijau oleh
   tampilan E (lihat kairos.css, blok TAMPILAN E). */
export default function Header({ home = false, current = null }: { home?: boolean; current?: NavKey }) {
  const industri = home ? '#industri' : '/#industri';
  const tentang = home ? '#tentang' : '/#tentang';
  const kontak = home ? '#kontak' : '/#kontak';
  const mark = (k: NavKey) => (current === k ? { 'aria-current': 'page' as const } : {});

  const links = (btnClass: string) => (
    <>
      <Link href="/produk" {...mark('produk')}>
        Produk
      </Link>
      <a href={industri}>Industri</a>
      <Link href="/berita" {...mark('berita')}>
        Berita
      </Link>
      <Link href="/blog" {...mark('blog')}>
        Blog
      </Link>
      <a href={tentang}>Tentang Kami</a>
      <a className={btnClass} href={kontak}>
        Minta Penawaran
      </a>
    </>
  );

  return (
    <header id="hdr">
      <div className="bar">
        <Logo ariaLabel="Kairos Baut — beranda" />
        <nav className="main">{links('btn btn--sm')}</nav>
        <button className="burger" id="burger" type="button" aria-expanded="false" aria-controls="mobnav">
          <i aria-hidden="true" />
          Menu
        </button>
      </div>
      <nav className="mobnav" id="mobnav" aria-label="Menu utama">
        {links('btn')}
      </nav>
    </header>
  );
}
