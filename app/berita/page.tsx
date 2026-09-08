import type { Metadata } from 'next';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { RANCANGAN } from '@/lib/data/news';
import './berita.css';

export const metadata: Metadata = {
  title: 'Berita — Kairos Baut',
  description: 'Siaran pers, kegiatan, dan kabar perusahaan PT Kairos Multi Sejahtera.',
};

/* Halaman pemilih: tiga rancangan Berita berdampingan.

   SEMENTARA. Setelah satu dipilih, halaman ini diganti jadi halaman Berita
   yang sesungguhnya (isi rancangan yang menang dipindah ke sini), lalu
   /berita/ruang · /berita/kronik · /berita/papan dan Switch.tsx dihapus. */
export default function BeritaPilih() {
  return (
    <Shell current="berita">
      <div className="brt">
        <section className="phead">
          <div className="wrap">
            <p className="crumbs">
              <Link href="/">Beranda</Link> / Berita
            </p>
            <h1>Berita.</h1>
            <p className="lede">
              Tiga rancangan halaman Berita, semuanya memakai tema situs yang sekarang.
              Buka satu per satu, lalu pilih yang paling cocok — dua sisanya nanti dihapus.
            </p>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <div className="brt-pick">
              {RANCANGAN.map((r, i) => (
                <Link className="brt-card" key={r.slug} href={`/berita/${r.slug}`}>
                  <span className="no">Rancangan {i + 1}</span>
                  <h2>{r.nama}</h2>
                  <p className="ring">{r.ringkas}</p>
                  <p>{r.ide}</p>
                  <span className="go">
                    Lihat rancangan <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
