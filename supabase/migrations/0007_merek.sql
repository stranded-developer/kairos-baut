-- ===========================================================================
-- Logo & teks merek di navbar dan kaki halaman. 2026-10-28
-- Butuh 0005 (site_settings) sudah dijalankan.
--
-- Teks merek = dua bagian, karena tampilannya dua warna: "Kairos" (putih di
-- navbar, tinta di kaki halaman) + "Baut" (hijau).
--
-- Gambar logo = DUA slot site_media, karena latar navbar selalu gelap dan
-- kaki halaman selalu terang — satu berkas tidak bisa terbaca di keduanya.
-- Slot kosong = gambar vektor gunung-dan-bendera yang lama tetap dipakai.
-- ===========================================================================

insert into public.site_settings (key, label, grp, value, note, sort_order) values
  ('merek_depan', 'Teks merek — bagian pertama', 'Navbar & logo', 'Kairos',
   'Warna putih di navbar, hitam di kaki halaman.', 1),
  ('merek_belakang', 'Teks merek — bagian kedua', 'Navbar & logo', 'Baut',
   'Warna hijau. Kosongkan kedua bagian kalau logo yang diunggah sudah memuat nama — maka hanya gambarnya yang tampil.', 2)
on conflict (key) do nothing;

insert into public.site_media (key, label, grp, alt, note, sort_order) values
  ('merek-gelap', 'Logo untuk latar gelap (navbar)', 'Logo situs', 'Kairos Baut',
   'Tampil di navbar hijau tua dan di atas foto beranda. Pakai versi putih/terang, PNG atau SVG berlatar transparan. Kosong = gambar vektor bawaan.', 30),
  ('merek-terang', 'Logo untuk latar terang (kaki halaman)', 'Logo situs', 'Kairos Baut',
   'Tampil di kaki halaman yang berlatar putih. Pakai versi berwarna/gelap. Kosong = gambar vektor bawaan.', 31)
on conflict (key) do nothing;
