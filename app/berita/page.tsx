import type { Metadata } from 'next';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { BERITA, SARING, KONTAK_MEDIA } from '@/lib/data/news';
import './berita.css';

export const metadata: Metadata = {
  title: 'Berita — Kairos Baut',
  description: 'Kabar, kegiatan, dan siaran pers PT Kairos Multi Sejahtera.',
};

/* Halaman Berita. Rancangan "Papan Berita" — dipilih user 2026-09-09 dari
   tiga alternatif; dua lainnya sudah dihapus.

   Paling ramah foto: rujukan ASML nyaris tanpa gambar, tapi catatan klien di
   notes2.pdf minta "add some more images". Kosakata kartunya meminjam dari
   /blog supaya Berita dan Blog terasa satu keluarga. */
export default function BeritaPage() {
  const [utama, ...sisa] = BERITA;
  const samping = sisa.slice(0, 2);
  const mosaik = sisa.slice(2);

  return (
    <Shell current="berita">
      <div className="brt brt-papan">
        <section className="phead">
          <div className="wrap">
            <p className="crumbs">
              <Link href="/">Beranda</Link> / Berita
            </p>
            <h1>Kabar dari gudang.</h1>
            <p className="lede">
              Apa yang sedang terjadi di Kairos Baut — gudang baru, lini produk baru, pameran,
              dan pengumuman resmi.
            </p>
          </div>
        </section>

        <section className="sec sec--tight">
          <div className="wrap">
            <div className="board">
              <a
                className="hero-news"
                href="#"
                style={utama.foto ? { backgroundImage: `url('${utama.foto}')` } : undefined}
              >
                <div className="txt">
                  <p className="meta">
                    <time dateTime={utama.iso}>{utama.tanggal}</time>
                    <s>{utama.kategori}</s>
                  </p>
                  <h2>{utama.judul}</h2>
                  <p>{utama.ringkas}</p>
                </div>
              </a>
              <div className="side">
                {samping.map((b) => (
                  <a className="post" key={b.slug} href="#">
                    <div
                      className="art"
                      style={b.foto ? { backgroundImage: `url('${b.foto}')` } : undefined}
                    />
                    <div className="txt">
                      <p className="meta">
                        <time dateTime={b.iso}>{b.tanggal}</time>
                      </p>
                      <h3>{b.judul}</h3>
                      <span className="go">
                        Baca <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="sec sec--off">
          <div className="wrap">
            <div className="sechead row">
              <div>
                <p className="eyebrow">Arsip</p>
                <h2>Semua kabar.</h2>
              </div>
              <a className="textlink" href="#">
                Lihat menurut tahun <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="tabs">
              {SARING.map((s, i) => (
                <a className="tab" key={s} href="#" {...(i === 0 ? { 'aria-current': 'true' as const } : {})}>
                  {s}
                </a>
              ))}
            </div>

            <div className="mosaic">
              {mosaik.map((b) => (
                <a className="post" key={b.slug} href="#">
                  <div
                    className="art"
                    style={b.foto ? { backgroundImage: `url('${b.foto}')` } : undefined}
                  />
                  <div className="txt">
                    <p className="meta">
                      <time dateTime={b.iso}>{b.tanggal}</time>
                      <s>{b.kategori}</s>
                    </p>
                    <h3>{b.judul}</h3>
                    <p>{b.ringkas}</p>
                    <span className="go">
                      Baca <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div style={{ marginTop: 'clamp(28px,4vw,42px)', textAlign: 'center' }}>
              <a className="btn btn--ghost" href="#">
                Muat kabar lainnya
              </a>
            </div>
          </div>
        </section>

        <section className="sec sec--dark">
          <div className="wrap">
            <div className="sechead">
              <p className="eyebrow">Untuk redaksi</p>
              <h2>Untuk media.</h2>
              <p className="lede">
                Permintaan wawancara, data, atau foto beresolusi tinggi — hubungi langsung,
                jangan lewat sentral.
              </p>
            </div>
            <div className="press">
              {KONTAK_MEDIA.map((k) => (
                <a key={k.nama} href={`mailto:${k.surel}`}>
                  <h3>{k.nama}</h3>
                  <p>
                    {k.peran}
                    <br />
                    {k.surel}
                    {k.telepon && (
                      <>
                        <br />
                        {k.telepon}
                      </>
                    )}
                  </p>
                  <i aria-hidden="true" />
                </a>
              ))}
              <a href="#">
                <h3>Berkas foto</h3>
                <p>Logo, foto gudang, dan foto produk resolusi tinggi — satu arsip, siap unduh.</p>
                <i aria-hidden="true" />
              </a>
              <a href="#">
                <h3>Berlangganan</h3>
                <p>Satu surel tiap ada pengumuman resmi. Tanpa promosi.</p>
                <i aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
