'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Proyek } from '@/lib/data/projects';

/* Saringan sektor + dialog rincian.

   Saringannya <button aria-pressed>, bukan <a href="#">: ia benar-benar
   melakukan sesuatu. Chip di /blog dan /berita masih `href="#"` karena memang
   belum berfungsi — jangan tiru pola itu di sini.

   Dialognya memakai <dialog> bawaan peramban dengan pola yang sama persis
   seperti dialog produk di /produk: showModal(), tutup lewat Esc bawaan, dan
   klik pada backdrop. */

/* Baris rincian hanya muncul kalau ADA isinya. Company profile cuma memuat
   foto + nama, jadi sebagian besar proyek awalnya kosong — menampilkan
   "Lokasi: —" berderet cuma jadi sampah visual. */
function Baris({ label, isi }: { label: string; isi: string }) {
  if (!isi.trim()) return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>{isi}</dd>
    </>
  );
}

export default function ProjectGrid({ proyek }: { proyek: Proyek[] }) {
  const [sektor, setSektor] = useState<string | null>(null);
  const [bukaSlug, setBukaSlug] = useState<string | null>(null);
  const dlgRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const fokusTerakhir = useRef<Element | null>(null);

  const sektorAda = useMemo(() => {
    const hitung = new Map<string, number>();
    for (const p of proyek) hitung.set(p.sektor, (hitung.get(p.sektor) ?? 0) + 1);
    return [...hitung.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [proyek]);

  const tampil = sektor ? proyek.filter((p) => p.sektor === sektor) : proyek;
  const aktif = bukaSlug ? proyek.find((p) => p.slug === bukaSlug) ?? null : null;

  const buka = useCallback((slug: string) => {
    fokusTerakhir.current = document.activeElement;
    setBukaSlug(slug);
  }, []);

  const tutup = useCallback(() => {
    const d = dlgRef.current;
    if (d?.open) d.close();
  }, []);

  useEffect(() => {
    const d = dlgRef.current;
    if (!d) return;
    if (aktif && !d.open) {
      d.showModal();
      closeRef.current?.focus();
    }
  }, [aktif]);

  /* Esc dan tombol tutup sama-sama memicu event `close` bawaan <dialog>;
     fokus dikembalikan ke kartu yang tadi diklik. */
  useEffect(() => {
    const d = dlgRef.current;
    if (!d) return;
    const onClose = () => {
      setBukaSlug(null);
      (fokusTerakhir.current as HTMLElement | null)?.focus?.();
    };
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, []);

  const adaRincian = (p: Proyek) =>
    !!(p.ringkas || p.lokasi || p.tahun || p.klien || p.lingkup || p.body);

  return (
    <>
      <div className="ind-tabs">
        <button type="button" className="ind-tab" aria-pressed={sektor === null} onClick={() => setSektor(null)}>
          Semua <i>{proyek.length}</i>
        </button>
        {sektorAda.map(([s, n]) => (
          <button key={s} type="button" className="ind-tab" aria-pressed={sektor === s} onClick={() => setSektor(s)}>
            {s} <i>{n}</i>
          </button>
        ))}
      </div>

      <div className="ind-grid">
        {tampil.map((p) => (
          <button className="ind-card" key={p.slug} type="button" onClick={() => buka(p.slug)}>
            <span className="foto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.foto} alt={p.alt} loading="lazy" />
            </span>
            <span className="nama">
              <span className="sektor">{p.sektor}</span>
              <span className="judul">{p.nama}</span>
              <span className="lihat">
                {adaRincian(p) ? 'Lihat rincian' : 'Lihat foto'} <span aria-hidden="true">→</span>
              </span>
            </span>
          </button>
        ))}
        {tampil.length === 0 && <p className="ind-kosong">Belum ada proyek di sektor ini.</p>}
      </div>

      <dialog
        className="ind-detail"
        ref={dlgRef}
        aria-labelledby="ind-dtitle"
        onClick={(e) => {
          if (e.target === dlgRef.current) tutup();
        }}
      >
        {aktif && (
          <div className="ind-dwrap">
            <div className="ind-dshot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={aktif.foto} alt={aktif.alt} />
            </div>
            <div className="ind-dbody">
              <div className="ind-dtop">
                <div>
                  <p className="sektor">{aktif.sektor}</p>
                  <h2 id="ind-dtitle">{aktif.nama}</h2>
                </div>
                <button className="ind-dclose" ref={closeRef} type="button" aria-label="Tutup" onClick={tutup}>
                  ×
                </button>
              </div>

              {aktif.ringkas && <p className="ind-dringkas">{aktif.ringkas}</p>}

              <dl className="ind-dspec">
                <Baris label="Lokasi" isi={aktif.lokasi} />
                <Baris label="Tahun" isi={aktif.tahun} />
                <Baris label="Pemberi kerja" isi={aktif.klien} />
                <Baris label="Lingkup pasokan" isi={aktif.lingkup} />
              </dl>

              {aktif.body
                .split(/\n\s*\n/)
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t, i) => (
                  <p className="ind-dteks" key={i}>
                    {t}
                  </p>
                ))}

              {!adaRincian(aktif) && (
                <p className="ind-dkosong">
                  Rinciannya belum diisi. Lokasi, tahun, pemberi kerja, dan lingkup pasokan
                  bisa ditambahkan lewat backoffice.
                </p>
              )}

              <div className="ind-dcta">
                <a className="btn btn--sm" href="/#kontak">
                  Minta penawaran serupa <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
