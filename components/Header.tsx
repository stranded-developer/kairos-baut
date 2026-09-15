import Link from 'next/link';
import Logo from './Logo';

export type NavKey = 'produk' | 'industri' | 'berita' | 'blog' | 'tentang' | null;

/* `home` menentukan ke mana jangkar #kontak menunjuk: di beranda cukup hash,
   di halaman lain harus lewat "/" dulu. Industri dan Tentang Kami dulu juga
   jangkar beranda — keduanya sekarang halaman sendiri (/industri, /tentang),
   jadi tinggal #kontak yang tersisa.
   `current` memasang aria-current="page" — ditandai garis hijau oleh
   tampilan E (lihat kairos.css, blok TAMPILAN E). */
export default function Header({ home = false, current = null }: { home?: boolean; current?: NavKey }) {
  const kontak = home ? '#kontak' : '/#kontak';
  const mark = (k: NavKey) => (current === k ? { 'aria-current': 'page' as const } : {});

  const links = (btnClass: string) => (
    <>
      <Link href="/produk" {...mark('produk')}>
        Produk
      </Link>
      <Link href="/industri" {...mark('industri')}>
        Industri
      </Link>
      <Link href="/berita" {...mark('berita')}>
        Berita
      </Link>
      <Link href="/blog" {...mark('blog')}>
        Blog
      </Link>
      <Link href="/tentang" {...mark('tentang')}>
        Tentang Kami
      </Link>
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
