import { Suspense } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import PhotoSlot from '@/components/PhotoSlot';
import Stats from '@/components/home/Stats';
import IndustryPanels from '@/components/home/IndustryPanels';
import QuoteForm from '@/components/home/QuoteForm';
import { ART } from '@/lib/data/products';
import { getSiteMedia } from '@/lib/queries';
import type { Panel } from '@/components/home/IndustryPanels';
import './home.css';

/* Kartu kategori — gambar vektornya sama dengan yang dipakai indeks produk,
   jadi diambil dari ART, bukan disalin ulang. */
const CATS = [
  { href: '/produk#hex-bolt', art: ART.hex, std: 'DIN 933 · M4–M48', h3: 'Hex Bolt', p: 'Grade 4.8 sampai 12.9.', go: 'Lihat detail' },
  { href: '/produk#carriage-bolt', art: ART.carriage, std: 'DIN 603 · M6–M20', h3: 'Carriage Bolt', p: 'Kepala bulat, leher persegi.', go: 'Lihat detail' },
  { href: '/produk#hex-nut', art: ART.nut, std: 'DIN 934 · M4–M48', h3: 'Hex Nut & Mur', p: 'Biasa, nylock, dan flange.', go: 'Lihat detail' },
  { href: '/produk#ring-washer', art: ART.ring, std: 'DIN 125 · M4–M42', h3: 'Ring / Washer', p: 'Plat, per, dan ring gigi.', go: 'Lihat detail' },
  { href: '/produk#snap-ring', art: ART.snap, std: 'DIN 471 · 3–120 mm', h3: 'Snap Ring', p: 'External, internal, E-clip.', go: 'Lihat detail' },
  { href: '/produk#as-drat', art: ART.stud, std: 'DIN 975 · M6–M36', h3: 'As Drat / Stud', p: 'Batang ulir 1 meter.', go: 'Lihat detail' },
  { href: '/produk#anchor-bolt', art: ART.anchor, std: 'ASTM F1554 · M12–M42', h3: 'Anchor Bolt', p: 'J-bolt, L-bolt, angkur kimia.', go: 'Lihat detail' },
  {
    href: '#kontak',
    art: '<path d="M40 40 L56 24 L56 34 L88 34 L88 46 L56 46 L56 56 Z" fill="#8A968F"/><circle cx="30" cy="40" r="8" fill="none" stroke="#C6D0C9" stroke-width="3"/>',
    std: 'Custom · Indent',
    h3: 'Pesanan Khusus',
    p: 'Ukuran & material non-standar.',
    go: 'Kirim spesifikasi',
  },
];

const CLIENTS = [
  { key: 'logo-adhi-karya', name: 'Adhi Karya' },
  { key: 'logo-karya-logam-agung', name: 'Karya Logam Agung' },
  { key: 'logo-ihi-power-electric', name: 'IHI Power Electric' },
  { key: 'logo-wijaya-karya', name: 'Wijaya Karya' },
];

/* Naskah panel Industri — tetap di halaman, bukan di basis data. Ini teks
   pemasaran beranda, bukan data produk; yang bisa disunting dari backoffice
   adalah fotonya (lewat site_media). */
const INDUSTRI = [
  { key: 'industri-machinery',  idx: '01 — Machinery',  h3: 'Mesin produksi', body: 'Fastener presisi dengan toleransi ketat dan stok berkelanjutan, supaya penggantian saat downtime tidak perlu menunggu impor.' },
  { key: 'industri-automotive', idx: '02 — Automotive', h3: 'Otomotif',       body: 'Baut bodi, chassis, dan engine mounting untuk workshop maupun manufaktur komponen kendaraan.' },
  { key: 'industri-konstruksi', idx: '03 — Konstruksi', h3: 'Konstruksi',     body: 'Baut struktur A325 dan A490, angkur, serta as drat galvanis untuk proyek gedung dan infrastruktur.' },
  { key: 'industri-electrical', idx: '04 — Elektrikal', h3: 'Kelistrikan',    body: 'Fastener tahan korosi untuk tower transmisi, panel distribusi, dan instalasi luar ruang.' },
];

export const revalidate = 300;

export default async function HomePage() {
  const media = await getSiteMedia();

  const panels: Panel[] = INDUSTRI.map((p) => ({
    img: media[p.key].src,
    alt: media[p.key].alt,
    idx: p.idx,
    h3: p.h3,
    body: p.body,
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
              <p className="eyebrow">PT Kairos Multi Sejahtera · Sejak 2009</p>
              <h1>
                Cari baut yang tepat, <mark>sekali jalan.</mark>
              </h1>
              <p className="lede">
                2.400 item baut, mur, dan ring siap kirim ke seluruh Indonesia — lengkap dengan
                sertifikat material. Cari langsung di bawah, atau kirim spesifikasi Anda ke tim kami.
              </p>

              <form className="search" role="search" action="/produk" method="get">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input type="search" name="q" aria-label="Cari produk" placeholder="Cari: hex bolt M16, as drat SS304, snap ring…" />
                <button className="btn" type="submit">
                  Cari<span> Produk</span>
                </button>
              </form>

              <div className="pills">
                <Link className="pill" href="/produk?q=hex%20bolt">Hex Bolt</Link>
                <Link className="pill" href="/produk?f=mur">Mur &amp; Ring</Link>
                <Link className="pill" href="/produk?f=batang">As Drat</Link>
                <Link className="pill" href="/produk?f=angkur">Anchor Bolt</Link>
                <Link className="pill" href="/produk?q=SS304">Stainless 304</Link>
                <Link className="pill" href="/produk?q=HDG">Galvanis</Link>
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
              <strong>Sertifikat lengkap</strong>Mill cert &amp; uji tarik per batch
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
              <strong>Kirim 34 provinsi</strong>Dari Jakarta &amp; Cikarang
            </div>
          </div>
          <div>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3.5 2" />
            </svg>
            <div>
              <strong>Balas 1×24 jam</strong>Penawaran pada hari kerja
            </div>
          </div>
          <div>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 20V9l8-5 8 5v11" />
              <path d="M9 20v-6h6v6" />
            </svg>
            <div>
              <strong>Gudang sendiri</strong>Stok fisik, bukan dropship
            </div>
          </div>
        </div>
      </section>

      {/* ============ TENTANG + ANGKA ============ */}
      <section className="sec" id="tentang">
        <div className="wrap">
          <div className="about rv">
            <div>
              <p className="eyebrow">Tentang kami</p>
              <h2>Satu baut yang salah grade sudah cukup.</h2>
            </div>
            <div>
              <p className="lede">
                Itu sebabnya setiap pengiriman kami disertai mill certificate, hasil uji tarik, dan
                laporan dimensi. Bukan formalitas — itu yang membedakan pemasok baut dengan mitra
                teknis. Lima belas tahun kami melayani kontraktor dan pabrik yang tidak punya ruang
                untuk menebak.
              </p>
              <a className="textlink" href="#kontak" style={{ marginTop: 6 }}>
                Bicara dengan tim teknis kami <span aria-hidden="true">→</span>
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
            <figcaption>Gudang Cikarang · Jababeka 1</figcaption>
          </PhotoSlot>

          <Stats />
        </div>
      </section>

      {/* ============ KLIEN ============ */}
      <section className="sec sec--tight" style={{ paddingTop: 0 }} aria-label="Klien">
        <div className="wrap" style={{ marginBottom: 22 }}>
          <p className="eyebrow rv" style={{ margin: 0 }}>
            Kami telah bekerja sama dengan
          </p>
        </div>
        <div className="marquee">
          {/* Logo klien belum ada — selama itu nama perusahaan yang tampil.
              Lihat mockups/standalone/img/README.md. */}
          <div className="marquee-track">
            {CLIENTS.map((c) => (
              <PhotoSlot as="span" key={c.key} className="lg" src={media[c.key].src} alt={c.name}>
                <b>{c.name}</b>
              </PhotoSlot>
            ))}
            {CLIENTS.map((c) => (
              <PhotoSlot as="span" key={`dup-${c.key}`} className="lg" src={media[c.key].src} alt="" aria-hidden="true">
                <b>{c.name}</b>
              </PhotoSlot>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INDUSTRI ============ */}
      <section
        className="sec sec--dark"
        id="industri"
        style={{ '--sec-photo': `url('${media['industri-bg'].src}')` } as React.CSSProperties}
      >
        <div className="wrap">
          <div className="sechead row rv">
            <div>
              <p className="eyebrow">Industri</p>
              <h2>
                Empat sektor,
                <br />
                satu standar.
              </h2>
            </div>
            <p className="lede" style={{ maxWidth: '44ch', margin: 0 }}>
              Kami berkomitmen memberikan pelayanan yang lebih dari yang diharapkan — mulai dari
              konsultasi spesifikasi sampai pengiriman ke lokasi proyek.
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
              <p className="eyebrow">Katalog</p>
              <h2>Kategori produk.</h2>
            </div>
            <Link className="textlink" href="/produk">
              Lihat indeks lengkap <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="cats rv">
            {CATS.map((c) => (
              <Link className="cat" href={c.href} key={c.h3}>
                <div className="pic">
                  <svg viewBox="0 0 120 80" aria-hidden="true" dangerouslySetInnerHTML={{ __html: c.art }} />
                </div>
                <div className="txt">
                  <div className="std">{c.std}</div>
                  <h3>{c.h3}</h3>
                  <p>{c.p}</p>
                  <div className="go">
                    {c.go} <span aria-hidden="true">→</span>
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
              <p className="eyebrow">Penawaran</p>
              <h2>Minta penawaran.</h2>
              <p className="lede" style={{ marginTop: 16 }}>
                Isi formulir ini, atau langsung chat WhatsApp kalau butuh cepat. Belum yakin
                spesifikasinya? Kirim gambar kerja atau foto barang lama — tim kami bantu
                identifikasi.
              </p>
              <div className="contacts">
                <div className="cc">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M3 5.5C3 4.7 3.7 4 4.5 4h3l1.6 4-2.1 1.5a13 13 0 0 0 6.5 6.5L15 13.9l4 1.6v3c0 .8-.7 1.5-1.5 1.5A15.5 15.5 0 0 1 3 5.5z" />
                  </svg>
                  <div>
                    <strong>
                      <a href="tel:+62216500888">+62 21 6500 888</a>
                    </strong>
                    Kantor Jakarta
                  </div>
                </div>
                <div className="cc">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M4 5h16v14H4z" />
                    <path d="m4 6 8 6 8-6" />
                  </svg>
                  <div>
                    <strong>
                      <a href="mailto:marketing@kairosbaut.com">marketing@kairosbaut.com</a>
                    </strong>
                    Balas 1×24 jam kerja
                  </div>
                </div>
                <div className="cc">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.6" />
                  </svg>
                  <div>
                    <strong>Perkantoran Mega Sunter Blok B No. 32</strong>
                    Jl. Danau Sunter Selatan, Jakarta 14350
                  </div>
                </div>
              </div>
            </div>

            <Suspense fallback={null}>
              <QuoteForm />
            </Suspense>
          </div>
        </div>
      </section>
    </Shell>
  );
}
