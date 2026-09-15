-- ===========================================================================
-- Rincian proyek — 2026-09-15
--
-- KENAPA KOSONG SEMUA. Halaman "OUR PROJECTS" di public/KAIROS 2.pdf hanya
-- memuat FOTO dan NAMA proyek — tidak ada tanggal, lokasi, pemberi kerja,
-- lingkup, maupun keterangan apa pun. Sudah diperiksa dua cara: halamannya
-- di-zoom dan dibaca, lalu `pdftotext` dijalankan pada halaman 11–14 dan
-- hasilnya kosong sama sekali (halamannya memang gambar gepeng).
--
-- Jadi kolom-kolom di bawah ini sengaja dibuat KOSONG. Mengisinya dari sini
-- berarti mengarang. Yang dibangun adalah tempatnya; isinya diketik admin
-- lewat /admin/industri, dan halaman publik hanya menampilkan kolom yang
-- benar-benar terisi.
-- ===========================================================================

alter table public.projects add column if not exists lokasi  text not null default '';
alter table public.projects add column if not exists tahun   text not null default '';
alter table public.projects add column if not exists klien   text not null default '';
alter table public.projects add column if not exists lingkup text not null default '';
-- Uraian panjang; paragraf dipisah baris kosong, sama seperti about_blocks.
alter table public.projects add column if not exists body    text not null default '';
