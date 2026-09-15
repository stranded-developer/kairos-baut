'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { periksaUkuran, rasioCss, ukuranHasil, type Aturan } from '@/lib/image-specs';

/* ============================================================================
   Pemotong gambar untuk kedua formulir unggah di /admin.

   Kenapa ada: sebelumnya foto dipotong otomatis dari TENGAH. Itu bisa ditebak,
   tapi tetap menebak — baut yang tidak persis di tengah kepalanya terpotong,
   dan admin tidak bisa berbuat apa-apa selain memotong ulang berkasnya di
   aplikasi lain. Sekarang admin sendiri yang menggeser dan memperbesar.

   Cara kerjanya:
     · kotak pandang memakai rasio slot, jadi yang terlihat = yang tersimpan;
     · gambar diskalakan minimal sampai MENUTUP kotak (tidak pernah ada
       pinggiran kosong), lalu bisa digeser dan diperbesar;
     · bidang potong dikirim sebagai piksel SUMBER lewat empat input
       tersembunyi. Server menjepitnya lagi ke batas gambar — nilai dari
       browser tidak pernah dipercaya begitu saja.

   Kalau JavaScript mati, keempat input itu tidak terkirim dan server jatuh ke
   potong tengah seperti sebelumnya. Formulirnya tetap jalan.

   Koordinat memakai naturalWidth/naturalHeight, yang sudah memperhitungkan
   penanda putar EXIF — sama dengan yang dipakai server sesudah `.rotate()`.
   ========================================================================= */

type Props = {
  aturan: Aturan;
  /** Nama field berkas, mengikuti yang sudah dipakai Server Action. */
  name?: string;
  /** Dipanggil tiap kesiapan berubah, supaya tombol Simpan bisa dimatikan. */
  onSiap?: (siap: boolean) => void;
  /**
   * `true` = formulirnya boleh dikirim TANPA berkas (mis. menyunting teks
   * proyek tanpa mengganti fotonya). Tanpa ini, memilih berkas lalu menekan
   * Batal akan mematikan tombol Simpan selamanya.
   */
  opsional?: boolean;
  /** Tombol-tombol milik formulir induk. */
  children?: React.ReactNode;
};

const ZOOM_MAKS = 4;

export default function PemotongGambar({ aturan, name = 'file', onSiap, opsional = false, children }: Props) {
  const kotakRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [nama, setNama] = useState<string | null>(null);
  const [alam, setAlam] = useState<{ w: number; h: number } | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [kotak, setKotak] = useState({ w: 0, h: 0 });

  const rasio = aturan.rasio ? aturan.rasio[0] / aturan.rasio[1] : null;

  /* Ukuran kotak pandang diukur dari DOM — lebarnya ikut lebar kartu induk. */
  useEffect(() => {
    const el = kotakRef.current;
    if (!el) return;
    const ukur = () => {
      const w = el.clientWidth;
      setKotak({ w, h: rasio ? w / rasio : w * 0.6 });
    };
    ukur();
    const ro = new ResizeObserver(ukur);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rasio, src]);

  const bersih = useCallback(() => {
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
  }, []);
  useEffect(() => bersih, [bersih]);

  /* Skala terkecil yang masih menutup kotak — tidak boleh ada pinggiran kosong. */
  const skala0 =
    alam && kotak.w ? Math.max(kotak.w / alam.w, kotak.h / alam.h) : 1;
  const skala = skala0 * zoom;
  const tampilW = alam ? alam.w * skala : 0;
  const tampilH = alam ? alam.h * skala : 0;

  const jepit = useCallback(
    (o: { x: number; y: number }) => ({
      x: Math.min(0, Math.max(kotak.w - tampilW, o.x)),
      y: Math.min(0, Math.max(kotak.h - tampilH, o.y)),
    }),
    [kotak.w, kotak.h, tampilW, tampilH]
  );

  /* Selalu jepit ulang setelah zoom/ukuran berubah, supaya tidak pernah ada
     celah di tepi kotak. */
  useEffect(() => {
    if (alam) setOff((o) => jepit(o));
  }, [zoom, kotak.w, kotak.h, alam, jepit]);

  const pilih = (f: File | null) => {
    bersih();
    setGalat(null); setAlam(null); setZoom(1); setOff({ x: 0, y: 0 });
    if (!f) { setSrc(null); setNama(null); onSiap?.(opsional); return; }

    const url = URL.createObjectURL(f);
    urlRef.current = url;
    setSrc(url);
    setNama(`${f.name} · ${(f.size / 1048576).toFixed(1)} MB`);

    if (f.type === 'image/svg+xml') { setAlam(null); onSiap?.(true); return; }

    const img = new Image();
    img.onload = () => {
      const salah = periksaUkuran(img.naturalWidth, img.naturalHeight, aturan);
      setGalat(salah);
      setAlam({ w: img.naturalWidth, h: img.naturalHeight });
      onSiap?.(!salah);
    };
    img.onerror = () => {
      setGalat('Berkas ini tidak bisa dibaca sebagai gambar.');
      onSiap?.(false);
    };
    img.src = url;
  };

  /* ---- geser ---- */
  const seret = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const mulai = (e: React.PointerEvent) => {
    if (!alam) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    seret.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y };
  };
  const gerak = (e: React.PointerEvent) => {
    const s = seret.current;
    if (!s) return;
    setOff(jepit({ x: s.ox + (e.clientX - s.x), y: s.oy + (e.clientY - s.y) }));
  };
  const selesai = () => { seret.current = null; };

  /* ---- bidang potong dalam piksel sumber ---- */
  const bidang =
    alam && kotak.w && skala
      ? {
          x: Math.round(-off.x / skala),
          y: Math.round(-off.y / skala),
          w: Math.round(kotak.w / skala),
          h: Math.round(kotak.h / skala),
        }
      : null;

  const hasil = bidang ? ukuranHasil(bidang.w, bidang.h, aturan) : null;
  const terlaluKecil = !!(bidang && aturan.rasio && bidang.w < aturan.minLebar);

  useEffect(() => {
    if (alam && !galat) onSiap?.(!terlaluKecil);
  }, [terlaluKecil, alam, galat, onSiap]);

  return (
    <div className="pot">
      <input
        ref={fileRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
        className="adm-file"
        onChange={(e) => pilih(e.target.files?.[0] ?? null)}
      />
      {nama && <p className="adm-filename">{nama}</p>}

      {src && (
        <>
          <div
            ref={kotakRef}
            className="pot-kotak"
            style={{ aspectRatio: rasioCss(aturan) ?? '3 / 2' }}
            onPointerDown={mulai}
            onPointerMove={gerak}
            onPointerUp={selesai}
            onPointerCancel={selesai}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              draggable={false}
              style={
                alam
                  ? { width: tampilW, height: tampilH, transform: `translate(${off.x}px, ${off.y}px)` }
                  : undefined
              }
            />
            {alam && <span className="pot-petunjuk">Geser untuk mengatur</span>}
          </div>

          {alam && (
            <label className="pot-zoom">
              <span>Perbesar</span>
              <input
                type="range"
                min={1}
                max={ZOOM_MAKS}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
              <button type="button" onClick={() => { setZoom(1); setOff({ x: 0, y: 0 }); }}>
                Atur ulang
              </button>
            </label>
          )}
        </>
      )}

      {galat && <p className="adm-error" role="alert">{galat}</p>}
      {!galat && terlaluKecil && (
        <p className="adm-error" role="alert">
          Potongannya {bidang!.w} px — di bawah minimal {aturan.minLebar} px. Kurangi perbesaran.
        </p>
      )}
      {!galat && !terlaluKecil && hasil && (
        <p className="adm-crop">
          Tersimpan {hasil.w}&times;{hasil.h} px — persis bagian yang terlihat di kotak.
        </p>
      )}

      {/* Server menjepit ulang nilai-nilai ini; tidak dipercaya mentah-mentah. */}
      {bidang && (
        <>
          <input type="hidden" name="crop_x" value={bidang.x} />
          <input type="hidden" name="crop_y" value={bidang.y} />
          <input type="hidden" name="crop_w" value={bidang.w} />
          <input type="hidden" name="crop_h" value={bidang.h} />
        </>
      )}

      <div className="pot-tombol">
        {children}
        {src && (
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => { pilih(null); if (fileRef.current) fileRef.current.value = ''; }}
          >
            Batal
          </button>
        )}
      </div>
    </div>
  );
}
