/* ============================================================================
   Aturan rasio & ukuran gambar — BAGIAN YANG AMAN UNTUK KLIEN.

   Sengaja dipisah dari lib/image-rules.ts: berkas itu `server-only` dan
   memuat sharp, jadi tidak bisa diimpor komponen klien. Padahal formulir di
   /admin perlu tahu aturannya untuk dua hal:

     1. menuliskan syaratnya SEBELUM admin memilih berkas, dan
     2. memeriksa di browser supaya penolakan terasa seketika, bukan setelah
        mengunggah 8 MB dan menunggu.

   Server tetap pemutus akhir — periksaUkuran() yang sama dipanggil ulang di
   server, jadi pemeriksaan browser murni kenyamanan dan tidak bisa ditembus
   dengan mematikan JavaScript.

   PERUBAHAN 2026-09-09 (ketiga). Pemotongan tengah otomatis diganti jadi
   **pemotong yang diatur admin** (components/PemotongGambar.tsx): geser dan
   perbesar sendiri. Potong tengah tetap ada sebagai cadangan kalau bidangnya
   tidak terkirim (JavaScript mati). Alasannya: potong tengah bisa ditebak,
   tapi tetap menebak — objek yang tidak persis di tengah ikut terpotong dan
   admin tidak punya jalan memperbaikinya selain memotong berkasnya di
   aplikasi lain.

   PERUBAHAN 2026-09-08 (kedua). Semula rasio yang salah DITOLAK. Diganti jadi
   dipotong, karena menolak ternyata tidak memperbaiki apa pun:
   kotak tampilannya sudah `object-fit: cover`, jadi foto berasio apa pun
   sebenarnya sudah tampil rapi. Menolak hanya menghalangi pekerjaan tanpa
   membuat hasilnya lebih baik — apalagi foto pemasok datang dalam segala
   rasio. Yang tersisa sebagai penolakan cuma dua, dan keduanya memang tidak
   bisa diperbaiki dengan memotong: berkas yang tidak terbaca, dan foto yang
   resolusinya terlalu rendah.

   Supaya pemotongan tidak jadi kejutan, pratinjau di /admin memakai rasio
   slot + object-fit: cover — jadi yang dilihat admin sebelum menyimpan sama
   persis dengan yang akan tersimpan. Pemotongan selalu dari TENGAH (bukan
   `attention`/`entropy` milik sharp) supaya bisa ditebak dan cocok dengan
   pratinjau.
   ========================================================================= */

export type Aturan = {
  /** [lebar, tinggi]. `null` = rasio bebas (dipakai logo klien). */
  rasio: [number, number] | null;
  /** Lebar terkecil yang masih layak tampil. */
  minLebar: number;
  /** Foto yang lebih lebar dari ini disusutkan. Rasio dipertahankan. */
  maksLebar: number;
};

/* Toleransi 1%. Alat pemotong membulatkan ke piksel bulat, jadi 1601×1200
   (1,3342) harus tetap lolos sebagai 4:3 (1,3333). Tanpa toleransi, admin
   akan ditolak berulang kali tanpa tahu sebabnya. */
export const TOLERANSI = 0.01;

/* Foto produk — ketiga jenisnya (produk, teknis, kemasan) tampil di kotak
   .mini / .dshot / .dthumb yang semuanya aspect-ratio: 4 / 3. */
export const ATURAN_PRODUK: Aturan = { rasio: [4, 3], minLebar: 1200, maksLebar: 1600 };

/* Slot foto situs. Angkanya mengikuti kotak yang sudah ada di kairos.css —
   bukan angka baru. Logo klien sengaja dibiarkan bebas: logonya wordmark
   dengan lebar berbeda-beda dan tampil dengan object-fit: contain, jadi
   mengunci rasionya justru merusak barisan marquee. */
const ATURAN_SLOT: Record<string, Aturan> = {
  'hero':                { rasio: [3, 2],  minLebar: 2000, maksLebar: 2400 },
  'gudang':              { rasio: [2, 1],  minLebar: 2000, maksLebar: 2400 },
  'industri-bg':         { rasio: [16, 9], minLebar: 2000, maksLebar: 2400 },
  'industri-machinery':  { rasio: [4, 3],  minLebar: 1200, maksLebar: 1600 },
  'industri-automotive': { rasio: [4, 3],  minLebar: 1200, maksLebar: 1600 },
  'industri-konstruksi': { rasio: [4, 3],  minLebar: 1200, maksLebar: 1600 },
  'industri-electrical': { rasio: [4, 3],  minLebar: 1200, maksLebar: 1600 },

  /* Tentang Kami (2026-09-09). Angkanya mengikuti kotak di tentang.css:
     spanduk dipasang selebar layar sebagai latar (16:9 aman untuk dipotong
     `cover`), tiga foto barisnya memakai .tt-shot yang aspect-ratio: 4 / 3. */
  'tentang-banner':      { rasio: [16, 9], minLebar: 2000, maksLebar: 2400 },
  'tentang-sejarah':     { rasio: [4, 3],  minLebar: 1200, maksLebar: 1600 },
  'tentang-mutu':        { rasio: [4, 3],  minLebar: 1200, maksLebar: 1600 },
  'tentang-industri':    { rasio: [4, 3],  minLebar: 1200, maksLebar: 1600 },
};

const LOGO_BEBAS: Aturan = { rasio: null, minLebar: 120, maksLebar: 900 };

export function aturanSlot(key: string): Aturan {
  if (key.startsWith('logo-')) return LOGO_BEBAS;
  return ATURAN_SLOT[key] ?? { rasio: null, minLebar: 600, maksLebar: 2000 };
}

/** "4:3" — dipakai di pesan galat dan di keterangan slot pada /admin. */
export function labelRasio(a: Aturan): string {
  return a.rasio ? `${a.rasio[0]}:${a.rasio[1]}` : 'bebas';
}

/** Contoh ukuran yang pasti diterima, supaya pesannya bisa ditindaklanjuti. */
export function contohUkuran(a: Aturan): string {
  if (!a.rasio) return `lebar minimal ${a.minLebar} px`;
  const [w, h] = a.rasio;
  const lebar = a.maksLebar;
  return `${lebar}×${Math.round((lebar * h) / w)} px`;
}

/** Satu kalimat syarat, ditampilkan di formulir sebelum berkas dipilih. */
export function kalimatSyarat(a: Aturan): string {
  const ukuran = `Lebar minimal ${a.minLebar} px; di atas ${a.maksLebar} px otomatis disusutkan.`;
  return a.rasio
    ? `Rasio apa pun boleh — setelah berkas dipilih, atur sendiri bagian yang dipakai ` +
      `(geser & perbesar). Hasilnya selalu ${labelRasio(a)}. ${ukuran}`
    : `Rasio bebas, tidak dipotong. ${ukuran}`;
}

/* Pembagi terbesar — dipakai hanya untuk menyebut rasio foto yang ditolak
   dalam bentuk yang mudah dibaca ("3:4", bukan "0,75"). */
function fpb(a: number, b: number): number {
  return b === 0 ? a : fpb(b, a % b);
}

export function sebutRasio(w: number, h: number): string {
  const g = fpb(w, h);
  const rw = w / g;
  const rh = h / g;
  /* Kalau angkanya tidak bulat-bulat (mis. 4001:3000), menyebutnya tidak
     menolong siapa pun — pakai desimal saja. */
  if (rw > 32 || rh > 32) return (w / h).toFixed(2).replace('.', ',');
  return `${rw}:${rh}`;
}

/**
 * Lebar yang benar-benar terpakai setelah dipotong ke rasio slot.
 *
 * Foto 3000×4000 untuk slot 4:3 hanya menyumbang 3000 px lebar (tingginya
 * yang dibuang); foto 6000×1000 hanya menyumbang 1333 px (lebarnya yang
 * dibuang). Angka inilah yang menentukan foto cukup tajam atau tidak —
 * bukan lebar mentahnya.
 */
export function lebarTerpakai(lebar: number, tinggi: number, a: Aturan): number {
  if (!a.rasio) return lebar;
  const r = a.rasio[0] / a.rasio[1];
  return Math.floor(lebar / tinggi > r ? tinggi * r : lebar);
}

/** Ukuran hasil akhir setelah dipotong ke rasio slot lalu disusutkan. */
export function ukuranHasil(lebar: number, tinggi: number, a: Aturan): { w: number; h: number } {
  if (!a.rasio) {
    const w = Math.min(lebar, a.maksLebar);
    return { w, h: Math.round((w * tinggi) / lebar) };
  }
  const w = Math.min(lebarTerpakai(lebar, tinggi, a), a.maksLebar);
  return { w, h: Math.round((w * a.rasio[1]) / a.rasio[0]) };
}

/** Benar kalau foto ini akan kehilangan sebagian sisinya saat dipotong. */
export function akanDipotong(lebar: number, tinggi: number, a: Aturan): boolean {
  if (!a.rasio) return false;
  const target = a.rasio[0] / a.rasio[1];
  return Math.abs(lebar / tinggi - target) / target > TOLERANSI;
}

/** "4 / 3" untuk properti CSS aspect-ratio pada kotak pratinjau. */
export function rasioCss(a: Aturan): string | null {
  return a.rasio ? `${a.rasio[0]} / ${a.rasio[1]}` : null;
}

/**
 * Satu-satunya tempat ukuran dinilai. Dipanggil DUA KALI: sekali di browser
 * (kenyamanan) dan sekali di server (penentu). Karena fungsinya sama persis,
 * pesan yang dilihat admin tidak mungkin berbeda antara keduanya.
 *
 * Rasio TIDAK lagi jadi alasan penolakan — lihat catatan di kepala berkas.
 * Yang ditolak hanya yang tidak bisa diperbaiki dengan memotong.
 *
 * `lebar`/`tinggi` harus sudah dalam orientasi TAMPIL. Di browser,
 * naturalWidth/naturalHeight sudah memperhitungkan penanda putar EXIF; di
 * server, lib/image-rules.ts yang menukarnya lebih dulu.
 */
export function periksaUkuran(lebar: number, tinggi: number, a: Aturan): string | null {
  if (!lebar || !tinggi) return 'Ukuran gambar tidak terbaca.';

  const terpakai = lebarTerpakai(lebar, tinggi, a);
  if (terpakai < a.minLebar) {
    const sebab =
      a.rasio && terpakai < lebar
        ? ` Setelah dipotong ke ${labelRasio(a)}, yang tersisa cuma ${terpakai} px dari ${lebar}\u00d7${tinggi}.`
        : ` Yang diunggah ${lebar}\u00d7${tinggi} px.`;
    return (
      `Foto terlalu kecil — butuh lebar minimal ${a.minLebar} px.${sebab} ` +
      `Foto sekecil ini akan pecah saat ditampilkan.`
    );
  }

  return null;
}
