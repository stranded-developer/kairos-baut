# Kairos Baut — log pembangunan

Log kerja untuk migrasi mockup statis → situs Next.js + Supabase dengan
backoffice di `/admin`. Satu berkas ini yang dibaca dulu tiap sesi baru.

- **Mulai:** 2026-09-07
- **Catatan klien (referensi, jangan dihapus):**
  [`mockups/logs/notes.pdf`](../mockups/logs/notes.pdf) ·
  [`mockups/logs/notes2.pdf`](../mockups/logs/notes2.pdf)
- **Mockup asli (referensi, jangan dihapus):** `mockups/standalone/`

---

## Keputusan yang sudah diambil

| # | Keputusan | Alasan / sumber |
|---|---|---|
| 1 | Migrasi ke **Next.js App Router**, bukan HTML statis + Supabase JS | Dipilih user, 2026-09-07. SEO server-rendered + Server Actions untuk admin |
| 6 | Backoffice pakai **satu kata sandi bersama**, bukan akun per orang | Dipilih user 2026-09-07. Konsekuensi (tidak ada jejak siapa mengubah apa, cabut akses = ganti sandi untuk semua) sudah disampaikan dan diterima user |
| 2 | **Supabase** untuk database, auth, dan storage | Storage sudah termasuk gratis — tidak perlu Cloudinary/S3/Vercel Blob |
| 3 | Navbar/hero pakai **tampilan E — "Foto penuh"** | Dipilih user dari opsi A–E. Menjawab notes2.pdf: *"background images for the home page"* + *"remove the stok gudang widget"* |
| 4 | Dikerjakan **bertahap, 7 bagian**, diperiksa tiap selesai satu bagian | Diminta user — hindari perubahan borongan yang sulit ditelusuri kalau error |
| 5 | UI **tidak boleh berubah** dari mockup | Diminta user. `kairos.css` disalin apa adanya, bukan ditulis ulang |

### Latar belakang dari catatan klien
- notes.pdf — *"white background would be cleaner and more professional, the
  black vibes makes everything feel so techy"* → versi terang yang dipakai.
- notes.pdf — *"journal section is unnecessary for the home page, maybe it can
  be like just in the blog page"* → sudah dipindah ke `/blog`.
- notes2.pdf — *"remove the stok gudang widget next to the search bar"* →
  tampilan E menyembunyikan `.hshot`.
- notes2.pdf — *"customer logos, the tentang kami part, and the industry part
  would need to add some more images"* → **belum dikerjakan**, lihat To-do.

---

## Peta 7 bagian

| Bagian | Isi | Butuh Supabase | Status |
|---|---|---|---|
| 1 | Scaffold Next.js + UI dipindah 1:1, tampilan E dikunci | tidak | **✅ selesai** |
| 2 | Skema tabel, bucket storage, seed dari data hardcoded | ya | **✅ selesai** |
| 3 | Halaman publik baca dari Supabase (server-rendered) | ya | **✅ selesai** |
| 4 | Gerbang sandi + kerangka `/admin` + proteksi route | tidak | **✅ selesai** |
| 5 | Admin: CRUD teks & spesifikasi produk | ya | **✅ selesai** |
| 6 | Admin: unggah gambar — foto stok & foto produk | ya | **✅ selesai** |
| 7 | Admin: editor blog | ya | **✅ selesai** |

---

## BAGIAN 1 — selesai 2026-09-07

### Yang dikerjakan
- Scaffold Next.js 15.5.25 (App Router, TypeScript, React 19), npm, Node 20.20.2.
  pnpm tidak dipakai — butuh Node ≥ 22.13.
- `kairos.css` **disalin apa adanya** (500 baris) ke `app/kairos.css`, lalu blok
  tampilan E ditambahkan di bawahnya tanpa prefiks `[data-nav="e"]` — persis
  prosedur yang ditulis di `mockups/standalone/kairos-variants.css` baris 17–19.
  Batang pemilih A–E dan kedua berkas `kairos-variants.*` tidak ikut dibawa.
- Blok `<style>` tiap halaman diekstrak apa adanya ke `app/home.css`,
  `app/produk/produk.css`, `app/blog/blog.css` — nama kelas dipertahankan
  supaya urutan cascade sama dengan mockup.
- Data 9 produk + 9 gambar vektor **diekstrak dengan skrip** dari
  `produk.html`, bukan diketik ulang → `lib/data/products.ts`. Semua rujukan
  ART terverifikasi resolve.
- Data 7 tulisan blog → `lib/data/posts.ts`.
- Foto dipindah ke `public/img/`.
- `vercel.json` diganti ke `framework: nextjs` (sebelumnya menyajikan
  `mockups/standalone` sebagai berkas statis).

### Keputusan teknis yang perlu diingat
- **`data-hero` pindah dari `<body>` ke `<div class="shell">`.** Di App Router
  `<body>` hanya boleh dirender root layout, jadi penanda hero tidak bisa
  ditempel di sana per halaman. Semua selektor `body[data-hero]` /
  `body:not([data-hero])` di blok E diganti jadi `.shell[data-hero]` /
  `.shell:not([data-hero])` — 22 selektor, semua terverifikasi ikut terbawa ke
  CSS hasil build.
- **`--hero-photo`** dibuat sebagai variabel CSS dengan cadangan
  `/img/hero.jpeg`. Rendernya identik sekarang, tapi Bagian 6 tinggal
  menimpanya lewat inline style dari Supabase.
- **`PhotoSlot`** menggantikan pola `data-ph` + `onload`/`onerror` inline.
  Kelas pembungkus dikirim penuh oleh pemanggil — **jangan** memaksakan kelas
  `ph` pada logo klien: `.ph` dan `.lg` punya kontrak CSS berbeda
  (`.ph` = overflow hidden + latar; `.lg` = marquee). Memaksakan `.ph` merusak
  barisan marquee.
- Ikon SVG di strip trust **ditulis literal**, tidak diringkas jadi array —
  menggabungkan beberapa `<path>` jadi satu string `d` mengubah arti perintah
  relatif (`m` vs `M`) dan menggeser gambarnya.

### Sudah diuji ✅
- `npx next build` — sukses, 4 route semua prerender statis.
- `npx tsc --noEmit` — bersih.
- Dev server 200 untuk `/`, `/produk`, `/blog`; tidak ada error hidrasi di log.
- Jumlah elemen cocok dengan mockup: 8 kartu kategori, 8 logo klien (4+4
  duplikat marquee), 6 pill hero, 9 baris produk, 5 chip filter, 6 kartu blog +
  1 feature, 5 topik.
- 6 foto di `/img/` semua 200.
- CSS hasil build: 22 selektor `.shell`, `--hero-photo` ada, tidak ada sisa
  selektor `[data-nav]` (satu kecocokan hanya di dalam komentar).

### BELUM diuji — perlu mata manusia ⚠️
- **Belum pernah dilihat di browser sungguhan.** Semua verifikasi di atas
  berbasis HTML/CSS hasil render, bukan tampilan. Ini yang paling perlu
  diperiksa sebelum lanjut ke Bagian 2.
- Navbar transparan → memadat saat digulir (kelas `.stuck`) di beranda.
- Navbar pita hijau tua di `/produk` dan `/blog`.
- Menu burger di layar kecil: buka/tutup, Esc, klik di luar, kunci scroll.
- Animasi angka 15+ / 2.400 / 34 saat blok "Tentang" masuk layar.
- Panel Industri: hover di desktop, tap di layar sentuh.
- Dialog detail produk: buka dari baris, tiga thumbnail, tutup via ×,
  klik backdrop, dan tombol Esc.
- Deep link `/produk?q=…`, `/produk?f=mur`, `/produk#hex-bolt`.
- Prefill kategori di formulir dari `/?produk=hex-bolt#kontak`.

---

## BAGIAN 2 — sedang jalan, sejak 2026-09-07

Project Supabase: **`uisroaljiixvpxduyfqv`** (`https://uisroaljiixvpxduyfqv.supabase.co`)

### Selesai ✅
- Kedua kunci API diuji dan hidup. Kunci publik dan kunci rahasia dua-duanya
  menjawab benar; kunci ngawur ditolak (kontrol).
  Catatan: `GET /rest/v1/` menjawab 401 untuk kunci publik — itu wajar,
  endpoint spec OpenAPI memang dibatasi, bukan tanda kunci bermasalah.
- `@supabase/supabase-js` 2.115.0 + `@supabase/ssr` 0.12.6 + `server-only`.
- `.env.local` ditulis — **terverifikasi tidak ikut git**. `.env.example` untuk rujukan.
- **Bucket storage sudah dibuat** dan terverifikasi: `product-photos` dan
  `site-photos`. Baca publik, batas 10 MB, mime hanya jpeg/png/webp/avif/svg.
- Pembungkus klien: `lib/supabase/client.ts` (browser), `server.ts` (SSR,
  berbasis cookie), `admin.ts` (kunci rahasia, ditandai `server-only`).
- SQL skema ditulis: `supabase/migrations/0001_init.sql` — **belum dijalankan**.

### Keputusan desain yang perlu diingat
- **Tabel `admins` sebagai penjaga tulis, bukan sekadar `authenticated`.**
  Pendaftaran mandiri di project ini masih terbuka (`disable_signup: false`),
  jadi kalau policy-nya hanya memeriksa "sudah login", siapa pun yang
  mendaftar bisa menyunting katalog. Semua policy tulis memanggil
  `public.is_admin()` yang mencocokkan `auth.uid()` ke daftar putih `admins`.
- **Storage tidak perlu policy RLS.** Bucket dibuat publik untuk dibaca, dan
  semua penulisan lewat Server Action berkunci rahasia. Tidak ada jalur tulis
  dari browser sama sekali.
- **`site_media` berisi slot bernama, bukan galeri bebas.** Barisnya tetap;
  admin hanya mengganti `storage_path` dan `alt`. Dengan begitu tata letak
  tidak pernah kehilangan slot, dan cadangan vektor tetap jalan kalau foto
  belum diisi.
- `desc` diganti `description` — `desc` kata kunci SQL.
- Indeks unik parsial memastikan hanya ada satu tulisan blog unggulan.

### BLOKIR — perlu tindakan user 🔴
Belum bisa menjalankan DDL. Kunci rahasia bisa memakai PostgREST, Storage, dan
Auth Admin API, tapi **tidak bisa membuat tabel**. `psql` tidak terpasang dan
Supabase CLI belum login. Perlu salah satu dari tiga (lihat pesan ke user).

### Sisa Bagian 2 begitu akses DDL ada
- [ ] Jalankan `supabase/migrations/0001_init.sql`.
- [ ] Skrip seed dari `lib/data/products.ts` + `lib/data/posts.ts`.
- [ ] Isi baris `site_media`: hero, gudang, 4 panel industri, 4 logo klien.
- [ ] Buat pengguna admin + masukkan ke tabel `admins`.
- [ ] Verifikasi RLS betulan: dengan kunci publik, `select` harus jalan dan
      `insert`/`update` harus ditolak.

### Utang teknis / catatan
- [ ] Foto produk masih grafik vektor (`ART`). Butuh ±9 foto latar putih —
      lihat `mockups/standalone/img/README.md`. Diselesaikan di Bagian 6.
- [ ] 4 logo klien belum ada (`public/img/logo/*.png`). Selama belum ada, nama
      perusahaan yang tampil — perilaku ini disengaja. **Pastikan ada izin
      klien** sebelum menampilkan logo.
- [ ] `hero.jpeg` (754 px) dan `gudang.jpg` (740 px) resolusinya rendah untuk
      layar Retina. Sekarang `hero.jpeg` dipakai selebar layar sebagai latar
      hero (tampilan E), jadi ini **lebih terasa** daripada di mockup.
      Idealnya ganti dengan versi ≥ 2000 px — nama berkas tidak perlu diubah.
- [ ] Latar pita Industri masih memakai ulang `machinery.jpg` (digelapkan ~94%).
      Ganti ke `industri-bg.jpg` (~2400 px) kalau sudah ada.
- [ ] Tombol "Unduh katalog (PDF)" di `/produk` belum mengarah ke mana pun.
- [ ] Formulir penawaran belum mengirim ke mana pun — masih perilaku mockup.
      Jadikan Server Action + tabel `quote_requests` (belum masuk 7 bagian,
      perlu dikonfirmasi apakah mau).
- [ ] Filter topik di `/blog` belum berfungsi (semua `href="#"`), sama seperti
      mockup. Diselesaikan di Bagian 7.
- [ ] Tautan tiap tulisan blog masih `href="#"` — belum ada halaman detail.
- [ ] Footer masih tertulis "Mockup v5 — revisi catatan". Ganti sebelum live.

---

## Perintah yang sering dipakai

```bash
npm run dev      # dev server
npm run build    # build produksi — jalankan sebelum menandai bagian selesai
npx tsc --noEmit # typecheck
```

## Struktur berkas

```
app/
├── layout.tsx          <html> + <body> + kairos.css
├── kairos.css          salinan mockup + blok TAMPILAN E di bawahnya
├── page.tsx            beranda        + home.css
├── produk/page.tsx     indeks produk  + produk.css → ProductIndex.tsx (client)
└── blog/page.tsx       catatan teknis + blog.css
components/
├── Shell.tsx           pembungkus .shell[data-hero] + chrome bersama
├── Header.tsx  Footer.tsx  Logo.tsx  WhatsAppFab.tsx
├── SiteChrome.tsx      pindahan kairos.js (sticky, burger, reveal)
├── PhotoSlot.tsx       foto dengan cadangan (pengganti data-ph)
└── home/               Stats · IndustryPanels · QuoteForm (semua client)
lib/data/
├── products.ts         9 produk + ART — data seed Bagian 2
└── posts.ts            7 tulisan blog — data seed Bagian 2
public/img/             6 foto + logo/ (masih kosong)
mockups/                mockup statis asli — REFERENSI, jangan dihapus
```


---

## BAGIAN 4 — selesai 2026-09-07 (dikerjakan lebih awal, karena Bagian 2 terblokir)

Dikerjakan mendahului urutan karena gerbang sandi sama sekali tidak butuh
database — jadi bisa jalan sementara akses DDL belum ada.

### Yang dikerjakan
- `lib/admin-auth.ts` — pemeriksa sandi + cookie sesi bertanda tangan.
- `middleware.ts` — menjaga `/admin/:path*`, kecuali `/admin/login`.
- `app/admin/login/` — halaman masuk, Server Action, pembatas percobaan.
- `app/admin/` — kerangka backoffice: bilah navigasi, ringkasan, tombol keluar.
- `app/admin/admin.css` — memakai token warna kairos.css, tapi **tidak** memakai
  `.shell` supaya aturan navbar/hero tampilan E tidak ikut terpakai.

### Cara kerjanya
- Sandi ada di `ADMIN_PASSWORD` di `.env.local` (tidak ikut git), **tidak** ditulis di
  kode. Ganti nilainya lalu restart — tidak perlu ubah kode.
- Cookie sesi berisi `<kedaluwarsa>.<HMAC-SHA256>`, httpOnly, `secure` di
  produksi, umur 12 jam. **Tidak memuat sandi.**
- Mengganti `ADMIN_SESSION_SECRET` langsung mematikan semua sesi berjalan —
  ini tombol darurat kalau sandi bocor.
- Perbandingan sandi memakai waktu tetap (`timingSafeEqual`).
- Pembatas percobaan: 8 kali per IP per 10 menit, disimpan di memori proses.
  **Catatan:** hilang saat restart dan tidak berlaku lintas instance. Kalau
  nanti jalan di banyak instance dan ini kurang, pindahkan ke tabel Supabase.
- `next=` pada URL hanya menerima path internal — mencegah open redirect.

### Sudah diuji ✅ (7 uji HTTP + 13 uji unit, semua lulus)
Gerbang, lewat HTTP sungguhan:
- `/admin` tanpa cookie → 307 ke `/admin/login`
- `/admin/produk` tanpa cookie → 307, tujuan diingat di `?next=`
- cookie palsu → ditolak
- `/admin/login` sendiri → 200
- cookie **ditandatangani benar** → 200 (jalur berhasil betul-betul jalan)
- tanda tangan benar tapi kedaluwarsa → ditolak
- tanda tangan dari secret lain → ditolak

Fungsi asli (dikompilasi dari sumber, bukan tiruan): 13/13 lulus — sandi benar,
salah, kosong, beda huruf besar, ada spasi, awalan saja, lebih panjang; cookie
bolak-balik, diubah 1 karakter, undefined, sampah, tanpa tanda tangan, exp
bukan angka.

Kebocoran ke browser — dicari di seluruh `.next/static/`:
- nilai `ADMIN_PASSWORD` → tidak ada
- `ADMIN_SESSION_SECRET` → tidak ada
- `sb_secret_` → tidak ada

`npx next build` sukses (`/admin` dan `/admin/login` terbangun, middleware 32.7 kB).

### BELUM diuji ⚠️
- Belum pernah dicoba di browser sungguhan: mengetik sandi di formulir dan
  benar-benar masuk. Uji di atas membuktikan mekanismenya, bukan alurnya.
- Pembatas percobaan belum diuji sampai memicu (butuh 9 percobaan berturut).

---

## Catatan: PAT yang dikirim ternyata read-only

Token `sbp_fc04…` bisa membaca detail project, tapi semua endpoint lain ditolak:

| Endpoint | Hasil |
|---|---|
| `GET /projects/{ref}` | 200 |
| `POST /projects/{ref}/database/query` | 401 |
| `GET /projects/{ref}/api-keys` | 403 |
| `GET /projects/{ref}/config/auth` | 403 |
| `GET /projects/{ref}/database/migrations` | 403 |
| `GET /organizations` | 403 |
| `GET /projects` (daftar) | 403 |

Jadi migrasi masih belum bisa dijalankan. Host database untuk rujukan:
`db.uisroaljiixvpxduyfqv.supabase.co` (Postgres 17.6.1.166, region ap-southeast-1).


---

## BAGIAN 2 — selesai 2026-09-07

### Terverifikasi
- 4 tabel dibuat; `admins` memang tidak ada (dibuang, lihat di bawah).
- 11 slot `site_media`, 9 produk, 7 tulisan ter-seed.
- **RLS terbukti**: kunci publik boleh `select`; `insert` ditolak (42501);
  `update`/`delete` menjawab 204 **tapi mengenai 0 baris** — diperiksa dengan
  `Prefer: return=representation` yang mengembalikan `[]`, dan datanya utuh.
  Kunci rahasia bisa menulis (jalur backoffice) — diuji lalu dikembalikan.
- Ke-9 produk dibandingkan **kolom per kolom** dengan `lib/data/products.ts`:
  identik, termasuk urutan kunci `spec`.

### Dua keputusan yang berubah di tengah jalan
1. **Tabel `admins` dan `is_admin()` dibuang.** Dirancang untuk akun Supabase
   Auth, padahal backoffice memakai kata sandi bersama — `auth.uid()` selalu
   null, jadi policy itu tidak akan pernah cocok. Penggantinya lebih ketat:
   **tidak ada policy tulis sama sekali**, jadi kunci publik memang tidak punya
   jalur tulis. Semua penulisan lewat server dengan kunci rahasia.
2. **`spec jsonb` → `spec json`.** ⚠️ **Jangan diulang di tabel lain.**
   `jsonb` menormalkan dan **mengurutkan ulang kunci** (berdasarkan panjang,
   lalu abjad), sehingga tabel spesifikasi di panel detail produk tampil dengan
   urutan acak — "Kemasan" naik ke atas, "Standar" turun ke nomor 3. `json`
   menyimpan teks apa adanya sehingga urutannya terjaga. Kita tidak pernah
   melakukan query ke dalam `spec`, jadi tidak ada yang hilang.
   Setelah ALTER, data **harus di-seed ulang** — baris lama sudah terlanjur acak.

---

## BAGIAN 3 — selesai 2026-09-07

### Yang dikerjakan
- `lib/supabase/public.ts` — klien polos untuk halaman publik. Sengaja **tidak**
  memakai `@supabase/ssr` berbasis cookie: menyentuh cookie memaksa halaman
  jadi dinamis. Dengan klien ini halaman tetap statis + `revalidate`.
- `lib/queries.ts` — `getProducts()`, `getPosts()`, `getSiteMedia()`.
  Mengembalikan **bentuk yang sama persis** dengan yang dulu diekspor
  `lib/data/*.ts`, jadi komponen halaman tidak berubah sama sekali.
- `/`, `/produk`, `/blog` sekarang membaca dari Supabase. `revalidate = 300`.
- Foto: tiap slot `site_media` punya berkas cadangan di `/public/img`. Selama
  `storage_path` masih null, cadangan itu yang dipakai — **karena itu tampilan
  sekarang identik dengan mockup**. Begitu admin mengunggah (Bagian 6), URL
  storage yang dipakai tanpa perubahan kode.

### Keputusan: naskah beranda TIDAK masuk basis data
Kartu kategori dan teks panel Industri di beranda **tetap hardcoded** di
`app/page.tsx`. Alasannya: itu naskah pemasaran, bukan data produk — teksnya
memang berbeda dari tabel produk (mis. kartu menulis "DIN 933 · M4–M48"
sedangkan produknya "DIN 933 / 931"). Yang bisa disunting dari backoffice
adalah **fotonya**. Kalau ternyata teks ini juga mau bisa disunting, itu
tambahan cakupan — **perlu ditanyakan ke user**, jangan diputuskan sendiri.

### Sudah diuji ✅
- **DOM hasil render dibandingkan sebelum vs sesudah pindah sumber data:**
  beranda 629 node, produk 485 node, blog 249 node — **IDENTIK ketiganya**,
  setelah membuang muatan RSC dan hash aset yang wajar berubah.
- **Datanya betul dari Supabase, bukan sisa hardcode:** nama produk diubah
  langsung di database → muncul di `/produk`; teks alt foto diubah → muncul di
  beranda. Keduanya dikembalikan.
- `npx next build` sukses. `/`, `/produk`, `/blog` prerender statis,
  revalidate 5 menit. Build berhasil menarik data lewat kunci publik —
  bukti RLS baca publik memang jalan.

### BELUM diuji ⚠️
- Belum dilihat di browser sungguhan setelah pindah sumber data.
- `revalidate` 5 menit belum diuji betulan (perlu menunggu, atau
  `revalidatePath` dari backoffice — baru ada di Bagian 5).

### Catatan Node
`nvm use 22` wajib di folder ini — `supabase-js` 2.115 butuh WebSocket bawaan
(Node 22+) dan **gagal di Node 20**. Sudah ada `.nvmrc` berisi `22` dan
`engines.node >= 22` di package.json. Shell non-interaktif kadang masih
memakai Node 20 default nvm; kalau ada galat WebSocket, itu penyebabnya.


---

## BAGIAN 5 — selesai 2026-09-07

### Yang dikerjakan
- `/admin/produk` — daftar produk, dengan penanda stok dan "Disembunyikan".
- `/admin/produk/[id]` — formulir sunting lengkap + tombol hapus.
- `/admin/produk/baru` — buat produk baru.
- `app/admin/produk/actions.ts` — `simpanProduk`, `buatProduk`, `hapusProduk`.
- `lib/product-form.ts` — pembacaan & pemeriksaan FormData, **dipisah supaya
  bisa diuji tanpa menjalankan Next**.
- `lib/admin-guard.ts` — `requireAdmin()`, dipanggil di setiap aksi.
- `lib/admin-queries.ts` — pembacaan backoffice pakai kunci rahasia, supaya
  produk yang belum terbit ikut terlihat.

### Keputusan yang perlu diingat
- **Setiap Server Action memanggil `requireAdmin()` sendiri.** Middleware
  menjaga rute, tapi Server Action adalah endpoint POST tersendiri — kalau
  hanya mengandalkan middleware, satu perubahan matcher bisa membuka semuanya.
- **Editor spesifikasi berbasis baris berurutan, bukan objek.** Ada tombol ↑ ↓
  untuk menggeser. Urutan baris = urutan tampil di situs. Ini yang membuat
  perbaikan `jsonb`→`json` benar-benar terpakai.
- **ID/slug dikunci saat menyunting** (`readOnly`). Slug dipakai sebagai
  jangkar `/produk#hex-bolt`; kalau bisa diubah sembarangan, tautan lama mati.
- Setelah simpan, `revalidatePath('/produk')` dan `revalidatePath('/')`
  dipanggil supaya halaman statis langsung ikut berubah.

### Sudah diuji ✅
Perlindungan rute (server produksi, bukan dev):
- `/admin/produk`, `/admin/produk/[id]`, `/admin/produk/baru` tanpa sesi → 307.
- Dengan sesi sah → 200 semuanya.

Server Action:
- **Kelima ID aksi dipanggil tanpa cookie → semuanya dialihkan ke login**,
  data tidak berubah.
- **Kelima ID aksi dikirim ke `/produk`** (rute yang TIDAK dijaga middleware)
  untuk mencoba melewati penjagaan → Next tidak menjalankannya sama sekali
  (balasan kosong), data tidak berubah.

Formulir terisi benar: ke-7 baris spesifikasi `hex-bolt` tampil **dengan urutan
persis seperti di database**, semua kolom lain terisi, deskripsi 239 karakter.

`lib/product-form.ts` — **17/17 uji unit lulus**: urutan spec dipertahankan
(bukan abjad/panjang), label kosong dibuang, spasi dipangkas, nilai kurang dari
label, pemeriksaan id/nama/kategori/stok, checkbox terbit, sort_order bukan angka.

**Bolak-balik formulir → database → baca lagi:** urutan
`Zulu | Alpha | Kelas kekuatan | Bravo` kembali persis sama — bukan diurutkan
ulang. Ini bukti perbaikan `json` bekerja di seluruh jalur, bukan cuma di seed.

Setelah semua percobaan: produk uji dihapus, **ke-9 produk asli diperiksa
kolom per kolom terhadap `lib/data/products.ts` — utuh dan identik.**

### BELUM diuji ⚠️
- **Menyimpan lewat formulir di browser sungguhan.** Server Action tidak bisa
  dipicu lewat curl biasa (butuh muatan RSC yang dikodekan React), jadi jalur
  yang diuji adalah logikanya + tulis ke database, bukan klik tombolnya.
  **Ini yang paling perlu dicoba manual:** buka `/admin/produk/hex-bolt`, ubah
  sesuatu, Simpan, lalu lihat `/produk`.
- Tombol hapus belum dicoba lewat antarmuka.
- Tombol ↑ ↓ pada editor spesifikasi belum dicoba lewat antarmuka.
- Belum ada konfirmasi sebelum menghapus — sekali klik langsung terhapus.
  **Perlu ditanyakan ke user** apakah mau ditambah dialog konfirmasi.


---

## BAGIAN 6 — selesai 2026-09-07 (termasuk konfirmasi hapus)

### Yang dikerjakan
- `/admin/foto` — 11 slot foto situs, dikelompokkan (Beranda / Industri / Logo
  klien). Tiap slot: pratinjau, unggah, sunting teks alternatif, lepas foto.
- Foto produk pada `/admin/produk/[id]` — tiga jenis per produk
  (tampak produk, gambar teknis, kemasan).
- `lib/storage.ts` — pemeriksaan berkas, penamaan, unggah, hapus.
- `components/ConfirmSubmit.tsx` — **konfirmasi hapus dua langkah**, dipasang
  di hapus produk, lepas foto situs, dan hapus foto produk.
- `next.config.mjs` — `serverActions.bodySizeLimit: '10mb'`.

### Keputusan yang perlu diingat
- **Batas unggah 1 MB adalah jebakan bawaan Next.** Server Action menolak
  badan permintaan >1 MB secara diam-diam. Dinaikkan ke 10 MB agar sama dengan
  batas bucket, supaya penolakan hanya terjadi di satu tempat.
- **Nama berkas selalu baru (stempel waktu + acak).** CDN Supabase meng-cache
  berdasarkan URL; menimpa nama yang sama akan tetap menyajikan foto lama.
  Karena itu `cacheControl` boleh setahun — URL-nya memang tidak pernah dipakai ulang.
- **Urutan operasi saat mengganti foto:** unggah baru → catat di database →
  baru hapus yang lama. Kalau dibalik dan penyimpanan gagal, slotnya jadi
  kosong. Kalau pencatatan gagal, berkas baru dibuang lagi supaya tidak yatim.
  Kegagalan menghapus berkas lama sengaja diabaikan — berkas yatim jauh lebih
  ringan akibatnya daripada menggagalkan penyimpanan yang sudah sah.
- **Konfirmasi hapus pakai tombol dua langkah, bukan `window.confirm`.**
  Dialog bawaan tidak bisa digayakan, beda-beda antar peramban, dan diblokir
  di sebagian konteks. Tombol dua langkah: batal sendiri setelah 5 detik, Esc
  membatalkan, dan fokus dipindah ke tombol supaya Enter beruntun dari kolom
  isian tidak memicu penghapusan.
- **Cadangan tetap ada di dua tempat** (`lib/queries.ts` dan
  `app/admin/foto/page.tsx`). Kalau daftar slot berubah, **ubah keduanya**.

### Sudah diuji ✅
`lib/storage.ts` — **13/13 uji unit**: JPG/PNG/WebP/SVG diterima, PDF ditolak,
berkas kosong ditolak, 11 MB ditolak, tepat 10 MB diterima; ekstensi benar per
mime; dua panggilan menghasilkan nama berbeda (anti cache basi).

Foto situs, **integrasi sungguhan**:
- PNG asli diunggah ke bucket → 200.
- URL publik dapat diakses **tanpa kunci**, `content-type: image/png`, dan
  **byte-nya identik** dengan yang diunggah.
- Ditautkan ke slot `gudang` → **beranda memakai URL storage**, sedangkan
  `hero`, `machinery`, `automotive` **tetap memakai cadangan lokal**, dan
  `/img/gudang.jpg` benar-benar tidak lagi dirujuk.

Foto produk, **integrasi sungguhan**:
- Foto diunggah untuk `hex-bolt` → barisnya jadi `<img class="pshot">`,
  sementara **8 produk lain tetap `<svg>` vektor**. Cadangan per produk per
  jenis bekerja tepat.

**Tanpa regresi:** DOM `/`, `/produk`, `/blog` dibandingkan lagi dengan dasar
Bagian 3 — **identik ketiganya** (629 / 485 / 249 node). Jadi selama belum ada
foto diunggah, situs tetap sama persis dengan mockup.

Setelah semua percobaan: kedua bucket kosong, `product_photos` kosong, slot
`gudang` kembali null, 9 produk utuh.

### BELUM diuji ⚠️
- **Mengunggah lewat antarmuka di browser.** Sama seperti Bagian 5, Server
  Action tidak bisa dipicu lewat curl. Yang teruji adalah penyimpanan,
  penautan, dan tampilannya — bukan klik "Unggah foto".
- Tombol konfirmasi dua langkah belum dicoba lewat antarmuka (batal 5 detik,
  Esc, klik kedua).
- Batas 10 MB belum diuji lewat unggahan sungguhan sebesar itu.
- Foto produk `teknis` dan `kemasan` belum dicoba (hanya `produk` yang diuji).

### Catatan
Kolom `alt` foto produk saat ini ikut nilai lama saat mengganti foto, dan belum
ada kolom isian khusus untuk menyuntingnya per foto. Kalau perlu, tinggal
ditambah — **tanyakan dulu ke user**.


---

## BAGIAN 7 — selesai 2026-09-07  ·  SEMUA BAGIAN SELESAI

### Yang dikerjakan
- `/admin/blog` — daftar tulisan, dengan penanda topik, ★ Unggulan, Disembunyikan.
- `/admin/blog/[slug]` — editor lengkap + hapus (dengan konfirmasi).
- `/admin/blog/baru` — tulisan baru, slug dibuat otomatis dari judul.
- `lib/post-form.ts` — `buatSlug`, `hitungWaktuBaca`, `bacaFormPost`.
  Dipisah supaya bisa diuji tanpa menjalankan Next.
- Kolom `body` akhirnya terpakai — mockup hanya punya ringkasan.

### Ditambahkan juga: kolom alt per foto produk
Celah yang dicatat di Bagian 6 ditutup. Sekarang tiap foto produk punya kolom
teks alternatif sendiri, plus aksi `simpanAltProduk` supaya bisa disunting
tanpa mengunggah ulang. Nilainya dikendalikan React, jadi teks yang diketik
sebelum mengunggah ikut terkirim bersama berkasnya.

### Keputusan yang perlu diingat
- **Unggulan lama diturunkan dulu, baru yang baru dinaikkan.** Indeks unik
  parsial `posts_single_featured_idx` menolak dua unggulan sekaligus —
  **terbukti 409 saat diuji tanpa penurunan**. Tanpa penanganan ini, admin akan
  melihat pesan mentah Postgres, bukan perilaku yang wajar.
- **Slug ikut judul hanya sampai admin menyuntingnya sendiri**, dan **dikunci
  saat menyunting** — tautan yang sudah tersebar tidak boleh mati.
- **Waktu baca dihitung otomatis** dari jumlah kata (200 kata/menit) kalau
  kolomnya dikosongkan; isian manual selalu menang.

### Sudah diuji ✅
`lib/post-form.ts` — **24/24 uji unit**: pembuatan slug (spasi, tanda baca,
angka, huruf beraksen, potong 60 karakter, tepi), waktu baca (0/10/200/201/1200
kata), penolakan judul/slug/topik/tanggal, waktu baca otomatis vs manual,
checkbox unggulan.

Batasan satu unggulan, **diuji ke basis data sungguhan**:
- Menaikkan unggulan kedua tanpa menurunkan yang lama → **409, batasan bekerja**.
- Dengan urutan yang dipakai `simpanPost` → 204, dan hanya **1** unggulan tersisa.
- Dikembalikan ke `membaca-grade-baut`; 7 tulisan utuh.

Perlindungan rute: **ketujuh rute admin menjawab 307** tanpa sesi.

**Tanpa regresi, diperiksa terhadap dasar mockup:** `/`, `/produk`, `/blog`
**identik** — 629 / 485 / 249 node. Setelah tujuh bagian, situs publik masih
sama persis dengan mockup yang disetujui.

### BELUM diuji ⚠️ — daftar lengkap untuk dicoba manual di browser
Semua Server Action tidak bisa dipicu lewat curl (butuh muatan RSC), jadi yang
teruji adalah logika + tulis ke basis data, **bukan klik tombolnya**. Yang perlu
dicoba sendiri:
1. Masuk `/admin` dengan sandi dari `ADMIN_PASSWORD` di `.env.local`.
2. Produk: ubah sesuatu → Simpan → cek `/produk`.
3. Produk: tombol ↑ ↓ pada tabel spesifikasi.
4. Produk: buat baru, lalu hapus (konfirmasi dua langkah).
5. Foto situs: unggah foto → cek beranda; lalu "Lepas foto".
6. Foto produk: unggah ketiga jenis; sunting teks alternatif.
7. Blog: buat tulisan baru (perhatikan slug otomatis), tandai unggulan,
   pastikan unggulan lama turun sendiri.
8. Konfirmasi hapus: batal sendiri setelah 5 detik, dan Esc membatalkan.
9. Unggah berkas >10 MB — pastikan ditolak dengan pesan yang jelas.

### Sisa pekerjaan / catatan
- [ ] Halaman detail tulisan blog belum ada — kartu masih `href="#"`, sama
      seperti mockup. Kolom `body` sudah terisi dan siap dipakai kalau mau
      dibuat halaman `/blog/[slug]`. **Perlu ditanyakan ke user.**
- [ ] Filter topik di `/blog` masih `href="#"`, sama seperti mockup.
- [ ] Tombol "Unduh katalog (PDF)" di `/produk` belum mengarah ke mana pun.
- [ ] Formulir penawaran belum mengirim ke mana pun — masih perilaku mockup.
- [ ] Footer masih tertulis "Mockup v5 — revisi catatan". **Ganti sebelum live.**
- [ ] Naskah kartu kategori & panel Industri di beranda tetap hardcoded
      (keputusan Bagian 3, dikonfirmasi user: jangan dilebarkan).
- [ ] Sebelum deploy: pasang semua variabel `.env.local` di dashboard Vercel
      (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
      `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`).
- [ ] Pendaftaran mandiri Supabase masih terbuka. Tidak berbahaya sekarang
      (tidak ada policy tulis sama sekali), tapi sebaiknya dimatikan.

---

## Aturan: JANGAN tulis nilai rahasia di log ini

2026-09-07 — kata sandi admin sempat tertulis lengkap di berkas ini dan ikut
ter-commit. Ketahuan sebelum `git push` berhasil, lalu commit-nya diperbaiki.

**Aturan seterusnya:** log ini ikut git. Rujuk rahasia lewat **nama variabelnya**
(`ADMIN_PASSWORD`, `SUPABASE_SECRET_KEY`), jangan pernah nilainya. Nilai
sesungguhnya hanya hidup di `.env.local` (tidak dilacak git) dan di dashboard
Vercel.

Pemeriksaan cepat sebelum commit:

```bash
grep -nE 'sb_secret_[A-Za-z0-9_-]{20,}|sbp_[a-f0-9]{40}|sb_publishable_[A-Za-z0-9_-]{20,}' -r . \
  --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.next
```


---

## Deploy — 2026-09-07

**Berhasil live di Vercel.**

Dua ganjalan saat deploy pertama, keduanya di setelan proyek, bukan di kode:

1. **Root Directory masih `mockups/standalone`** — peninggalan zaman situs
   statis. Vercel menjalankan `npm install` di folder tanpa `package.json`
   ("up to date in 434ms"), lalu gagal dengan "No Next.js version detected".
   Diperbaiki dengan mengosongkan Root Directory ke akar repo.
2. **Tiga variabel env sudah ada sebelumnya** (`SUPABASE_SECRET_KEY`,
   `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`) — Vercel menolak menimpa, jadi
   harus lewat Edit, bukan Add.

### Catatan git
- Koneksi ke GitHub **kadang putus**: timeout 443 tepat ~75 detik, berulang,
  lalu pulih sendiri. Bukan masalah repo — DNS, ping, port 443, dan
  `info/refs` semuanya sehat di antara kejadian. Kalau makin sering,
  pertimbangkan SSH daripada HTTPS.
- **Kata sandi admin sempat ikut ter-commit** di berkas log ini dan
  ketahuan sebelum push berhasil; commit diperbaiki (`0aeedcc` → `1ebf4aa`).
  Lihat aturan "JANGAN tulis nilai rahasia di log ini" di atas.

### Yang MASIH perlu dicoba manual di browser
Deploy berhasil ≠ setiap tombol sudah dicoba. Daftar 9 langkah di bagian
Bagian 7 masih berlaku — terutama menyimpan produk, mengunggah foto, dan
menandai tulisan unggulan, karena Server Action tidak bisa diuji lewat curl.

---

## BAGIAN 8 — Bagian Berita (diminta 2026-09-07, **belum dikerjakan**)

Fitur baru yang diminta user setelah situs live. **Statusnya masih tahap
desain** — tiga mockup dibuat dulu untuk dipilih, belum ada kode Next.js,
belum ada tabel Supabase.

### Yang diminta
Sebuah **bagian Berita** (terpisah dari `/blog` yang sudah ada), dengan tiga
alternatif desain yang mengikuti tema yang sekarang.

**Rujukan desain:** [`mockups/standalone/img/news.mov`](../mockups/standalone/img/news.mov)
— rekaman layar 17 detik (832×336) berisi bagian berita **situs ASML**.
Video sudah dibaca: dipotong jadi 18 bingkai lewat `ffmpeg -vf fps=1`, lalu
tiap bingkai dilihat satu per satu. Yang terlihat di rekaman itu:

1. Kepala halaman: remah-remah jejak → judul raksasa **"News"** → satu
   paragraf penjelas. Tidak ada gambar sama sekali.
2. Baris **empat kolom** berisi sub-bagian (*Press releases & announcements,
   Stories, Media library, Media contacts*) — tiap kolom: judul tebal,
   deskripsi pendek, dan **garis aksen pendek** di bawahnya.
3. **Pita warna selebar layar** berisi satu tombol tunggal
   *"Sign up for news alerts"*.
4. **"Latest press releases"** — label besar di kiri, kartu-kartu putih di
   kanan di atas latar gelap. Tiap kartu: tanggal huruf kapital berjarak
   lebar (mono), judul tebal, garis aksen kecil di bawah.
5. **Garis kolom vertikal** tipis membelah seluruh halaman — ini ciri paling
   khas tata letak ASML.
6. Halaman detail: remah jejak → judul raksasa → baris pembuka
   *"PRESS RELEASE — VELDHOVEN, THE NETHERLANDS, JULY 15, 2026"* → ringkasan
   berbentuk butir → isi → blok *"About ASML"* yang bisa dibuka (tombol +) →
   blok **kontak media** berisi nama-nama orang.

Inti gayanya: **digerakkan tipografi, hampir tanpa foto, kaya ruang kosong,
tanggal sebagai elemen desain.**

### Tiga mockup yang dibuat

| Berkas | Nama | Ide |
|---|---|---|
| [`mockups/standalone/news-1-ruang.html`](../mockups/standalone/news-1-ruang.html) | **Ruang Berita** | Paling dekat ke ASML: hub 4 kolom + garis kolom vertikal + pita CTA + kartu putih di atas pita hijau tua |
| [`mockups/standalone/news-2-kronik.html`](../mockups/standalone/news-2-kronik.html) | **Kronik** | Daftar bertanggal seperti rilis kawat. Kolom tanggal mono di kiri, judul + ringkasan di kanan, dipisah garis rambut. Tanpa gambar |
| [`mockups/standalone/news-3-papan.html`](../mockups/standalone/news-3-papan.html) | **Papan Berita** | Paling ramah foto: satu berita utama besar + mosaik kartu, memakai kembali kosakata `.post` dari `/blog`, ditutup blok "Untuk media" |

Ketiganya memakai `app/kairos.css` **apa adanya** (tema produksi, sudah
termasuk blok Tampilan E), dibungkus `<div class="shell">` tanpa `data-hero`
supaya navbar-nya jadi pita hijau tua — sama seperti `/produk` dan `/blog`.
Gaya khusus halaman ada di blok `<style>` masing-masing berkas, persis pola
`blog.html`. **Tidak ada token, warna, atau huruf baru yang ditambahkan.**

### Keputusan yang masih perlu diambil user
- [ ] **Pilih satu dari tiga** (atau gabungan).
- [ ] **Berita vs Blog — apa bedanya?** Sekarang `/blog` sudah berisi tulisan
      teknis. Berita perlu tabel sendiri, atau cukup jadi kategori di dalam
      tabel `posts` yang ada? Ini menentukan besar pekerjaan Supabase-nya.
- [ ] **Halaman detail.** Di rekaman ASML, tiap berita punya halaman sendiri.
      Padahal `/blog` sampai sekarang **belum punya halaman detail** — kartunya
      masih `href="#"` (lihat sisa pekerjaan Bagian 7). Kalau Berita butuh
      halaman detail, `/blog/[slug]` sebaiknya dikerjakan sekalian.
- [ ] **"Berlangganan kabar"** — di mockup tombolnya belum mengarah ke mana
      pun. Perlu email/newsletter sungguhan, atau cukup diarahkan ke WhatsApp?
- [ ] **Menu utama jadi 5 item** (Produk · Industri · Berita · Blog · Tentang
      Kami) + tombol Minta Penawaran. Sempat dikhawatirkan sesak, tapi **sudah
      diperiksa dan ternyata muat** — lihat bagian Sudah diuji. Yang tersisa
      cuma keputusan urutannya: sekarang Berita ditaruh sebelum Blog.

### Perkiraan pekerjaan setelah desain dipilih
1. Tabel `news` (atau kolom `kind` di `posts`) + seed.
2. Route publik `/berita` yang dirender di server.
3. Halaman detail `/berita/[slug]` — dan kemungkinan `/blog/[slug]` sekalian.
4. Editor berita di `/admin`, mengikuti pola editor blog Bagian 7.
5. Tambah "Berita" ke navbar dan footer.

### Sudah diuji ✅
- **Sarang tag HTML** ketiga berkas: tidak ada tag menggantung atau salah tutup.
- **Semua kelas CSS** yang dipakai punya aturan (30 / 33 / 37 kelas), dan tidak
  ada aturan lokal yang tidak terpakai.
- Semua rujukan berkas (gambar, `kairos.css`, `kairos.js`) resolve.
- **Ketiganya dirender di Chrome headless** (1440 px) dan gambarnya diperiksa.

Dua cacat ketahuan dari render itu dan **sudah diperbaiki**:

1. **Mockup 1 — judul siaran pers putih di atas kartu putih.** `kairos.css`
   punya aturan `.sec--dark h3 { color: #fff }`. Kartu `.pr` berlatar putih
   tapi berada di dalam `.sec--dark`, jadi judulnya hilang sama sekali —
   kartunya cuma menampilkan tanggal. Ditambahi `color: var(--ink)`.
2. **Mockup 3 — baris tanggal di atas foto tidak terbaca.** Tirai gelapnya
   terlalu tipis di tengah (`.45`) sementara foto gudang di baliknya terang.
   Gradasinya dibuat empat henti dan digelapkan.

### Temuan sampingan: cacat di situs yang sudah live ⚠️
Saat merender mockup ini ketahuan bahwa
[`app/kairos.css:532`](../app/kairos.css#L532) menulis `.logo { color: #fff; }`
**tanpa pembatas apa pun**. Maksudnya untuk logo di navbar hijau tua, tapi
karena tidak dibatasi, aturan ini **ikut memutihkan logo di kaki halaman** yang
latarnya terang — kata "Kairos" jadi nyaris tidak terlihat, hanya "Baut" yang
kebaca karena warnanya disetel terpisah.

Ini **bukan** akibat mockup berita; berlaku juga di `/`, `/produk`, dan `/blog`
yang sudah live sekarang.

> **SUDAH DIPERBAIKI 2026-09-08** atas persetujuan user — lihat Bagian 9.

### Lebar layar — sudah diperiksa ✅
Dirender pada 500 / 768 / 1024 / 1060 / 1100 / 1280 / 1440 px.

- **Tidak ada luberan mendatar di lebar mana pun** — lebar konten selalu persis
  sama dengan lebar viewport di ketiga berkas.
- **Kekhawatiran menu 5 item tidak terbukti.** `nav.main` baru muncul di atas
  1000 px (`kairos.css` baris 168). Diperiksa pada 1001 px — titik paling
  sesak yang mungkin — keenam butir masih muat lega. Di bawahnya sudah jadi
  menu burger.

Catatan alat: Chrome headless di macOS **memaksa lebar jendela minimum 500 px**.
Permintaan 390 px atau 430 px tetap dirender 500 px lalu dipotong, jadi
tangkapan layarnya tampak terpotong padahal halamannya baik-baik saja.
Lebar di bawah 500 px belum benar-benar teruji.

### Belum diuji ⚠️
- **Interaksinya**: menu burger, hover kartu, navbar memadat saat digulir.
- Isi beritanya **karangan** untuk keperluan tata letak. Judul, tanggal, dan
  nama kontak media harus diganti data sungguhan sebelum dipakai.

> Catatan 2026-09-08: lebar 390 px akhirnya **sudah teruji**. Batas jendela
> 500 px pada Chrome headless diakali dengan memuat halamannya di dalam
> `<iframe>` selebar 390 px — bingkai punya viewport sendiri, jadi media query
> di dalamnya benar-benar dinilai pada 390 px. Hasil: tidak ada luberan
> mendatar, ketiga mockup rapi. Satu penyesuaian: baris tanggal di atas foto
> pada mockup 3 diberi `text-shadow` karena di layar sempit blok teksnya
> meninggi sampai ke bagian foto yang terang.


---

## BAGIAN 9 — Gambar unggahan: potong otomatis + perbaikan logo (2026-09-08)

### Masalah yang dilaporkan user
> "uploading images in admin does not fix the size so when displayed its bad
> in the catalog"

Ditelusuri: **bukan** soal rasio kotaknya. Kotak tampilan sudah 4:3 sejak awal
(`app/produk/produk.css` baris 105 & 111). Dua hal lain biang keroknya:

1. **`object-fit: contain`** pada `.mini`, `.dshot`, `.dthumb`. `contain`
   memuat seluruh foto lalu menyisakan pinggiran kosong begitu rasio foto ≠
   rasio kotak. Foto potret tampil sebagai jalur sempit di tengah.
   Diperparah: **`.mini` berukuran 54×38 px (≈1,42), bukan 4:3** — foto yang
   rasionya sudah benar pun tetap bergaris kosong di baris katalog.
2. **Tidak ada pemrosesan apa pun saat unggah.** `lib/storage.ts` cuma
   memeriksa MIME dan batas 10 MB. Foto ponsel 4000×3000 belasan MB dikirim
   apa adanya ke setiap pengunjung.

### Keputusan — sempat berubah, ini yang final
Mula-mula user memilih **menolak** foto berasio salah. Sudah diterapkan penuh
lalu **dibatalkan pada hari yang sama** setelah user bertanya balik "whats the
fix then?" dan meminta dikerjakan sesuai rekomendasi.

Alasan pembatalannya penting dan jangan diulang: **menolak tidak memperbaiki
apa pun.** Begitu tampilannya `object-fit: cover`, foto berasio apa pun
sebenarnya sudah tampil rapi — kotaknya terisi penuh, tidak ada pinggiran
kosong. Jadi penolakan hanya menghalangi pekerjaan tanpa membuat hasilnya
lebih baik, padahal foto pemasok datang dalam segala rasio.

**Yang berlaku sekarang:** rasio apa pun diterima, dipotong otomatis dari
tengah ke rasio slot. Satu rasio per slot, **tidak ada slot 1:1** — rasio
khusus per kategori akan membuat grid katalog tinggi-rendah dan justru
mengembalikan masalah pinggiran kosong yang sedang diperbaiki.

Yang **masih** ditolak cuma dua, keduanya tidak bisa diperbaiki dengan
memotong:
- berkas yang tidak terbaca sebagai gambar;
- foto yang **setelah dipotong** lebarnya di bawah `minLebar` — hasilnya pasti
  pecah. Perhatikan: yang dinilai lebar SETELAH potong, bukan lebar mentah.
  Panorama 4000×800 ditolak karena hanya menyisakan 1066 px.

### Yang dikerjakan

| Berkas | Isi |
|---|---|
| `lib/image-specs.ts` **(baru)** | Tabel aturan, `periksaUkuran()`, `ukuranHasil()`, `akanDipotong()`. Tanpa sharp/`server-only`, jadi **boleh diimpor komponen klien** |
| `lib/image-rules.ts` **(baru)** | `siapkanGambar()` — luruskan EXIF, potong tengah, susutkan, ubah ke WebP |
| `components/useGambarTerpilih.ts` **(baru)** | Kail bersama kedua formulir: pratinjau + hitung ukuran akhir |
| `lib/storage.ts` | `unggah()` menerima `Buffer` + `contentType`; `buatPath()` menerima ekstensi |
| `app/admin/*/actions.ts` | Panggil `siapkanGambar` sebelum apa pun ditulis |
| `ProductPhotos.tsx`, `MediaCard.tsx` | Syarat ditulis di muka; kotak pratinjau pakai rasio slot + `cover`; keterangan pemotongan |
| `app/produk/produk.css` | `object-fit: contain` → **`cover`** |
| `app/kairos.css` | `.logo { color:#fff }` → **`header .logo`** (cacat Bagian 8) |
| `package.json` | **sharp jadi dependensi langsung** (tadinya cuma opsional bawaan Next — bisa terpangkas saat deploy) |

### Rasio per slot
Angkanya mengikuti kotak yang sudah ada di CSS — bukan angka baru.

| Slot | Dipotong ke | Lebar min | Maks |
|---|---|---|---|
| Foto produk (produk/teknis/kemasan) | **4:3** | 1200 | 1600 |
| `hero` | 3:2 | 2000 | 2400 |
| `gudang` | 2:1 | 2000 | 2400 |
| `industri-bg` | 16:9 | 2000 | 2400 |
| `industri-*` (4 panel) | 4:3 | 1200 | 1600 |
| `logo-*` | **tidak dipotong** | 120 | 900 |

Logo dibebaskan: wordmark lebarnya berbeda-beda dan tampil `contain` di
marquee. Menguncinya merusak barisan.

### Tiga keputusan teknis yang perlu diingat
1. **Potong dari TENGAH, bukan `attention`/`entropy` milik sharp.** Strategi
   pintar itu hasilnya tidak bisa ditebak, sehingga kotak pratinjau jadi
   bohong. Tengah bisa ditebak, jadi pratinjau = hasil. Ini diuji.
2. **Orientasi EXIF — nyaris jadi bug.** Foto potret dari ponsel sering
   *disimpan* mendatar (4032×3024) disertai penanda "putar 90°". Kalau yang
   dinilai angka mentahnya, foto potret dianggap sudah 4:3, lalu `.rotate()`
   memutarnya jadi 3:4 di penyimpanan. `siapkanGambar` menukar lebar/tinggi
   dulu kalau `orientation >= 5`.
3. **Toleransi 1%** supaya 1601×1200 tidak dianggap "perlu dipotong".

### Sudah diuji ✅
- **22/22 uji** pada gambar yang dibuat sungguhan: 4:3, potret 3:4, 16:9,
  panorama 4:1, keempat slot situs, logo, EXIF, berkas sampah, terlalu kecil.
- **Pratinjau = hasil**: `ukuranHasil()` dibandingkan dengan keluaran sharp
  yang sebenarnya pada 4 kasus — sama persis, sampai pikselnya.
- **Uji ujung-ke-ujung ke Supabase sungguhan** (Node 22): foto potret
  3024×4032 → diproses 1600×1200 WebP → diunggah → diambil kembali lewat URL
  publik → terverifikasi 4:3, bait identik → berkas uji dihapus lagi.
  Ini sekaligus membuktikan `unggah()` bekerja dengan `Buffer` (dulu `File`).
- Berat: **13,9 MB → 804 KB**.
- `npx tsc --noEmit` bersih; `npx next build` sukses.
- **sharp tidak ikut ke bundle browser**; `image-specs.ts` memang ikut.
- Halaman admin dirender sungguhan (sesi dibuat sendiri lewat HMAC):
  `/admin/foto` menampilkan syarat yang benar per slot, **7 kotak pratinjau
  ber-`aspect-ratio`** + **4 slot logo** ber-`contain`; `/admin/produk/hex-bolt`
  menampilkan syarat 4:3 dan 3 tombol unggah mati sebelum berkas dipilih.
- **Logo kaki halaman diperiksa di aplikasi yang berjalan** — terbaca
  "KairosBaut" bertinta gelap, logo navbar tetap putih.
- Tidak ada regresi halaman publik: `git diff` menunjukkan **tidak satu pun**
  berkas TSX/kueri halaman publik berubah — hanya dua deklarasi CSS.

### BELUM diuji ⚠️
- **Belum ada foto yang diunggah lewat browser sungguhan.** Server Action tidak
  bisa dipicu dengan curl (butuh muatan RSC), jadi yang teruji adalah seluruh
  jalur pemrosesan + penyimpanan, **bukan klik tombolnya**. Yang perlu dicoba:
  1. Pilih foto potret dari ponsel → pratinjau harus langsung memperlihatkan
     potongan 4:3, dan muncul keterangan "akan dipotong … tersimpan 1600×1200".
  2. Unggah → cek `/produk`: baris katalog dan ketiga thumbnail di dialog.
  3. Coba foto kecil (mis. 800 px) → harus ditolak dengan pesan yang jelas.
  4. Coba logo klien → tidak boleh terpotong.
- **Foto lama sebelum aturan ini tidak ikut diperbaiki.** Saat ini
  `product_photos` masih kosong, jadi belum mendesak. Kalau nanti ada, harus
  diunggah ulang — tidak ada migrasi otomatis.
- Batas unggahan tetap **10 MB** (`periksaBerkas` + `serverActions.bodySizeLimit`).
  Karena berkas sekarang disusutkan di server, batas ini bisa dinaikkan supaya
  foto ponsel besar tidak ditolak sebelum sempat disusutkan.
  **Belum dilakukan — menunggu keputusan user.**
- **Node lokal 20.20.2 padahal `.nvmrc`/`engines` minta 22.** Sudah terbukti
  menggigit: `@supabase/supabase-js` gagal di Node 20 ("native WebSocket not
  found"), uji ujung-ke-ujung baru jalan setelah `nvm use 22`. Sebaiknya
  `nvm use` dibiasakan sebelum kerja di repo ini.


---

## Berita masuk ke situs — sebagai PEMILIH, bukan halaman jadi (2026-09-08)

User minta ketiga rancangan bisa dilihat di server utama supaya gampang
dipilih: *"just add a news in navbar and when clicked shows 3 different news
mockup"* dan *"no need hard building just to show later we pick one"*.

Jadi **sengaja dibuat seringan mungkin**: tanpa tabel Supabase, tanpa halaman
detail, tanpa saring yang benar-benar bekerja. Semua tautan masih `href="#"`,
sama seperti mockup.

### Route baru
| Route | Isi |
|---|---|
| `/berita` | Halaman pemilih — tiga kartu rancangan |
| `/berita/ruang` | Rancangan 1 · Ruang Berita |
| `/berita/kronik` | Rancangan 2 · Kronik |
| `/berita/papan` | Rancangan 3 · Papan Berita |

- `lib/data/news.ts` — isi contoh (9 berita, 4 kategori, kontak media).
  **Semua teksnya karangan.**
- `app/berita/Switch.tsx` — batang pembanding di atas tiap rancangan.
- "Berita" ditambahkan ke navbar (`components/Header.tsx`, `NavKey` dapat
  nilai `'berita'`) dan ke kaki halaman.

### Satu jebakan yang perlu diingat: CSS Next itu global
Rancangan "Papan Berita" memakai nama kelas **`.post`, `.art`, `.meta`** —
persis nama yang dipakai `blog.css` dengan aturan berbeda. `.phead` dan
`.crumbs` juga sudah ada di `blog.css` dan `produk.css`.

CSS di App Router tidak ter-scope per route; kalau pengunjung berpindah dari
/blog ke /berita tanpa muat ulang, kedua stylesheet bisa hidup bersamaan dan
halaman Blog rusak diam-diam.

**Karena itu seluruh isi `app/berita/berita.css` dibungkus kelas induk**
(`.brt`, `.brt-ruang`, `.brt-kronik`, `.brt-papan`) — satu-satunya perubahan
dari mockup. Diperiksa: tidak ada satu pun aturan di berkas itu yang tidak
diawali `.brt`.

### Sudah diuji ✅
- `npx next build` sukses; keempat route berstatus **statis**.
- Ketujuh route menjawab 200 (`/`, `/produk`, `/blog`, `/berita` + 3 rancangan).
- Ketiga rancangan dirender di browser dan dilihat — tampil sesuai mockup,
  batang pembanding bekerja, "Berita" bergaris hijau di navbar.
- **`/blog` diperiksa ulang setelah perubahan — utuh**, gambar vektor dan
  kartunya tidak terpengaruh. Ini yang paling dikhawatirkan.

### Kalau satu rancangan sudah dipilih
1. Pindahkan isi rancangan yang menang ke `app/berita/page.tsx`.
2. Hapus dua folder rancangan yang kalah + `Switch.tsx` + blok `.brt-switch`.
3. Baru putuskan soal Supabase: tabel `news` sendiri, atau kolom `kind` di
   `posts` (lihat pertanyaan terbuka di Bagian 8).
