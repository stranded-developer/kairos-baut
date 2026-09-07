import AdminBar from '../AdminBar';
import MediaCard, { type Slot } from './MediaCard';
import { createAdminClient } from '@/lib/supabase/admin';
import { storageUrl } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

/* Cadangan di /public/img — sama persis dengan yang dipakai lib/queries.ts.
   Selama slot belum ada unggahan, inilah yang tampil di situs. */
const CADANGAN: Record<string, string> = {
  'hero': '/img/hero.jpeg',
  'gudang': '/img/gudang.jpg',
  'industri-bg': '/img/machinery.jpg',
  'industri-machinery': '/img/machinery.jpg',
  'industri-automotive': '/img/automotive.jpg',
  'industri-konstruksi': '/img/konstruski.jpeg',
  'industri-electrical': '/img/electrical.jpeg',
  'logo-adhi-karya': '/img/logo/adhi-karya.png',
  'logo-karya-logam-agung': '/img/logo/karya-logam-agung.png',
  'logo-ihi-power-electric': '/img/logo/ihi-power-electric.png',
  'logo-wijaya-karya': '/img/logo/wijaya-karya.png',
};

export default async function AdminFoto() {
  const db = createAdminClient();
  const { data } = await db
    .from('site_media')
    .select('key,label,grp,alt,note,storage_path,sort_order')
    .order('sort_order');

  const slots: Slot[] = (data ?? []).map((r) => ({
    key: r.key,
    label: r.label,
    grp: r.grp,
    alt: r.alt,
    note: r.note,
    src: r.storage_path ? storageUrl('site-photos', r.storage_path) : (CADANGAN[r.key] ?? ''),
    fallback: !r.storage_path,
  }));

  const grup = [...new Set(slots.map((s) => s.grp))];

  return (
    <div className="adm">
      <AdminBar current="foto" />
      <div className="adm-main">
        <h1>Foto situs.</h1>
        <p className="lede">
          Slotnya tetap — yang diganti hanya fotonya. Selama sebuah slot belum
          diisi, situs memakai gambar cadangan, jadi tata letak tidak pernah
          kosong.
        </p>

        {grup.map((g) => (
          <section key={g} className="adm-group">
            <h2>{g}</h2>
            <div className="adm-medias">
              {slots.filter((s) => s.grp === g).map((s) => (
                <MediaCard key={s.key} slot={s} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
