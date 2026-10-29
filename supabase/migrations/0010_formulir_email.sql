-- ===========================================================================
-- Kiriman formulir penawaran ke email (Resend). 2026-10-28
-- Butuh 0005 (site_settings) dan 0008 (naskah beranda) sudah dijalankan.
--
-- Dua baris baru:
--   email_penawaran — penerima kiriman formulir, diatur di /admin/pengaturan.
--                     Kosong = dikirim ke `email` (kontak umum), jadi
--                     formulir sudah berfungsi meski baris ini belum diisi.
--   b_form_gagal    — pesan di formulir kalau pengiriman gagal, diatur di
--                     /admin/beranda → Formulir penawaran. Isinya sama dengan
--                     lib/data/home.ts (0008 juga sudah dibuat ulang memuatnya,
--                     untuk basis data baru).
--
-- Aman dijalankan berulang.
-- ===========================================================================

insert into public.site_settings (key, label, grp, value, note, sort_order) values
  ('email_penawaran', 'Email penerima', 'Formulir penawaran', '',
   'Permintaan dari formulir penawaran di beranda dikirim ke sini. Boleh beberapa alamat, pisahkan dengan koma. Kosongkan = dikirim ke Email di kelompok Kontak.', 1),
  ('b_form_gagal', 'Pesan kalau pengiriman gagal', 'Beranda · Formulir penawaran',
   'Gagal mengirim. Coba lagi sebentar, atau hubungi kami lewat WhatsApp.', '', 19)
on conflict (key) do nothing;
