import type { Metadata } from 'next';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Switch from '../Switch';
import { KATEGORI, BERITA, TAHUN, KONTAK_MEDIA } from '@/lib/data/news';
import '../berita.css';

export const metadata: Metadata = {
  title: 'Berita — Ruang Berita (rancangan 1)',
  description: 'Siaran pers, kegiatan, dan kabar perusahaan PT Kairos Multi Sejahtera.',
};

/* RANCANGAN 1 — "Ruang Berita". Paling dekat ke rujukan mockups/standalone/
   img/news.mov: garis kolom vertikal, hub empat kolom bergaris aksen, pita
   satu tombol, dan kartu putih di atas pita hijau tua. */
export default function BeritaRuang() {
  const terbaru = BERITA.slice(0, 3);

  return (
    <Shell current="berita">
      <div className="brt brt-ruang">
        <Switch current="ruang" />

        <section className="phead rules">
          <div className="wrap">
            <p className="crumbs">
              <Link href="/">Beranda</Link> / <Link href="/berita">Berita</Link> / Ruang Berita
            </p>
            <h1>Berita.</h1>
            <p className="lede">
              Siaran pers, kabar pengiriman, dan kegiatan PT Kairos Multi Sejahtera — lengkap
              dengan tautan ke berkas foto dan kontak media kami.
            </p>
          </div>
        </section>

        <section className="sec sec--tight rules">
          <div className="wrap">
            <div className="hub">
              {KATEGORI.map((k) => (
                <a key={k.slug} href="#terbaru">
                  <h3>{k.nama}</h3>
                  <p>{k.ket}</p>
                  <i aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="band">
          <div className="wrap">
            <p>Kabar langsung ke meja Anda</p>
            <a className="btn" href="#">
              Berlangganan kabar Kairos <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section className="sec sec--dark" id="terbaru">
          <div className="wrap">
            <div className="latest">
              <h2>
                Siaran pers
                <br />
                terbaru
              </h2>
              <div>
                <div className="prs">
                  {terbaru.map((b) => (
                    <a className="pr" key={b.slug} href="#">
                      <time dateTime={b.iso}>{b.tanggal}</time>
                      <h3>{b.judul}</h3>
                      <i aria-hidden="true" />
                    </a>
                  ))}
                </div>
                <div className="years">
                  {TAHUN.map((t) => (
                    <a className="year" key={t} href="#">
                      {t}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec sec--off rules" id="kontak-media">
          <div className="wrap">
            <div className="sechead">
              <p className="eyebrow">Untuk redaksi</p>
              <h2>Kontak media.</h2>
              <p className="lede">
                Untuk permintaan wawancara, data, atau foto beresolusi tinggi — hubungi
                langsung, jangan lewat sentral.
              </p>
            </div>
            <div className="hub">
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
                <p>Logo, foto gudang, dan foto produk — satu arsip, siap unduh.</p>
                <i aria-hidden="true" />
              </a>
              <a href="/#kontak">
                <h3>Bukan wartawan?</h3>
                <p>Untuk harga dan ketersediaan barang, lewat formulir penawaran.</p>
                <i aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
