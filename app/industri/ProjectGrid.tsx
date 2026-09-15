'use client';

import { useMemo, useState } from 'react';
import type { Proyek } from '@/lib/data/projects';

/* Saringan sektor. Dibuat komponen klien supaya menyaring tidak perlu bolak-
   balik ke server — daftarnya pendek dan seluruhnya sudah ada di halaman.

   Saringannya <button aria-pressed>, bukan <a href="#">: ia benar-benar
   melakukan sesuatu di halaman ini. Chip di /blog dan /berita masih
   `href="#"` karena memang belum berfungsi — jangan tiru pola itu di sini. */
export default function ProjectGrid({ proyek }: { proyek: Proyek[] }) {
  const [sektor, setSektor] = useState<string | null>(null);

  /* Sektor diambil dari datanya sendiri, bukan daftar tetap — kalau admin
     menambah sektor baru lewat backoffice, saringannya ikut muncul. */
  const sektorAda = useMemo(() => {
    const hitung = new Map<string, number>();
    for (const p of proyek) hitung.set(p.sektor, (hitung.get(p.sektor) ?? 0) + 1);
    return [...hitung.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [proyek]);

  const tampil = sektor ? proyek.filter((p) => p.sektor === sektor) : proyek;

  return (
    <>
      <div className="ind-tabs">
        <button
          type="button"
          className="ind-tab"
          aria-pressed={sektor === null}
          onClick={() => setSektor(null)}
        >
          Semua <i>{proyek.length}</i>
        </button>
        {sektorAda.map(([s, n]) => (
          <button
            key={s}
            type="button"
            className="ind-tab"
            aria-pressed={sektor === s}
            onClick={() => setSektor(s)}
          >
            {s} <i>{n}</i>
          </button>
        ))}
      </div>

      <div className="ind-grid">
        {tampil.map((p) => (
          <article className="ind-card" key={p.slug}>
            <div className="foto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.foto} alt={p.alt} loading="lazy" />
            </div>
            <div className="nama">
              <span className="sektor">{p.sektor}</span>
              <h3>{p.nama}</h3>
              {p.ringkas && <p>{p.ringkas}</p>}
            </div>
          </article>
        ))}
        {tampil.length === 0 && <p className="ind-kosong">Belum ada proyek di sektor ini.</p>}
      </div>
    </>
  );
}
