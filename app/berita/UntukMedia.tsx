import { getKontakMedia, getTeksBerita } from '@/lib/queries';

/* Blok "Untuk media" — dipakai halaman /berita dan setiap artikel.
   Markup-nya sama persis dengan rancangan Papan Berita; isinya dari
   site_settings (n_media_*, n_berkas_*, n_langganan_*) dan press_contacts.
   Kartu tambahan yang tautannya dikosongkan admin tidak dirender. */
export default async function UntukMedia() {
  const [t, kontak] = await Promise.all([getTeksBerita(), getKontakMedia()]);

  const kartu = [
    { judul: t('n_berkas_judul'), isi: t('n_berkas_isi'), href: t('n_berkas_tautan') },
    { judul: t('n_langganan_judul'), isi: t('n_langganan_isi'), href: t('n_langganan_tautan') },
  ].filter((k) => k.href);

  return (
    <section className="sec sec--dark">
      <div className="wrap">
        <div className="sechead">
          <p className="eyebrow">{t('n_media_eyebrow')}</p>
          <h2>{t('n_media_judul')}</h2>
          <p className="lede">{t('n_media_lede')}</p>
        </div>
        <div className="press">
          {kontak.map((k) => (
            <a key={k.id} href={`mailto:${k.surel}`}>
              <h3>{k.nama}</h3>
              <p>
                {k.peran}
                <br />
                {k.surel}
                {k.telepon && (
                  <>
                    <br />
                    {k.telepon}
                  </>
                )}
              </p>
              <i aria-hidden="true" />
            </a>
          ))}
          {kartu.map((k) => (
            <a key={k.judul} href={k.href}>
              <h3>{k.judul}</h3>
              <p>{k.isi}</p>
              <i aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
