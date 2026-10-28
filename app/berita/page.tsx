import type { Metadata } from 'next';
import Link from 'next/link';
import Shell from '@/components/Shell';
import ArsipBerita from './ArsipBerita';
import UntukMedia from './UntukMedia';
import { getBerita, getTeksBerita } from '@/lib/queries';
import { SARING } from '@/lib/data/news';
import './berita.css';

export const metadata: Metadata = {
  title: 'Berita — Kairos Baut',
  description: 'Kabar, kegiatan, dan siaran pers PT Kairos Multi Sejahtera.',
};

/* Backoffice memanggil revalidatePath('/berita', 'layout') setelah menyimpan;
   jendela ini hanya jaring pengaman. */
export const revalidate = 300;

/* Halaman Berita. Rancangan "Papan Berita" — dipilih user 2026-09-09 dari
   tiga alternatif; dua lainnya sudah dihapus.

   Paling ramah foto: rujukan ASML nyaris tanpa gambar, tapi catatan klien di
   notes2.pdf minta "add some more images". Kosakata kartunya meminjam dari
   /blog supaya Berita dan Blog terasa satu keluarga.

   Isinya dari tabel `news` (2026-10-28). Tiap kartu menuju /berita/<slug>;
   dulu semuanya href="#". */
export default async function BeritaPage() {
  const [berita, t] = await Promise.all([getBerita(), getTeksBerita()]);
  const [utama, ...sisa] = berita;
  const samping = sisa.slice(0, 2);
  const arsip = sisa.slice(2);

  /* Tab = urutan baku dulu (yang memang dipakai), lalu kategori lain yang
     diketik admin. Tab tanpa satu berita pun tidak ditampilkan. */
  const dipakai = new Set(berita.map((b) => b.kategori));
  const kategori = [
    'Semua',
    ...SARING.slice(1).filter((k) => dipakai.has(k)),
    ...[...dipakai].filter((k) => !SARING.includes(k)).sort(),
  ];

  return (
    <Shell current="berita">
      <div className="brt brt-papan">
        <section className="phead">
          <div className="wrap">
            <p className="crumbs">
              <Link href="/">Beranda</Link> / Berita
            </p>
            <h1>{t('n_judul')}</h1>
            <p className="lede">{t('n_lede')}</p>
          </div>
        </section>

        {utama && (
          <section className="sec sec--tight">
            <div className="wrap">
              <div className="board">
                <Link
                  className="hero-news"
                  href={`/berita/${utama.slug}`}
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
                </Link>
                <div className="side">
                  {samping.map((b) => (
                    <Link className="post" key={b.slug} href={`/berita/${b.slug}`}>
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
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Arsip baru ditampilkan kalau ada isinya di luar tiga teratas —
            dengan sedikit berita, bagian "Semua kabar." kosong cuma
            membingungkan. */}
        {arsip.length > 0 && (
          <section className="sec sec--off">
            <div className="wrap">
              <div className="sechead row">
                <div>
                  <p className="eyebrow">{t('n_arsip_eyebrow')}</p>
                  <h2>{t('n_arsip_judul')}</h2>
                </div>
              </div>

              <ArsipBerita arsip={arsip} semua={berita} kategori={kategori} />
            </div>
          </section>
        )}

        <UntukMedia />
      </div>
    </Shell>
  );
}
