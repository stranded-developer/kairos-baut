'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Berita } from '@/lib/data/news';

const PER_MUAT = 6;

/* Arsip "Semua kabar." — tab saringan dan "Muat kabar lainnya".

   Di mockup keduanya tautan mati (href="#"). Sekarang bekerja di browser,
   tanpa memuat ulang halaman:
     · tab "Semua" → arsip biasa (berita setelah tiga teratas);
     · tab kategori → SEMUA berita kategori itu, termasuk yang sedang tampil
       di atas — supaya memilih "Kegiatan" tidak menyembunyikan kegiatan
       terbaru;
     · tombol muat hanya muncul kalau memang masih ada yang tersembunyi. */
export default function ArsipBerita({
  arsip,
  semua,
  kategori,
}: {
  arsip: Berita[];
  semua: Berita[];
  kategori: string[];
}) {
  const [pilih, setPilih] = useState('Semua');
  const [jumlah, setJumlah] = useState(PER_MUAT);

  const daftar = pilih === 'Semua' ? arsip : semua.filter((b) => b.kategori === pilih);
  const tampil = daftar.slice(0, jumlah);

  return (
    <>
      <div className="tabs">
        {kategori.map((k) => (
          <button
            className="tab"
            type="button"
            key={k}
            onClick={() => { setPilih(k); setJumlah(PER_MUAT); }}
            {...(pilih === k ? { 'aria-current': 'true' as const } : {})}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="mosaic">
        {tampil.map((b) => (
          <Link className="post" key={b.slug} href={`/berita/${b.slug}`}>
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
          </Link>
        ))}
      </div>
      {tampil.length === 0 && <p className="kosong">Belum ada kabar di kategori ini.</p>}

      {daftar.length > jumlah && (
        <div style={{ marginTop: 'clamp(28px,4vw,42px)', textAlign: 'center' }}>
          <button className="btn btn--ghost" type="button" onClick={() => setJumlah(jumlah + PER_MUAT)}>
            Muat kabar lainnya
          </button>
        </div>
      )}
    </>
  );
}
