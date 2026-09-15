/* ============================================================================
   Proyek yang pernah dipasok Kairos.

   SUMBER: halaman "OUR PROJECTS" pada public/KAIROS 2.pdf (halaman 11–14).
   Ketiga belas fotonya diambil langsung dari PDF itu — halamannya dirender
   200 dpi, kartu hijaunya dideteksi dari warna, lalu foto di dalam tiap kartu
   dipotong. Hasilnya ada di /public/img/proyek.

   TIGA HAL YANG BUKAN DARI PDF — semuanya bisa disunting admin:

     1. `sektor`. PDF tidak mengelompokkan proyeknya sama sekali. Pengelompokan
        ini dibuat supaya halaman Industri punya saringan yang berguna, dan
        disimpulkan dari nama serta fotonya. Silakan diubah kalau tidak pas.
     2. `ringkas` sengaja DIKOSONGKAN. PDF tidak memuat keterangan apa pun
        selain nama proyek; menuliskan sesuatu di sini berarti mengarang.
     3. Dua salah ketik di PDF diperbaiki: "Projecct" → "Project" dan
        "Exihibition" → "Exhibition". Nama "JIS" dipanjangkan jadi
        "Jakarta International Stadium (JIS)" — fotonya memang stadion itu.

   Kata "Project" di ujung tiap nama dibuang karena seluruh halamannya sudah
   tentang proyek.
   ========================================================================= */

export const SEKTOR = [
  'Energi & Petrokimia',
  'Pertambangan & Smelter',
  'Komersial & Properti',
  'Infrastruktur',
  'Olahraga & Publik',
] as const;

export type Sektor = (typeof SEKTOR)[number];

export type Proyek = {
  slug: string;
  nama: string;
  sektor: Sektor;
  ringkas: string;
  foto: string;       // cadangan di /public/img/proyek
  alt: string;
  urutan: number;
};

export const PROYEK: Proyek[] = [
  {
    slug: 'amman-mineral', nama: 'Amman Mineral Smelting', sektor: 'Pertambangan & Smelter',
    ringkas: '', foto: '/img/proyek/amman-mineral.jpg',
    alt: 'Kawasan smelter Amman Mineral dilihat dari udara', urutan: 1,
  },
  {
    slug: 'lotte-chemical', nama: 'Lotte Chemical', sektor: 'Energi & Petrokimia',
    ringkas: '', foto: '/img/proyek/lotte-chemical.jpg',
    alt: 'Tangki bulat raksasa dalam pembangunan di kompleks Lotte Chemical', urutan: 2,
  },
  {
    slug: 'aeon-mall-cikarang', nama: 'Aeon Mall Cikarang', sektor: 'Komersial & Properti',
    ringkas: '', foto: '/img/proyek/aeon-mall-cikarang.jpg',
    alt: 'Bangunan Aeon Mall Cikarang dari sisi jalan utama', urutan: 3,
  },
  {
    slug: 'jis', nama: 'Jakarta International Stadium (JIS)', sektor: 'Olahraga & Publik',
    ringkas: '', foto: '/img/proyek/jis.jpg',
    alt: 'Lapangan dan tribun Jakarta International Stadium', urutan: 4,
  },
  {
    slug: 'sumbawa-lng', nama: 'Sumbawa LNG Terminal & Regas Facility', sektor: 'Energi & Petrokimia',
    ringkas: '', foto: '/img/proyek/sumbawa-lng.jpg',
    alt: 'Fasilitas terminal LNG di tepi pantai Sumbawa', urutan: 5,
  },
  {
    slug: 'summarecon-bekasi', nama: 'Summarecon Mall Bekasi Tahap 2', sektor: 'Komersial & Properti',
    ringkas: '', foto: '/img/proyek/summarecon-bekasi.jpg',
    alt: 'Fasad Summarecon Mall Bekasi pada malam hari', urutan: 6,
  },
  {
    slug: 'tangguh-expansion', nama: 'Tangguh Expansion', sektor: 'Energi & Petrokimia',
    ringkas: '', foto: '/img/proyek/tangguh-expansion.jpg',
    alt: 'Kilang Tangguh dilihat dari udara pada malam hari', urutan: 7,
  },
  {
    slug: 'freeport-manyar', nama: 'Freeport Manyar', sektor: 'Pertambangan & Smelter',
    ringkas: '', foto: '/img/proyek/freeport-manyar.jpg',
    alt: 'Pembangunan smelter Freeport di Manyar, Gresik', urutan: 8,
  },
  {
    slug: 'ikea-jakarta-garden-city', nama: 'IKEA Jakarta Garden City', sektor: 'Komersial & Properti',
    ringkas: '', foto: '/img/proyek/ikea-jakarta-garden-city.jpg',
    alt: 'Gedung IKEA Jakarta Garden City', urutan: 9,
  },
  {
    slug: 'kcic', nama: 'Kereta Cepat Jakarta–Bandung (KCIC)', sektor: 'Infrastruktur',
    ringkas: '', foto: '/img/proyek/kcic.jpg',
    alt: 'Pembangunan jalur layang kereta cepat di sisi jalan tol', urutan: 10,
  },
  {
    slug: 'velodrome-rawamangun', nama: 'Velodrome Rawamangun', sektor: 'Olahraga & Publik',
    ringkas: '', foto: '/img/proyek/velodrome-rawamangun.jpg',
    alt: 'Lintasan kayu dan atap rangka baja Velodrome Rawamangun', urutan: 11,
  },
  {
    slug: 'kemang-village', nama: 'Kemang Village', sektor: 'Komersial & Properti',
    ringkas: '', foto: '/img/proyek/kemang-village.jpg',
    alt: 'Menara apartemen Kemang Village dilihat dari udara', urutan: 12,
  },
  {
    slug: 'nice-pik-2', nama: 'Nusantara International Convention Exhibition (NICE) PIK 2',
    sektor: 'Komersial & Properti',
    ringkas: '', foto: '/img/proyek/nice-pik-2.jpg',
    alt: 'Gambar rancangan kawasan konvensi NICE di PIK 2', urutan: 13,
  },
];
