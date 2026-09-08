import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="fg">
          <div>
            <Logo />
            <p style={{ marginTop: 15, maxWidth: '32ch' }}>
              PT Kairos Multi Sejahtera — distributor baut &amp; mur untuk industri Indonesia.
            </p>
            <nav aria-label="Tautan halaman" style={{ marginTop: 16 }}>
              <Link href="/produk">Indeks produk</Link>
              <Link href="/berita">Berita</Link>
              <Link href="/blog">Blog</Link>
              <a href="/#kontak">Minta penawaran</a>
            </nav>
          </div>
          <div>
            <h4>Kantor</h4>
            <p>
              Perkantoran Mega Sunter Blok B No. 32
              <br />
              Jl. Danau Sunter Selatan
              <br />
              Jakarta 14350
            </p>
            <p>
              <a href="tel:+62216500888">+62 21 6500 888</a>
            </p>
          </div>
          <div>
            <h4>Workshop</h4>
            <p>
              Kawasan Industri Jababeka 1 Blok C 17 A
              <br />
              Pasirgombong, Cikarang Utara
              <br />
              Bekasi 17530
            </p>
            <p>
              <a href="tel:+622189832622">+62 21 8983 2622</a>
            </p>
          </div>
          <div>
            <h4>Jam Kerja</h4>
            <p>
              Senin – Jumat 08.00 – 17.00
              <br />
              Sabtu 08.00 – 12.00
            </p>
            <p>
              <a href="mailto:marketing@kairosbaut.com">marketing@kairosbaut.com</a>
            </p>
          </div>
        </div>
        <div className="fb">
          <span>© 2026 PT Kairos Multi Sejahtera</span>
          <span>Mockup v5 — revisi catatan</span>
        </div>
      </div>
    </footer>
  );
}
