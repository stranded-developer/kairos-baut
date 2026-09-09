import type { Metadata } from 'next';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { getAboutBlocks, getSiteMedia } from '@/lib/queries';
import { ALT_TENTANG, type Blok } from '@/lib/data/about';
import './tentang.css';

export const metadata: Metadata = {
  title: 'Tentang Kami — Kairos Baut',
  description:
    'PT Kairos Multi Sejahtera — distributor pengencang besi (steel fasteners) sejak 2007, melayani proyek swasta, pemerintah, dan manufaktur di seluruh Indonesia.',
};

export const revalidate = 300;

/* Paragraf dipisah baris kosong di basis data — dipecah di sini, bukan
   disimpan sebagai HTML. Alasannya: admin mengetik di <textarea> biasa, jadi
   tidak ada markup yang bisa salah tulis atau disisipkan. */
function Paragraf({ teks }: { teks: string }) {
  return (
    <>
      {teks
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </>
  );
}

export default async function TentangPage() {
  const [blok, media] = await Promise.all([getAboutBlocks(), getSiteMedia()]);

  const banner = media['tentang-banner'];

  const foto = (b: Blok) => (b.mediaKey ? media[b.mediaKey] : undefined);

  return (
    <Shell current="tentang">
      <div className="tt">
        <section
          className="tt-banner"
          style={banner?.src ? { backgroundImage: `url('${banner.src}')` } : undefined}
        >
          <div>
            <p className="crumbs">
              <Link href="/">Beranda</Link> / Tentang Kami
            </p>
            <h1>Tentang Kami.</h1>
            <p className="lede">
              Distributor pengencang besi untuk industri Indonesia — sejak 2007.
            </p>
          </div>
        </section>

        {blok.map((b) => {
          if (b.kind === 'kutipan') {
            return (
              <section className="tt-quote" key={b.key}>
                <i aria-hidden="true" />
                <blockquote>{b.heading}</blockquote>
                {b.body && <p>{b.body}</p>}
              </section>
            );
          }

          if (b.kind === 'tanda-tangan') {
            return (
              <section className="tt-sign" key={b.key}>
                {b.body && <p className="salam">{b.body}</p>}
                <p className="nama">{b.heading}</p>
                {b.caption && <p className="jabatan">{b.caption}</p>}
                <span className="garis" aria-hidden="true" />
              </section>
            );
          }

          const f = foto(b);

          /* Blok teks tanpa foto tetap dirender sebagai satu baris penuh —
             kolom fotonya dilepas, bukan dibiarkan kosong. */
          if (!f?.src) {
            return (
              <section className="tt-row" key={b.key} style={{ gridTemplateColumns: '1fr' }}>
                <div className="tt-txt" style={{ maxWidth: '72ch', marginInline: 'auto' }}>
                  {b.heading && <h2>{b.heading}</h2>}
                  <Paragraf teks={b.body} />
                </div>
              </section>
            );
          }

          return (
            <section className={b.flip ? 'tt-row flip' : 'tt-row'} key={b.key}>
              <figure className="tt-shot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src} alt={f.alt || ALT_TENTANG[b.mediaKey ?? ''] || ''} />
              </figure>
              <div className="tt-txt">
                {b.heading && <h2>{b.heading}</h2>}
                <Paragraf teks={b.body} />
              </div>
            </section>
          );
        })}

        <section className="sec sec--dark tt-cta">
          <div className="wrap">
            <p className="eyebrow">Siap membantu</p>
            <h2>Butuh fastener untuk proyek Anda?</h2>
            <p className="lede">
              Kirim spesifikasi atau foto barang lama — tim kami bantu identifikasi standar
              dan grade-nya.
            </p>
            <div className="tombol">
              <Link className="btn" href="/#kontak">
                Minta Penawaran <span aria-hidden="true">→</span>
              </Link>
              <Link className="btn btn--ghost" href="/produk">
                Lihat indeks produk
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
