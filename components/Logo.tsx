import Link from 'next/link';
import { getMerek } from '@/lib/queries';

/* `latar` memilih berkas logo yang diunggah: navbar selalu gelap, kaki
   halaman dan kartu login terang. Selama slotnya kosong, gambar vektor lama
   yang tampil — warnanya ikut `currentColor`, jadi cocok di dua latar.

   Teks merek tetap dirender di samping gambar unggahan; kalau kedua bagian
   dikosongkan di /admin/pengaturan, hanya gambarnya yang tampil. */
export default async function Logo({
  ariaLabel,
  latar = 'terang',
}: {
  ariaLabel?: string;
  latar?: 'gelap' | 'terang';
}) {
  const m = await getMerek();
  const gambar = latar === 'gelap' ? m.gelap : m.terang;
  const adaTeks = !!(m.depan || m.belakang);

  return (
    <Link className="logo" href="/" aria-label={ariaLabel}>
      {gambar ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className="logo-img" src={gambar} alt={adaTeks ? '' : m.alt} />
      ) : (
        <svg width="30" height="26" viewBox="0 0 30 26" fill="none" aria-hidden="true">
          <path d="M2 24 L9 6 L14 16 L18 9 L28 24 Z" fill="#1E9E4A" />
          <path d="M13.5 1 L20 3.2 L13.5 5.4 Z" fill="currentColor" />
          <rect x="13" y="1" width="1.2" height="6" fill="currentColor" />
        </svg>
      )}
      {adaTeks && (
        <b>
          {m.depan}
          {m.belakang && <i>{m.belakang}</i>}
        </b>
      )}
    </Link>
  );
}
