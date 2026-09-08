'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { periksaUkuran, akanDipotong, ukuranHasil, type Aturan } from '@/lib/image-specs';

/* ============================================================================
   Kail bersama untuk kedua formulir unggah di /admin (foto situs & foto
   produk). Tugasnya: membuat pratinjau, membaca ukuran asli gambar, lalu
   menjalankan periksaUkuran() dan ukuranHasil() — fungsi yang SAMA PERSIS
   dengan yang dipakai server.

   Foto berasio apa pun DITERIMA; yang tidak sesuai rasio slot dipotong dari
   tengah. Karena itu kail ini tidak lagi menghalangi unggahan gara-gara
   rasio — ia hanya memberi tahu (`catatanPotong`) bahwa fotonya akan
   dipotong, dan berapa ukuran akhirnya.

   Kenapa tetap diperiksa di browser padahal server juga memeriksa: batas
   unggahan 10 MB. Tanpa ini, admin menunggu seluruh berkas terkirim hanya
   untuk diberi tahu fotonya terlalu kecil. Server tetap pemutus akhir.

   Catatan orientasi EXIF: naturalWidth/naturalHeight pada <img> sudah
   memperhitungkan penanda putar EXIF, jadi angkanya sudah dalam orientasi
   tampil — sama dengan yang dinilai server setelah menukar lebar/tinggi.
   ========================================================================= */

export type GambarTerpilih = {
  pratinjau: string | null;
  namaBerkas: string | null;
  galat: string | null;
  /** Keterangan pemotongan, mis. "Dipotong ke 4:3 → 1600×1200 px". Bukan galat. */
  catatanPotong: string | null;
  /** Ada berkas terpilih DAN lolos pemeriksaan — tombol unggah boleh aktif. */
  siap: boolean;
  pilih: (file: File | null) => void;
  reset: () => void;
};

export function useGambarTerpilih(aturan: Aturan): GambarTerpilih {
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [namaBerkas, setNamaBerkas] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [catatanPotong, setCatatanPotong] = useState<string | null>(null);
  const [lolos, setLolos] = useState(false);
  const urlRef = useRef<string | null>(null);

  const bersihkan = useCallback(() => {
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
  }, []);

  /* Melepas URL objek terakhir saat komponen dilepas — tanpa ini tiap
     pemilihan berkas menyisakan blob di memori sampai halaman dimuat ulang. */
  useEffect(() => bersihkan, [bersihkan]);

  const reset = useCallback(() => {
    bersihkan();
    setPratinjau(null); setNamaBerkas(null); setGalat(null);
    setCatatanPotong(null); setLolos(false);
  }, [bersihkan]);

  const pilih = useCallback((file: File | null) => {
    bersihkan();
    if (!file) {
      setPratinjau(null); setNamaBerkas(null); setGalat(null);
      setCatatanPotong(null); setLolos(false); return;
    }

    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setPratinjau(url);
    setNamaBerkas(`${file.name} · ${(file.size / 1048576).toFixed(1)} MB`);
    setGalat(null);
    setCatatanPotong(null);
    setLolos(false);

    /* SVG dilewatkan — vektor tidak punya ukuran piksel yang bermakna, dan
       server pun melewatkannya. Hanya dipakai untuk logo klien. */
    if (file.type === 'image/svg+xml') { setLolos(true); return; }

    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const salah = periksaUkuran(w, h, aturan);
      setGalat(salah);
      setLolos(!salah);
      if (!salah) {
        const hasil = ukuranHasil(w, h, aturan);
        setCatatanPotong(
          akanDipotong(w, h, aturan)
            ? `Foto ${w}\u00d7${h} akan dipotong ke ${aturan.rasio![0]}:${aturan.rasio![1]} — ` +
              `tersimpan ${hasil.w}\u00d7${hasil.h} px. Bagian yang dipakai persis seperti pratinjau.`
            : `Tersimpan ${hasil.w}\u00d7${hasil.h} px.`
        );
      }
    };
    img.onerror = () => {
      setGalat('Berkas ini tidak bisa dibaca sebagai gambar.');
      setLolos(false);
    };
    img.src = url;
  }, [aturan, bersihkan]);

  return { pratinjau, namaBerkas, galat, catatanPotong, siap: lolos, pilih, reset };
}
