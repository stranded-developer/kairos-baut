import type { Metadata } from 'next';
import './kairos.css';
import { getSettings } from '@/lib/queries';
import { pasanganFont } from '@/lib/data/home';

export const metadata: Metadata = {
  metadataBase: new URL('https://kairosbaut.com'),
  title: 'Kairos Baut — Distributor Baut & Mur Industri Indonesia',
  description:
    'PT Kairos Multi Sejahtera — 2.400 item baut, mur, dan ring siap kirim ke 34 provinsi, lengkap dengan mill certificate.',
};

/* <html> dan <body> hanya boleh dirender di sini. Penanda hero yang dulu ada
   di <body data-hero> pindah ke <div class="shell" data-hero> pada tiap
   halaman — lihat catatan di bagian TAMPILAN E pada kairos.css.

   Pasangan font dipilih di /admin/beranda. Pilihan bawaan ('archivo')
   sengaja TIDAK memasang gaya inline apa pun, jadi kairos.css yang berlaku
   persis seperti mockup; pasangan lain menimpa --sans dan --mono. */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const font = pasanganFont((await getSettings()).font);
  const gaya =
    font.id === 'archivo'
      ? undefined
      : ({ '--sans': font.sans, '--mono': font.mono } as React.CSSProperties);

  return (
    <html lang="id" style={gaya}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={font.url} />
      </head>
      <body>{children}</body>
    </html>
  );
}
