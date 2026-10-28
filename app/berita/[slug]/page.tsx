import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Shell from '@/components/Shell';
import Naskah from '@/components/Naskah';
import UntukMedia from '../UntukMedia';
import { getBerita, getBeritaSatu } from '@/lib/queries';
import '../berita.css';

/* ============================================================================
   Halaman artikel berita — 2026-10-28.

   Susunannya mengikuti halaman detail ASML yang dicatat di log (Bagian 8):
   remah jejak → baris tanggal "KATEGORI — LOKASI, TANGGAL" → judul besar →
   ringkasan → isi → blok kontak media. Kosakatanya (phead, crumbs, meta,
   .post, .press) dipinjam dari halaman /berita supaya terasa satu keluarga;
   aturan barunya ada di berita.css, blok "ARTIKEL".
   ========================================================================= */

export const revalidate = 300;

/* Artikel yang ada saat build dirender statis; artikel baru dirender saat
   pertama dibuka lalu disimpan (dynamicParams bawaan = true). */
export async function generateStaticParams() {
  return (await getBerita()).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = await getBeritaSatu((await params).slug);
  if (!b) return { title: 'Berita tidak ditemukan — Kairos Baut' };
  return {
    title: `${b.judul} — Kairos Baut`,
    description: b.ringkas,
    openGraph: { title: b.judul, description: b.ringkas, ...(b.foto ? { images: [b.foto] } : {}) },
  };
}

export default async function ArtikelBerita({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [b, semua] = await Promise.all([getBeritaSatu(slug), getBerita()]);
  if (!b) notFound();

  /* Kabar lainnya: yang sekategori dulu, lalu yang terbaru. */
  const lain = [
    ...semua.filter((x) => x.slug !== b.slug && x.kategori === b.kategori),
    ...semua.filter((x) => x.slug !== b.slug && x.kategori !== b.kategori),
  ].slice(0, 3);

  return (
    <Shell current="berita">
      <div className="brt brt-papan brt-artikel">
        <section className="phead">
          <div className="wrap">
            <p className="crumbs">
              <Link href="/">Beranda</Link> / <Link href="/berita">Berita</Link> / {b.kategori}
            </p>
            <p className="meta">
              <s>{b.kategori}</s>
              <time dateTime={b.iso}>
                {b.lokasi ? `${b.lokasi}, ` : ''}
                {b.tanggal}
              </time>
            </p>
            <h1>{b.judul}</h1>
            {b.ringkas && <p className="lede">{b.ringkas}</p>}
          </div>
        </section>

        <section className="sec sec--tight">
          <div className="wrap">
            {b.foto && (
              <figure className="foto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.foto} alt={b.alt} />
              </figure>
            )}
            {/* Berita tanpa isi panjang (mis. berita contoh) cukup dengan
                ringkasan di atas — tidak ada kotak kosong. */}
            {b.body.trim() && (
              <div className="naskah">
                <Naskah teks={b.body} />
              </div>
            )}
            <p className="kembali">
              <Link className="textlink" href="/berita">
                <span aria-hidden="true">←</span> Semua berita
              </Link>
            </p>
          </div>
        </section>

        {lain.length > 0 && (
          <section className="sec sec--off">
            <div className="wrap">
              <div className="sechead">
                <p className="eyebrow">Kabar lainnya</p>
              </div>
              <div className="mosaic">
                {lain.map((x) => (
                  <Link className="post" key={x.slug} href={`/berita/${x.slug}`}>
                    <div
                      className="art"
                      style={x.foto ? { backgroundImage: `url('${x.foto}')` } : undefined}
                    />
                    <div className="txt">
                      <p className="meta">
                        <time dateTime={x.iso}>{x.tanggal}</time>
                        <s>{x.kategori}</s>
                      </p>
                      <h3>{x.judul}</h3>
                      <span className="go">
                        Baca <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <UntukMedia />
      </div>
    </Shell>
  );
}
