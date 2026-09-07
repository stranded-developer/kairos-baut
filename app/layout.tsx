import type { Metadata } from 'next';
import './kairos.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://kairosbaut.com'),
  title: 'Kairos Baut — Distributor Baut & Mur Industri Indonesia',
  description:
    'PT Kairos Multi Sejahtera — 2.400 item baut, mur, dan ring siap kirim ke 34 provinsi, lengkap dengan mill certificate.',
};

/* <html> dan <body> hanya boleh dirender di sini. Penanda hero yang dulu ada
   di <body data-hero> pindah ke <div class="shell" data-hero> pada tiap
   halaman — lihat catatan di bagian TAMPILAN E pada kairos.css. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400..800&family=Roboto+Mono:wght@400..600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
