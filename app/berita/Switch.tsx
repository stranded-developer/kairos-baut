import Link from 'next/link';
import { RANCANGAN } from '@/lib/data/news';

/* Batang pembanding di atas tiap rancangan — supaya ketiganya bisa
   ditukar-tukar cepat saat menilai, tanpa balik ke /berita dulu.

   ALAT REVIEW. Begitu satu rancangan dipilih: hapus berkas ini, dua halaman
   yang kalah, dan blok `.brt-switch` di berita.css. */
export default function Switch({ current }: { current: string }) {
  return (
    <div className="brt-switch">
      <div className="wrap">
        <b>Rancangan</b>
        {RANCANGAN.map((r, i) => (
          <Link
            key={r.slug}
            href={`/berita/${r.slug}`}
            {...(r.slug === current ? { 'aria-current': 'true' as const } : {})}
          >
            {i + 1} · {r.nama}
          </Link>
        ))}
        <span className="sisa">Isi beritanya masih contoh — belum data sungguhan</span>
      </div>
    </div>
  );
}
