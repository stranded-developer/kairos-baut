import type { ReactNode } from 'react';
import Header, { type NavKey } from './Header';
import Footer from './Footer';
import WhatsAppFab from './WhatsAppFab';
import SiteChrome from './SiteChrome';

/* `hero` menandai halaman yang punya hero foto (baru beranda). Penanda inilah
   yang membedakan navbar melayang transparan dari navbar pita hijau tua —
   lihat blok TAMPILAN E pada kairos.css. */
export default function Shell({
  hero = false,
  current = null,
  children,
}: {
  hero?: boolean;
  current?: NavKey;
  children: ReactNode;
}) {
  return (
    <div className="shell" {...(hero ? { 'data-hero': '' } : {})}>
      <SiteChrome />
      <a className="skip" href="#main">
        Lompat ke konten
      </a>
      <Header home={hero} current={current} />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
