import 'server-only';
import sharp from 'sharp';
import { periksaUkuran, ukuranHasil, type Aturan } from './image-specs';

/* ============================================================================
   Pemrosesan gambar unggahan admin — sisi server.

   Aturan angkanya sendiri ada di lib/image-specs.ts supaya bisa dipakai juga
   oleh formulir di browser. Berkas ini hanya menambahkan yang butuh sharp:
   membaca ukuran asli, meluruskan orientasi EXIF, menyusutkan, dan mengubah
   ke WebP.

   Latar belakang (2026-09-08): foto yang diunggah lewat /admin tidak diperiksa
   sama sekali — apa pun rasionya langsung masuk. Kotak tampilannya sudah
   dikunci (mis. .mini dan .dshot = 4:3 di produk.css), jadi foto potret dari
   ponsel tampil sebagai jalur sempit dengan pinggiran kosong lebar.

   Yang dilakukan tiap unggahan:
     · dipotong dari TENGAH ke rasio slot — bukan ditolak. Pemotongan tengah
       dipilih karena bisa ditebak: kotak pratinjau di /admin memakai rasio
       yang sama dengan object-fit: cover, jadi yang dilihat admin sebelum
       menyimpan sama persis dengan yang tersimpan. Strategi `attention` milik
       sharp memang lebih pintar, tapi hasilnya tidak bisa ditebak sehingga
       pratinjaunya jadi bohong.
     · penyusutan resolusi ke maksLebar. Ini yang membereskan berat berkas:
       foto ponsel 4000 px belasan MB tidak lagi dikirim apa adanya.
     · konversi ke WebP.

   Yang masih ditolak cuma dua, keduanya tidak bisa diperbaiki dengan
   memotong: berkas yang tidak terbaca sebagai gambar, dan foto yang setelah
   dipotong lebarnya di bawah minLebar (hasilnya pasti pecah).
   ========================================================================= */

export { ATURAN_PRODUK, aturanSlot } from './image-specs';

export type HasilGambar =
  | { error: string }
  | { buffer: Buffer; contentType: string; ext: string; lebar: number; tinggi: number };

/**
 * Memeriksa ukuran, lalu memotong ke rasio slot, menyusutkan, dan
 * mengubah ke WebP.
 *
 * SVG dilewatkan apa adanya: ia vektor, tidak punya ukuran piksel yang
 * bermakna dan tidak perlu disusutkan. Hanya dipakai untuk logo klien.
 */
export async function siapkanGambar(file: File, aturan: Aturan): Promise<HasilGambar> {
  const asli = Buffer.from(await file.arrayBuffer());

  if (file.type === 'image/svg+xml') {
    return { buffer: asli, contentType: 'image/svg+xml', ext: 'svg', lebar: 0, tinggi: 0 };
  }

  let meta;
  try {
    meta = await sharp(asli).metadata();
  } catch {
    return { error: 'Berkas ini tidak bisa dibaca sebagai gambar. Coba simpan ulang sebagai JPG atau PNG.' };
  }

  /* PENTING — orientasi EXIF. Foto potret dari ponsel sering DISIMPAN
     mendatar (mis. 4032×3024) disertai penanda "putar 90°". Kalau yang
     diperiksa angka mentahnya, foto potret lolos sebagai 4:3, lalu `.rotate()`
     di bawah memutarnya jadi 3:4 — persis cacat yang mau dicegah aturan ini.
     Nilai 5–8 berarti gambarnya diputar seperempat, jadi lebar dan tingginya
     harus ditukar dulu sebelum dinilai. */
  const mentahLebar = meta.width ?? 0;
  const mentahTinggi = meta.height ?? 0;
  const diputar = (meta.orientation ?? 1) >= 5;
  const lebar = diputar ? mentahTinggi : mentahLebar;
  const tinggi = diputar ? mentahLebar : mentahTinggi;

  const salah = periksaUkuran(lebar, tinggi, aturan);
  if (salah) return { error: salah };

  /* Ukuran sasaran dihitung dari fungsi bersama, jadi angka yang dijanjikan
     kotak pratinjau dan angka yang benar-benar ditulis tidak bisa berbeda. */
  const target = ukuranHasil(lebar, tinggi, aturan);

  /* `fit: cover` + `position: centre` = potong tengah lalu skala ke ukuran
     sasaran. Karena target dihitung dari ukuran sumber, tidak akan pernah
     memperbesar (memperbesar cuma menambah berat, bukan detail). */
  try {
    const keluar = await sharp(asli)
      .rotate() /* menerapkan orientasi EXIF; tanpa ini foto ponsel bisa miring */
      .resize(target.w, target.h, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: keluar.data,
      contentType: 'image/webp',
      ext: 'webp',
      lebar: keluar.info.width,
      tinggi: keluar.info.height,
    };
  } catch {
    return { error: 'Gambar gagal diproses. Coba simpan ulang sebagai JPG atau PNG.' };
  }
}
