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
     · dipotong ke rasio slot — bukan ditolak. **Admin yang menentukan bagian
       mana yang dipakai**, lewat pemotong di /admin (geser + perbesar).
       Bidang potongnya dikirim sebagai persegi piksel pada `crop`.
       Kalau `crop` tidak ada — JavaScript mati, atau formulir lama —
       potongannya jatuh ke TENGAH. Tengah dipilih sebagai cadangan karena
       bisa ditebak; strategi `attention` milik sharp lebih pintar tapi
       hasilnya tidak bisa ditebak sehingga pratinjaunya jadi bohong.
     · penyusutan resolusi ke maksLebar. Ini yang membereskan berat berkas:
       foto ponsel 4000 px belasan MB tidak lagi dikirim apa adanya.
     · konversi ke WebP.

   Yang masih ditolak cuma dua, keduanya tidak bisa diperbaiki dengan
   memotong: berkas yang tidak terbaca sebagai gambar, dan foto yang setelah
   dipotong lebarnya di bawah minLebar (hasilnya pasti pecah).
   ========================================================================= */

export { ATURAN_PRODUK, aturanSlot } from './image-specs';

/** Persegi potong dalam piksel SUMBER, sesudah orientasi EXIF diluruskan. */
export type Potong = { x: number; y: number; w: number; h: number };

export type HasilGambar =
  | { error: string }
  | { buffer: Buffer; contentType: string; ext: string; lebar: number; tinggi: number };

/**
 * Membaca bidang potong dari FormData. Mengembalikan null kalau tidak lengkap
 * atau bukan angka — artinya jatuh ke potong tengah, bukan gagal.
 */
export function bacaPotong(fd: FormData): Potong | null {
  const n = (k: string) => Number(fd.get(k));
  const x = n('crop_x'), y = n('crop_y'), w = n('crop_w'), h = n('crop_h');
  if (![x, y, w, h].every(Number.isFinite)) return null;
  if (w < 1 || h < 1 || x < 0 || y < 0) return null;
  return { x, y, w, h };
}

/** Menjepit bidang potong ke dalam batas gambar. */
function jepitBidang(p: Potong, lebar: number, tinggi: number): Potong {
  const x = Math.max(0, Math.min(Math.round(p.x), lebar - 1));
  const y = Math.max(0, Math.min(Math.round(p.y), tinggi - 1));
  const w = Math.max(1, Math.min(Math.round(p.w), lebar - x));
  const h = Math.max(1, Math.min(Math.round(p.h), tinggi - y));
  return { x, y, w, h };
}

/**
 * Memeriksa ukuran, lalu memotong ke rasio slot, menyusutkan, dan
 * mengubah ke WebP.
 *
 * SVG dilewatkan apa adanya: ia vektor, tidak punya ukuran piksel yang
 * bermakna dan tidak perlu disusutkan. Hanya dipakai untuk logo klien.
 */
export async function siapkanGambar(
  file: File,
  aturan: Aturan,
  potong?: Potong | null
): Promise<HasilGambar> {
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

  /* Bidang potong dari admin dipercaya hanya setelah dijepit ke dalam batas
     gambar. Nilai dari browser tidak pernah dianggap sudah benar. */
  const bidang = potong ? jepitBidang(potong, lebar, tinggi) : null;

  if (bidang && aturan.rasio) {
    /* Lebar setelah dipotong sendiri yang menentukan tajam atau tidak —
       admin bisa memperbesar sampai bidangnya terlalu kecil. */
    if (bidang.w < aturan.minLebar) {
      return {
        error:
          `Potongannya terlalu kecil: ${bidang.w} px, minimal ${aturan.minLebar} px. ` +
          `Kurangi perbesaran, atau pakai foto beresolusi lebih tinggi.`,
      };
    }
  }

  /* Ukuran sasaran dihitung dari fungsi bersama, jadi angka yang dijanjikan
     kotak pratinjau dan angka yang benar-benar ditulis tidak bisa berbeda. */
  const target = bidang
    ? ukuranHasil(bidang.w, bidang.h, aturan)
    : ukuranHasil(lebar, tinggi, aturan);

  try {
    let alur = sharp(asli).rotate(); /* orientasi EXIF; tanpa ini foto ponsel miring */

    /* `.extract()` berjalan SESUDAH `.rotate()`, jadi koordinatnya sama
       dengan yang dilihat admin di browser (naturalWidth/Height juga sudah
       memperhitungkan EXIF). Tanpa urutan ini bidangnya meleset pada foto
       potret dari ponsel. */
    if (bidang) {
      alur = alur.extract({ left: bidang.x, top: bidang.y, width: bidang.w, height: bidang.h });
    }

    const keluar = await alur
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
