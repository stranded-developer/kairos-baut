/* ============================================================================
   Data produk — diekstrak apa adanya dari mockup statis
   (mockups/standalone/produk.html) saat migrasi ke Next.js.

   BAGIAN 1: masih hardcoded di sini, persis seperti mockup.
   BAGIAN 2 dan seterusnya: tabel `products` di Supabase menggantikan
   PRODUCTS, dan berkas ini dipakai sebagai data seed. Bentuk tipe di bawah
   sengaja dibuat sama dengan kolom tabelnya supaya perpindahannya sepele.
   ========================================================================= */

/** Kategori chip pada toolbar indeks produk. */
export type ProductCategory = 'baut' | 'mur' | 'batang' | 'angkur';

/** Status stok — kunci ke dalam STOCK. */
export type StockStatus = 'ready' | 'low' | 'indent';

export interface Product {
  id: string;
  cat: ProductCategory;
  /** Kunci ke dalam ART — gambar vektor cadangan. Diganti foto asli di Bagian 6. */
  art: string;
  name: string;
  sub: string;
  std: string;
  size: string;
  grade: string;
  mat: string;
  stock: StockStatus;
  desc: string;
  spec: Record<string, string>;
  finish: string[];
  apps: string[];
  /** Foto asli per jenis. Jenis yang tidak ada di sini memakai ART.
      Kosong untuk data seed — diisi dari tabel product_photos. */
  photos?: Partial<Record<'produk' | 'teknis' | 'kemasan', { url: string; alt: string }>>;
}

/** Gambar vektor per jenis produk — isi dari <svg viewBox="0 0 120 80">. */
export const ART: Record<string, string> = {
  "hex": "<path d=\"M18 26 L30 20 L42 26 L42 54 L30 60 L18 54 Z\" fill=\"#9BA8A0\"/><path d=\"M18 26 L30 32 L42 26 L30 20 Z\" fill=\"#C6D0C9\"/><rect x=\"42\" y=\"34\" width=\"58\" height=\"12\" fill=\"#8A968F\"/><g fill=\"#68746E\"><rect x=\"48\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"56\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"64\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"72\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"80\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"88\" y=\"34\" width=\"2.5\" height=\"12\"/></g>",
  "carriage": "<ellipse cx=\"34\" cy=\"40\" rx=\"17\" ry=\"19\" fill=\"#C6D0C9\"/><ellipse cx=\"34\" cy=\"40\" rx=\"10\" ry=\"11\" fill=\"#9BA8A0\"/><rect x=\"46\" y=\"34\" width=\"54\" height=\"12\" fill=\"#8A968F\"/><g fill=\"#68746E\"><rect x=\"52\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"60\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"68\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"76\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"84\" y=\"34\" width=\"2.5\" height=\"12\"/></g>",
  "socket": "<rect x=\"18\" y=\"22\" width=\"26\" height=\"36\" rx=\"3\" fill=\"#C6D0C9\"/><path d=\"M25 32 L37 32 L40 40 L37 48 L25 48 L22 40 Z\" fill=\"#8A968F\"/><rect x=\"44\" y=\"34\" width=\"56\" height=\"12\" fill=\"#8A968F\"/><g fill=\"#68746E\"><rect x=\"50\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"58\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"66\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"74\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"82\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"90\" y=\"34\" width=\"2.5\" height=\"12\"/></g>",
  "nut": "<path d=\"M60 14 L84 27 L84 53 L60 66 L36 53 L36 27 Z\" fill=\"#C6D0C9\"/><circle cx=\"60\" cy=\"40\" r=\"15\" fill=\"#F5F8F4\"/><circle cx=\"60\" cy=\"40\" r=\"15\" fill=\"none\" stroke=\"#8A968F\" stroke-width=\"2\"/>",
  "ring": "<circle cx=\"60\" cy=\"40\" r=\"26\" fill=\"#C6D0C9\"/><circle cx=\"60\" cy=\"40\" r=\"11\" fill=\"#F5F8F4\"/><circle cx=\"60\" cy=\"40\" r=\"26\" fill=\"none\" stroke=\"#8A968F\" stroke-width=\"2\"/>",
  "snap": "<path d=\"M60 16 a24 24 0 1 1 -10 45\" fill=\"none\" stroke=\"#9BA8A0\" stroke-width=\"9\" stroke-linecap=\"round\"/><circle cx=\"61\" cy=\"16\" r=\"5\" fill=\"#C6D0C9\"/><circle cx=\"49\" cy=\"60\" r=\"5\" fill=\"#C6D0C9\"/>",
  "stud": "<rect x=\"14\" y=\"34\" width=\"92\" height=\"12\" fill=\"#8A968F\"/><g fill=\"#68746E\"><rect x=\"18\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"26\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"34\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"42\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"50\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"58\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"66\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"74\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"82\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"90\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"98\" y=\"34\" width=\"2.5\" height=\"12\"/></g>",
  "anchor": "<rect x=\"52\" y=\"10\" width=\"12\" height=\"46\" fill=\"#8A968F\"/><path d=\"M52 56 L64 56 L70 70 L46 70 Z\" fill=\"#C6D0C9\"/><g fill=\"#68746E\"><rect x=\"52\" y=\"14\" width=\"12\" height=\"2.5\"/><rect x=\"52\" y=\"21\" width=\"12\" height=\"2.5\"/><rect x=\"52\" y=\"28\" width=\"12\" height=\"2.5\"/><rect x=\"52\" y=\"35\" width=\"12\" height=\"2.5\"/></g>",
  "struktur": "<path d=\"M14 26 L26 20 L38 26 L38 54 L26 60 L14 54 Z\" fill=\"#9BA8A0\"/><path d=\"M14 26 L26 32 L38 26 L26 20 Z\" fill=\"#C6D0C9\"/><rect x=\"38\" y=\"34\" width=\"46\" height=\"12\" fill=\"#8A968F\"/><path d=\"M84 30 L98 40 L84 50 Z\" fill=\"#C6D0C9\"/><g fill=\"#68746E\"><rect x=\"44\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"52\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"60\" y=\"34\" width=\"2.5\" height=\"12\"/><rect x=\"68\" y=\"34\" width=\"2.5\" height=\"12\"/></g>"
};

export const PRODUCTS: Product[] = [
  {
    "id": "hex-bolt",
    "cat": "baut",
    "art": "hex",
    "name": "Hex Bolt",
    "sub": "Baut kepala segi enam",
    "std": "DIN 933 / 931",
    "size": "M4 – M48",
    "grade": "4.8 · 8.8 · 10.9 · 12.9",
    "mat": "Carbon · SS304 · SS316",
    "stock": "ready",
    "desc": "Baut serbaguna paling banyak dipakai di lantai produksi. DIN 933 berulir penuh, DIN 931 berulir sebagian untuk sambungan yang menahan geser. Tersedia dalam empat kelas kekuatan dan tiga jenis material, semuanya kami stok di gudang Jakarta.",
    "spec": {
      "Standar": "DIN 933 (ulir penuh) · DIN 931 (ulir sebagian) · ISO 4017 / 4014",
      "Diameter": "M4 sampai M48",
      "Panjang": "8 mm – 300 mm",
      "Kelas kekuatan": "4.8 · 8.8 · 10.9 · 12.9",
      "Material": "Baja karbon, SS304, SS316",
      "Kemasan": "Karton 25 kg atau per pcs untuk ukuran besar",
      "Lead time": "Stok — kirim di hari yang sama"
    },
    "finish": [
      "Black oxide",
      "Zinc plating",
      "HDG",
      "Dacromet"
    ],
    "apps": [
      "Perakitan rangka mesin dan konveyor",
      "Sambungan flange perpipaan",
      "Mounting panel dan struktur ringan"
    ]
  },
  {
    "id": "carriage-bolt",
    "cat": "baut",
    "art": "carriage",
    "name": "Carriage Bolt",
    "sub": "Kepala bulat, leher persegi",
    "std": "DIN 603",
    "size": "M6 – M20",
    "grade": "4.8 · 8.8",
    "mat": "Carbon · SS304",
    "stock": "ready",
    "desc": "Leher persegi di bawah kepala mengunci baut pada lubang, sehingga cukup satu kunci di sisi mur. Kepala bulat rata dipakai kalau permukaan tidak boleh menonjol atau tidak boleh melukai.",
    "spec": {
      "Standar": "DIN 603 · ISO 8677",
      "Diameter": "M6 sampai M20",
      "Panjang": "20 mm – 200 mm",
      "Kelas kekuatan": "4.8 · 8.8",
      "Material": "Baja karbon, SS304",
      "Kemasan": "Karton 25 kg",
      "Lead time": "Stok — kirim di hari yang sama"
    },
    "finish": [
      "Zinc plating",
      "HDG",
      "Stainless"
    ],
    "apps": [
      "Sambungan kayu dengan pelat baja",
      "Bodi truk dan bak kendaraan",
      "Pagar, guardrail, dan struktur luar ruang"
    ]
  },
  {
    "id": "socket-cap",
    "cat": "baut",
    "art": "socket",
    "name": "Socket Head Cap",
    "sub": "Baut L / inbus",
    "std": "DIN 912",
    "size": "M3 – M24",
    "grade": "8.8 · 12.9",
    "mat": "Carbon · SS304",
    "stock": "ready",
    "desc": "Kepala silinder dengan lubang hex, dipakai kalau ruang kunci terbatas atau kepala baut harus tenggelam di dalam counterbore. Grade 12.9 untuk beban tinggi pada jig, mold, dan mesin presisi.",
    "spec": {
      "Standar": "DIN 912 · ISO 4762",
      "Diameter": "M3 sampai M24",
      "Panjang": "6 mm – 150 mm",
      "Kelas kekuatan": "8.8 · 12.9",
      "Material": "Baja karbon alloy, SS304",
      "Kemasan": "Box 100 / 200 pcs",
      "Lead time": "Stok — kirim di hari yang sama"
    },
    "finish": [
      "Black oxide",
      "Zinc plating",
      "Stainless"
    ],
    "apps": [
      "Jig, fixture, dan mold",
      "Mesin presisi dan robot",
      "Sambungan yang harus rata permukaan"
    ]
  },
  {
    "id": "hex-nut",
    "cat": "mur",
    "art": "nut",
    "name": "Hex Nut & Mur",
    "sub": "Mur biasa, nylock, flange",
    "std": "DIN 934 / 985",
    "size": "M4 – M48",
    "grade": "Class 6 · 8 · 10",
    "mat": "Carbon · SS304 · SS316",
    "stock": "ready",
    "desc": "Mur segi enam standar (DIN 934), mur nylock dengan cincin nilon anti-kendur (DIN 985), dan mur flange yang sekaligus berfungsi sebagai ring. Kelas mur selalu kami samakan atau naikkan terhadap grade bautnya.",
    "spec": {
      "Standar": "DIN 934 · DIN 985 (nylock) · DIN 6923 (flange)",
      "Diameter": "M4 sampai M48",
      "Kelas": "Class 6 · 8 · 10",
      "Material": "Baja karbon, SS304, SS316",
      "Kemasan": "Karton 25 kg",
      "Lead time": "Stok — kirim di hari yang sama"
    },
    "finish": [
      "Zinc plating",
      "HDG",
      "Black",
      "Stainless"
    ],
    "apps": [
      "Pasangan seluruh lini baut",
      "Sambungan bergetar (nylock)",
      "Perakitan cepat tanpa ring (flange)"
    ]
  },
  {
    "id": "ring-washer",
    "cat": "mur",
    "art": "ring",
    "name": "Ring / Washer",
    "sub": "Plat, per, dan ring gigi",
    "std": "DIN 125 / 127",
    "size": "M4 – M42",
    "grade": "SS304 · SS316 · HDG",
    "mat": "Carbon · Stainless",
    "stock": "ready",
    "desc": "Ring plat membagi beban pada permukaan lunak, ring per menahan kendur akibat getaran, ring gigi menggigit permukaan untuk sambungan yang perlu kontinuitas listrik. Ukuran mengikuti diameter baut, bukan lubangnya.",
    "spec": {
      "Standar": "DIN 125 (plat) · DIN 127 (per) · DIN 6798 (gigi)",
      "Diameter": "M4 sampai M42",
      "Tebal": "0,8 mm – 5 mm",
      "Material": "Baja karbon, SS304, SS316",
      "Kemasan": "Karton 25 kg",
      "Lead time": "Stok — kirim di hari yang sama"
    },
    "finish": [
      "Zinc plating",
      "HDG",
      "Stainless"
    ],
    "apps": [
      "Distribusi beban pada pelat tipis",
      "Sambungan bergetar",
      "Grounding panel listrik"
    ]
  },
  {
    "id": "snap-ring",
    "cat": "mur",
    "art": "snap",
    "name": "Snap Ring",
    "sub": "External, internal, E-clip",
    "std": "DIN 471 / 472",
    "size": "3 – 120 mm",
    "grade": "Carbon · SS",
    "mat": "Spring steel · SS",
    "stock": "low",
    "desc": "Cincin pengunci yang menahan komponen pada poros (DIN 471) atau di dalam lubang (DIN 472). Dipasang dengan tang snap ring, tanpa ulir. Ukuran mengikuti diameter poros atau lubang, bukan diameter cincinnya.",
    "spec": {
      "Standar": "DIN 471 (external) · DIN 472 (internal) · DIN 6799 (E-clip)",
      "Ukuran": "3 mm – 120 mm",
      "Material": "Spring steel, stainless",
      "Kemasan": "Box 100 pcs",
      "Lead time": "Sebagian ukuran indent 5 – 10 hari kerja"
    },
    "finish": [
      "Phosphate",
      "Zinc plating",
      "Stainless"
    ],
    "apps": [
      "Penahan bearing pada poros",
      "Gearbox dan transmisi",
      "Perawatan mesin produksi"
    ]
  },
  {
    "id": "as-drat",
    "cat": "batang",
    "art": "stud",
    "name": "As Drat / Stud",
    "sub": "Batang ulir 1 meter",
    "std": "DIN 975",
    "size": "M6 – M36",
    "grade": "4.8 · 8.8 · SS304",
    "mat": "Carbon · SS304",
    "stock": "ready",
    "desc": "Batang berulir penuh sepanjang 1 meter, dipotong sesuai kebutuhan di lokasi. Dipakai untuk gantungan instalasi, sambungan panjang non-standar, dan pekerjaan yang panjang bautnya baru ketahuan saat pemasangan.",
    "spec": {
      "Standar": "DIN 975 · DIN 976",
      "Diameter": "M6 sampai M36",
      "Panjang": "1 meter per batang (3 m atas permintaan)",
      "Kelas kekuatan": "4.8 · 8.8 · SS304",
      "Material": "Baja karbon, SS304",
      "Kemasan": "Ikat 10 batang",
      "Lead time": "Stok — kirim di hari yang sama"
    },
    "finish": [
      "Zinc plating",
      "HDG",
      "Stainless"
    ],
    "apps": [
      "Gantungan pipa, ducting, dan tray kabel",
      "Sambungan panjang non-standar",
      "Angkur pendukung sementara"
    ]
  },
  {
    "id": "anchor-bolt",
    "cat": "angkur",
    "art": "anchor",
    "name": "Anchor Bolt",
    "sub": "J-bolt, L-bolt, angkur kimia",
    "std": "ASTM F1554",
    "size": "M12 – M42",
    "grade": "Gr. 36 · 55 · 105",
    "mat": "Carbon · HDG",
    "stock": "ready",
    "desc": "Angkur cor untuk base plate kolom, mesin, dan tower. Bentuk J dan L untuk pengecoran baru; angkur kimia dan mechanical anchor untuk beton yang sudah jadi. Panjang dan bengkokan bisa dibuat sesuai gambar kerja.",
    "spec": {
      "Standar": "ASTM F1554 · custom sesuai gambar",
      "Diameter": "M12 sampai M42",
      "Panjang": "200 mm – 1.500 mm",
      "Grade": "Gr. 36 · Gr. 55 · Gr. 105",
      "Material": "Baja karbon, HDG",
      "Kelengkapan": "Termasuk mur dan ring pasangan",
      "Lead time": "Stok ukuran umum · custom 7 – 14 hari kerja"
    },
    "finish": [
      "Black",
      "HDG",
      "Zinc plating"
    ],
    "apps": [
      "Base plate kolom baja",
      "Dudukan mesin dan genset",
      "Tower transmisi dan tiang penerangan"
    ]
  },
  {
    "id": "baut-struktur",
    "cat": "baut",
    "art": "struktur",
    "name": "Baut Struktur",
    "sub": "Untuk sambungan baja berat",
    "std": "ASTM A325 / A490",
    "size": "M16 – M36",
    "grade": "Type 1 · Type 3",
    "mat": "Carbon · Weathering",
    "stock": "indent",
    "desc": "Baut mutu tinggi untuk sambungan struktur baja yang bekerja dengan gaya jepit, bukan sekadar geser. Dikirim satu set dengan mur dan ring dari lot yang sama, disertai mill certificate — persyaratan wajib untuk proyek gedung dan jembatan.",
    "spec": {
      "Standar": "ASTM A325 · ASTM A490 · JIS B1186 (TC bolt)",
      "Diameter": "M16 sampai M36",
      "Panjang": "40 mm – 260 mm",
      "Tipe": "Type 1 (carbon) · Type 3 (weathering steel)",
      "Kelengkapan": "Set baut + mur + 2 ring, satu lot",
      "Sertifikat": "Mill certificate dan hasil uji tarik per lot",
      "Lead time": "Indent 10 – 21 hari kerja"
    },
    "finish": [
      "Black",
      "HDG",
      "Weathering"
    ],
    "apps": [
      "Sambungan balok–kolom gedung baja",
      "Jembatan dan struktur berat",
      "Rangka atap bentang lebar"
    ]
  }
];

export const STOCK: Record<StockStatus, { cls: string; label: string }> = {
  "ready": {
    "cls": "",
    "label": "Ready"
  },
  "low": {
    "cls": "low",
    "label": "Terbatas"
  },
  "indent": {
    "cls": "ind",
    "label": "Indent"
  }
};

/** Chip filter pada toolbar — urutan sama dengan mockup. */
export const CATEGORIES: { f: string; label: string }[] = [
  { f: 'all', label: 'Semua' },
  { f: 'baut', label: 'Baut' },
  { f: 'mur', label: 'Mur & Ring' },
  { f: 'batang', label: 'Batang Ulir' },
  { f: 'angkur', label: 'Angkur' },
];

/** Tiga sudut pandang pada panel detail — pengganti foto asli. */
export const VIEWS: { k: 'produk' | 'teknis' | 'kemasan'; c: string }[] = [
  { k: 'produk', c: 'Tampak produk' },
  { k: 'teknis', c: 'Gambar teknis — ukuran & standar' },
  { k: 'kemasan', c: 'Kemasan pengiriman' },
];
