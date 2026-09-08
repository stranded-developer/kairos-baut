import type { Metadata } from 'next';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Switch from '../Switch';
import { BERITA, SARING, UTAMA_BUTIR } from '@/lib/data/news';
import '../berita.css';

export const metadata: Metadata = {
  title: 'Berita — Kronik (rancangan 2)',
  description: 'Catatan bertanggal: siaran pers, kegiatan, dan kabar PT Kairos Multi Sejahtera.',
};

/* RANCANGAN 2 — "Kronik". Tafsir paling ketat dari rujukan: berita sebagai
   daftar bertanggal, tanpa satu pun gambar. Tanggal jadi elemen desain. */
export default function BeritaKronik() {
  const [utama, ...sisa] = BERITA;

  /* Dikelompokkan per tahun dari kolom `iso` — bukan daftar terpisah, supaya
     menambah satu berita saja tidak perlu menyunting dua tempat. */
  const tahun = [...new Set(sisa.map((b) => b.iso.slice(0, 4)))];

  return (
    <Shell current="berita">
      <div className="brt brt-kronik">
        <Switch current="kronik" />

        <section className="phead">
          <div className="wrap">
            <p className="crumbs">
              <Link href="/">Beranda</Link> / <Link href="/berita">Berita</Link> / Kronik
            </p>
            <h1>Kronik.</h1>
            <p className="lede">
              Semua pengumuman resmi Kairos Baut, berurutan dari yang terbaru. Tanpa foto,
              tanpa basa-basi — tanggal, judul, dan intinya.
            </p>
          </div>
        </section>

        <div className="bar-filter">
          <div className="wrap">
            {SARING.map((s, i) => (
              <a className="chip" key={s} href="#" {...(i === 0 ? { 'aria-current': 'true' as const } : {})}>
                {s}
              </a>
            ))}
            <span className="count">{BERITA.length} catatan · 2025 – 2026</span>
          </div>
        </div>

        <section className="sec sec--tight">
          <div className="wrap">
            <article className="lead">
              <p className="dateline">
                {utama.kategori} — <b>Cikarang, {utama.tanggal}</b>
              </p>
              <h2>{utama.judul}</h2>
              <ul>
                {UTAMA_BUTIR.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <a className="textlink" href="#">
                Baca siaran pers lengkap <span aria-hidden="true">→</span>
              </a>
            </article>

            {tahun.map((th) => (
              <div key={th}>
                <div className="yr">
                  <h3>{th}</h3>
                  <span aria-hidden="true" />
                </div>
                {sisa
                  .filter((b) => b.iso.startsWith(th))
                  .map((b) => (
                    <a className="row" key={b.slug} href="#">
                      <time dateTime={b.iso}>{b.tanggal}</time>
                      <div>
                        <h4>{b.judul}</h4>
                        <p>{b.ringkas}</p>
                        <span className="tag">{b.kategori}</span>
                      </div>
                      <span className="go" aria-hidden="true">
                        →
                      </span>
                    </a>
                  ))}
              </div>
            ))}

            <div className="more">
              <a className="btn btn--ghost" href="#">
                Muat catatan lainnya
              </a>
            </div>
          </div>
        </section>

        <section className="sec sec--tight sec--off">
          <div className="wrap">
            <div className="alert-in">
              <div>
                <p className="eyebrow">Kabar Kairos</p>
                <h2>Dapat kabarnya lebih dulu.</h2>
                <p className="lede">
                  Satu surel tiap ada pengumuman resmi. Tidak ada penawaran, tidak ada promosi.
                </p>
              </div>
              <a className="btn" href="#">
                Berlangganan <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
