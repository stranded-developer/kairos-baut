import type { Metadata } from 'next';
import Link from 'next/link';
import Shell from '@/components/Shell';
import ProjectGrid from './ProjectGrid';
import { getProjects } from '@/lib/queries';
import './industri.css';

export const metadata: Metadata = {
  title: 'Industri & Proyek — Kairos Baut',
  description:
    'Proyek yang dipasok PT Kairos Multi Sejahtera — energi, petrokimia, pertambangan, infrastruktur, komersial, dan fasilitas publik di seluruh Indonesia.',
};

export const revalidate = 300;

export default async function IndustriPage() {
  const proyek = await getProjects();
  const sektor = new Set(proyek.map((p) => p.sektor));

  return (
    <Shell current="industri">
      <div className="ind">
        <section className="phead">
          <div className="wrap">
            <p className="crumbs">
              <Link href="/">Beranda</Link> / Industri
            </p>
            <h1>Industri &amp; proyek.</h1>
            <p className="lede">
              Baut, mur, dan ring dari gudang kami terpasang di kilang, smelter, jalur kereta
              cepat, stadion, dan pusat perbelanjaan di seluruh Indonesia. Sebagian di antaranya
              ada di bawah ini.
            </p>
            <div className="ind-stat">
              <div>
                <b>{proyek.length}</b>
                <span>Proyek tercatat</span>
              </div>
              <div>
                <b>{sektor.size}</b>
                <span>Sektor industri</span>
              </div>
              <div>
                <b>2007</b>
                <span>Melayani sejak</span>
              </div>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="wrap">
            <ProjectGrid proyek={proyek} />
          </div>
        </section>

        <section className="sec sec--dark ind-cta">
          <div className="wrap">
            <p className="eyebrow">Proyek Anda berikutnya</p>
            <h2>Kirim daftar kebutuhannya, kami hitungkan.</h2>
            <p className="lede">
              Lengkap dengan mill certificate per batch untuk lini mutu 8.8 dan 10.9.
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
