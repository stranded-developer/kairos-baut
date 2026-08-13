# Gambar beranda

Folder: `mockups/standalone/img/`

Nama berkas di bawah ini **harus sama persis** dengan yang tertulis di
`index.html`. Kalau berkas diganti nama, ubah juga `src`-nya di HTML —
kalau tidak, slotnya otomatis kembali ke grafik vektor cadangan (halaman
tetap utuh, hanya tanpa foto).

## Sudah terpasang

| Berkas | Dipakai di | Ukuran asli |
|---|---|---|
| `hero.jpeg` | Hero beranda, kolom kanan | 754 × 407 |
| `gudang.jpg` | Bagian "Tentang Kami" | 740 × 404 |
| `machinery.jpg` | Panel Industri 01 — Mesin produksi, **dan** latar pita Industri | 1200 × 900 |
| `automotive.jpg` | Panel Industri 02 — Otomotif | 1600 × 1061 |
| `konstruski.jpeg` | Panel Industri 03 — Konstruksi | 738 × 415 |
| `electrical.jpeg` | Panel Industri 04 — Kelistrikan | 678 × 452 |

## Belum ada

**Logo klien** — subfolder `logo/`, nama harus persis:

- `logo/adhi-karya.png`
- `logo/karya-logam-agung.png`
- `logo/ihi-power-electric.png`
- `logo/wijaya-karya.png`

PNG latar transparan atau SVG (kalau SVG, ubah `.png` jadi `.svg` di
`index.html`). Tinggi minimum 120 px. Ditampilkan hitam-putih, lalu berwarna
penuh saat disorot. Selama belum ada, nama perusahaan yang tampil sebagai
teks — seperti mockup sebelumnya. **Pastikan ada izin dari klien untuk
menampilkan logonya.**

**Latar khusus pita Industri** — sementara memakai ulang `machinery.jpg`.
Berfungsi karena digelapkan ±94% sehingga hanya terbaca sebagai tekstur,
tapi foto khusus selebar ~2400 px akan lebih tajam. Kalau nanti ada, taruh
sebagai `industri-bg.jpg` lalu ubah satu baris di `index.html`:

```html
<section class="sec sec--dark" id="industri" style="--sec-photo: url('img/machinery.jpg')">
```

## Catatan resolusi

`hero.jpeg` (754 px) dan `gudang.jpg` (740 px) adalah dua foto paling
menonjol di halaman, tapi resolusinya paling kecil. Di layar biasa hasilnya
sudah oke; di layar Retina/4K akan terlihat agak lembut karena diperbesar
~1,6×. Kalau ada versi yang lebih besar (≥1600 px untuk hero, ≥2000 px untuk
gudang), tinggal timpa berkasnya — nama dan kode tidak perlu diubah.

Rasio bingkai sudah disetel mengikuti foto yang ada sekarang (hero 3:2,
gudang 2:1) supaya pemotongan seminimal mungkin. Foto dipotong dari tengah,
jadi subjek utama sebaiknya di tengah bingkai.

## Belum tergarap

Foto produk per item di `produk.html` masih memakai gambar vektor. Butuh
±9 foto produk dengan latar putih — sebaiknya dikerjakan terpisah.
