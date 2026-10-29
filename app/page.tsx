import { Fragment, Suspense } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import PhotoSlot from '@/components/PhotoSlot';
import Stats from '@/components/home/Stats';
import IndustryPanels from '@/components/home/IndustryPanels';
import QuoteForm from '@/components/home/QuoteForm';
import { ART } from '@/lib/data/products';
import { getSiteMedia, getSettings, getClients, getBeranda } from '@/lib/queries';
import type { Pelanggan } from '@/lib/data/clients';
import { baris, telHref } from '@/lib/data/settings';
import type { Panel } from '@/components/home/IndustryPanels';
import './home.css';

/* Kartu kategori — gambar vektornya sama dengan yang dipakai indeks produk,
   jadi diambil dari ART, bukan disalin ulang. Teksnya (standar, judul,
   keterangan, ajakan) dari naskah beranda: kunci b_kartu_<n>_*. */
const CATS = [
  { href: '/produk#hex-bolt', art: ART.hex },
  { href: '/produk#carriage-bolt', art: ART.carriage },
  { href: '/produk#hex-nut', art: ART.nut },
  { href: '/produk#ring-washer', art: ART.ring },
  { href: '/produk#snap-ring', art: ART.snap },
  { href: '/produk#as-drat', art: ART.stud },
  { href: '/produk#anchor-bolt', art: ART.anchor },
  {
    href: '#kontak',
    art: '<path d="M40 40 L56 24 L56 34 L88 34 L88 46 L56 46 L56 56 Z" fill="#8A968F"/><circle cx="30" cy="40" r="8" fill="none" stroke="#C6D0C9" stroke-width="3"/>',
  },
];

/* Foto panel Industri dari site_media; naskahnya (b_panel_<n>_*) dari
   naskah beranda di /admin/beranda. */
const INDUSTRI = ['industri-machinery', 'industri-automotive', 'industri-konstruksi', 'industri-electrical'];

export const revalidate = 300;

export default async function HomePage() {
  const [media, setelan, klien, t] = await Promise.all([getSiteMedia(), getSettings(), getClients(), getBeranda()]);
  /* Di sini alamat tampil dua baris: baris pertama tebal, sisanya disambung
     koma — sama dengan tulisan aslinya sebelum pindah ke site_settings. */
  const [alamat1, ...alamatSisa] = baris(setelan.alamat_kantor);

  const panels: Panel[] = INDUSTRI.map((key, i) => ({
    img: media[key].src,
    alt: media[key].alt,
    idx: t(`b_panel_${i + 1}_idx`),
    h3: t(`b_panel_${i + 1}_judul`),
    body: t(`b_panel_${i + 1}_isi`),
  }));

  /* Foto hero jadi latar lewat CSS, bukan <img>. Variabelnya hanya dipasang
     kalau ada unggahan — kalau masih cadangan, biarkan kairos.css memakai
     nilai bawaannya supaya hasilnya identik dengan mockup. */
  const heroStyle = media.hero.fallback
    ? undefined
    : ({ '--hero-photo': `url('${media.hero.src}')` } as React.CSSProperties);

  return (
    <Shell hero>
      {/* ============ HERO ============ */}
      <section className="hero" style={heroStyle}>
        <div className="wrap">
          <div className="hero-in">
            <div>
              <p className="eyebrow">{t('b_hero_eyebrow')}</p>
              <h1>
                {t('b_hero_judul')} {t('b_hero_sorotan') && <mark>{t('b_hero_sorotan')}</mark>}
              </h1>
              <p className="lede">{t('b_hero_lede')}</p>

              <form className="search" role="search" action="/produk" method="get">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input type="search" name="q" aria-label="Cari produk" placeholder={t('b_cari_placeholder')} />
                <button className="btn" type="submit">
                  {t('b_cari_tombol')}
                  {t('b_cari_tombol_lebar') && <span> {t('b_cari_tombol_lebar')}</span>}
                </button>
              </form>

              <div className="pills">
                {[1, 2, 3, 4, 5, 6].map((n) =>
                  t(`b_pil_${n}_label`) ? (
                    <Link className="pill" key={n} href={t(`b_pil_${n}_tautan`) || '/produk'}>
                      {t(`b_pil_${n}_label`)}
                    </Link>
                  ) : null
                )}
              </div>
            </div>

            {/* Bingkai foto kanan. Tampilan E menyembunyikannya (.hshot
                display:none) — sesuai catatan notes2.pdf soal widget "stok
                gudang" yang terasa mubazir. Markup dipertahankan supaya tata
                letak tetap utuh kalau tampilan diganti lagi. */}
            <PhotoSlot as="figure" className="hshot ph" src={media.hero.src} alt={media.hero.alt}>
              <div className="ph-alt" aria-hidden="true">
                <svg viewBox="0 0 300 200" fill="none">
                  <path d="M52 74 L76 62 L100 74 L100 122 L76 134 L52 122 Z" fill="#7FD79F" opacity=".9" />
                  <path d="M52 74 L76 86 L100 74 L76 62 Z" fill="#C8F2D7" />
                  <rect x="100" y="88" width="128" height="20" fill="#5FC486" />
                  <g fill="#2E9A56">
                    <rect x="110" y="88" width="4" height="20" />
                    <rect x="126" y="88" width="4" height="20" />
                    <rect x="142" y="88" width="4" height="20" />
                    <rect x="158" y="88" width="4" height="20" />
                    <rect x="174" y="88" width="4" height="20" />
                    <rect x="190" y="88" width="4" height="20" />
                    <rect x="206" y="88" width="4" height="20" />
                  </g>
                </svg>
              </div>
              <figcaption>
                <span className="dot" aria-hidden="true" />
                Gudang Cikarang · 2.400 item ready stock
              </figcaption>
            </PhotoSlot>
          </div>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="wrap" aria-label="Kenapa Kairos Baut">
        <div className="trust rv">
          <div>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <div>
              <strong>{t('b_trust_1_judul')}</strong>{t('b_trust_1_isi')}
            </div>
          </div>
          <div>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M2 7h11v9H2z" />
              <path d="M13 10h4.5L21 13.5V16h-8z" />
              <circle cx="6.5" cy="18" r="1.8" />
              <circle cx="17" cy="18" r="1.8" />
            </svg>
            <div>
              <strong>{t('b_trust_2_judul')}</strong>{t('b_trust_2_isi')}
            </div>
          </div>
          <div>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3.5 2" />
            </svg>
            <div>
              <strong>{t('b_trust_3_judul')}</strong>{t('b_trust_3_isi')}
            </div>
          </div>
          <div>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 20V9l8-5 8 5v11" />
              <path d="M9 20v-6h6v6" />
            </svg>
            <div>
              <strong>{t('b_trust_4_judul')}</strong>{t('b_trust_4_isi')}
            </div>
          </div>
        </div>
      </section>

      {/* ============ TENTANG + ANGKA ============ */}
      <section className="sec" id="tentang">
        <div className="wrap">
          <div className="about rv">
            <div>
              <p className="eyebrow">{t('b_tentang_eyebrow')}</p>
              <h2>{t('b_tentang_judul')}</h2>
            </div>
            <div>
              <p className="lede">{t('b_tentang_lede')}</p>
              <a className="textlink" href="#kontak" style={{ marginTop: 6 }}>
                {t('b_tentang_tautan')} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <PhotoSlot as="figure" className="aboutshot ph rv" src={media.gudang.src} alt={media.gudang.alt}>
            <div className="ph-alt" aria-hidden="true">
              <svg viewBox="0 0 420 120" fill="none">
                <g stroke="#1E9E4A" strokeWidth="2">
                  <rect x="20" y="18" width="380" height="84" />
                  <path d="M20 46h380M20 74h380M115 18v84M210 18v84M305 18v84" />
                </g>
                <g fill="#1E9E4A" opacity=".5">
                  <rect x="32" y="28" width="34" height="10" rx="2" />
                  <rect x="128" y="56" width="34" height="10" rx="2" />
                  <rect x="222" y="28" width="34" height="10" rx="2" />
                  <rect x="318" y="84" width="34" height="10" rx="2" />
                  <rect x="76" y="84" width="26" height="10" rx="2" />
                  <rect x="264" y="56" width="26" height="10" rx="2" />
                </g>
              </svg>
            </div>
            <figcaption>{t('b_gudang_keterangan')}</figcaption>
          </PhotoSlot>

          <Stats
            items={[1, 2, 3].map((n) => ({ nilai: t(`b_angka_${n}`), label: t(`b_angka_${n}_label`) }))}
          />

          {/* Profil perusahaan — berkasnya ada di public/, jadi <a download>
              cukup: same-origin, browser langsung menyimpan, bukan membuka
              pratinjau PDF di tab baru. Link biasa (bukan next/link) karena
              ini berkas statis, bukan rute. */}
          <div className="profile rv">
            <a
              className="btn"
              href="/KAIROS%202.pdf"
              download="Profil Perusahaan - PT Kairos Multi Sejahtera.pdf"
            >
              {t('b_profil_tombol')}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 4v11" />
                <path d="m7 11 5 5 5-5" />
                <path d="M5 20h14" />
              </svg>
            </a>
            <span className="profile-meta">{t('b_profil_meta')}</span>
          </div>
        </div>
      </section>

      {/* ============ KLIEN ============ */}
      {/* Daftarnya dari tabel `clients` (/admin/pelanggan). Kosong = pitanya
          tidak dirender sama sekali, bukan marquee kosong. */}
      {klien.length > 0 && (
        <section className="sec sec--tight" style={{ paddingTop: 0 }} aria-label="Klien">
          <div className="wrap" style={{ marginBottom: 22 }}>
            <p className="eyebrow rv" style={{ margin: 0 }}>
              {t('b_klien_eyebrow')}
            </p>
          </div>
          <div className="marquee">
            {/* Isi digandakan supaya animasi geser menyambung tanpa jeda;
                salinan kedua disembunyikan dari pembaca layar. */}
            <div className="marquee-track">
              {klien.map((c) => <Klien key={c.id} c={c} />)}
              {klien.map((c) => <Klien key={`dup-${c.id}`} c={c} dup />)}
            </div>
          </div>
        </section>
      )}

      {/* ============ INDUSTRI ============ */}
      <section
        className="sec sec--dark"
        id="industri"
        style={{ '--sec-photo': `url('${media['industri-bg'].src}')` } as React.CSSProperties}
      >
        <div className="wrap">
          <div className="sechead row rv">
            <div>
              <p className="eyebrow">{t('b_industri_eyebrow')}</p>
              <h2>
                <Baris teks={t('b_industri_judul')} />
              </h2>
            </div>
            <p className="lede" style={{ maxWidth: '44ch', margin: 0 }}>
              {t('b_industri_lede')}
            </p>
          </div>

          <IndustryPanels panels={panels} />
        </div>
      </section>

      {/* ============ KATEGORI PRODUK ============ */}
      <section className="sec sec--off" id="produk">
        <div className="wrap">
          <div className="sechead row rv">
            <div>
              <p className="eyebrow">{t('b_katalog_eyebrow')}</p>
              <h2>{t('b_katalog_judul')}</h2>
            </div>
            <Link className="textlink" href="/produk">
              {t('b_katalog_tautan')} <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="cats rv">
            {CATS.map((c, i) => (
              <Link className="cat" href={c.href} key={c.href}>
                <div className="pic">
                  <svg viewBox="0 0 120 80" aria-hidden="true" dangerouslySetInnerHTML={{ __html: c.art }} />
                </div>
                <div className="txt">
                  <div className="std">{t(`b_kartu_${i + 1}_std`)}</div>
                  <h3>{t(`b_kartu_${i + 1}_judul`)}</h3>
                  <p>{t(`b_kartu_${i + 1}_isi`)}</p>
                  <div className="go">
                    {t(`b_kartu_${i + 1}_ajakan`)} <span aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PENAWARAN ============ */}
      <section className="sec" id="kontak">
        <div className="wrap">
          <div className="qbox qbox--dark rv">
            <div>
              <p className="eyebrow">{t('b_penawaran_eyebrow')}</p>
              <h2>{t('b_penawaran_judul')}</h2>
              <p className="lede" style={{ marginTop: 16 }}>
                {t('b_penawaran_lede')}
              </p>
              <div className="contacts">
                <div className="cc">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M3 5.5C3 4.7 3.7 4 4.5 4h3l1.6 4-2.1 1.5a13 13 0 0 0 6.5 6.5L15 13.9l4 1.6v3c0 .8-.7 1.5-1.5 1.5A15.5 15.5 0 0 1 3 5.5z" />
                  </svg>
                  <div>
                    <strong>
                      <a href={telHref(setelan.telepon_kantor)}>{setelan.telepon_kantor}</a>
                    </strong>
                    {t('b_kontak_telepon_ket')}
                  </div>
                </div>
                <div className="cc">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M4 5h16v14H4z" />
                    <path d="m4 6 8 6 8-6" />
                  </svg>
                  <div>
                    <strong>
                      <a href={`mailto:${setelan.email}`}>{setelan.email}</a>
                    </strong>
                    {t('b_kontak_email_ket')}
                  </div>
                </div>
                <div className="cc">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.6" />
                  </svg>
                  <div>
                    <strong>{alamat1}</strong>
                    {alamatSisa.join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <Suspense fallback={null}>
              <QuoteForm
                teks={{
                  labelNama: t('b_form_label_nama'), phNama: t('b_form_ph_nama'),
                  labelPerusahaan: t('b_form_label_perusahaan'), phPerusahaan: t('b_form_ph_perusahaan'),
                  opsional: t('b_form_opsional'),
                  labelEmail: t('b_form_label_email'), phEmail: t('b_form_ph_email'),
                  labelWa: t('b_form_label_wa'), phWa: t('b_form_ph_wa'),
                  labelKategori: t('b_form_label_kategori'),
                  pilihan: baris(t('b_form_pilihan')),
                  labelSpek: t('b_form_label_spek'), phSpek: t('b_form_ph_spek'),
                  tombol: t('b_form_tombol'), tombolTerkirim: t('b_form_tombol_terkirim'),
                  catatan: t('b_form_catatan'), galat: t('b_form_galat'), berhasil: t('b_form_berhasil'),
                  gagal: t('b_form_gagal'),
                }}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </Shell>
  );
}

/* Satu pelanggan di marquee. Tanpa logo: nama sebagai teks, sama dengan
   marquee sejak awal. Dengan logo: PhotoSlot — kalau gambarnya gagal dimuat,
   namanya tetap tampil (lihat .lg di kairos.css). */
function Klien({ c, dup = false }: { c: Pelanggan; dup?: boolean }) {
  const sembunyi = dup ? { 'aria-hidden': 'true' as const } : {};
  if (!c.logo) {
    return (
      <span className="lg" {...sembunyi}>
        <b>{c.nama}</b>
      </span>
    );
  }
  return (
    <PhotoSlot as="span" className="lg" src={c.logo} alt={dup ? '' : c.nama} {...sembunyi}>
      <b>{c.nama}</b>
    </PhotoSlot>
  );
}

/* Teks banyak baris → baris dipisah <br>. Dipakai judul Industri, yang
   aslinya "Empat sektor,<br />satu standar." */
function Baris({ teks }: { teks: string }) {
  return teks.split('\n').map((b, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {b}
    </Fragment>
  ));
}
