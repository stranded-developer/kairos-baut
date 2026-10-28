import Link from 'next/link';
import { Fragment } from 'react';
import Logo from './Logo';
import { getSettings } from '@/lib/queries';
import { baris, telHref } from '@/lib/data/settings';

/* Baris alamat/jam dipisah <br>, persis seperti sebelum isinya pindah ke
   site_settings. */
function Baris({ teks }: { teks: string }) {
  return baris(teks).map((b, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {b}
    </Fragment>
  ));
}

export default async function Footer() {
  const s = await getSettings();

  return (
    <footer>
      <div className="wrap">
        <div className="fg">
          <div>
            <Logo />
            <p style={{ marginTop: 15, maxWidth: '32ch' }}>{s.tagline_kaki}</p>
            <nav aria-label="Tautan halaman" style={{ marginTop: 16 }}>
              <Link href="/produk">Indeks produk</Link>
              <Link href="/industri">Industri &amp; proyek</Link>
              <Link href="/tentang">Tentang Kami</Link>
              <Link href="/berita">Berita</Link>
              <Link href="/blog">Blog</Link>
              <a href="/#kontak">Minta penawaran</a>
            </nav>
          </div>
          <div>
            <h4>{s.judul_kantor}</h4>
            <p>
              <Baris teks={s.alamat_kantor} />
            </p>
            {s.telepon_kantor && (
              <p>
                <a href={telHref(s.telepon_kantor)}>{s.telepon_kantor}</a>
              </p>
            )}
          </div>
          <div>
            <h4>{s.judul_workshop}</h4>
            <p>
              <Baris teks={s.alamat_workshop} />
            </p>
            {s.telepon_workshop && (
              <p>
                <a href={telHref(s.telepon_workshop)}>{s.telepon_workshop}</a>
              </p>
            )}
          </div>
          <div>
            <h4>{s.judul_jam}</h4>
            <p>
              <Baris teks={s.jam_kerja} />
            </p>
            {s.email && (
              <p>
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </p>
            )}
          </div>
        </div>
        <div className="fb">
          <span>{s.hak_cipta}</span>
          {s.catatan_kaki && <span>{s.catatan_kaki}</span>}
        </div>
      </div>
    </footer>
  );
}
