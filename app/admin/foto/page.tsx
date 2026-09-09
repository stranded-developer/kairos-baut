import AdminBar from '../AdminBar';
import MediaCard, { type Slot } from './MediaCard';
import { createAdminClient } from '@/lib/supabase/admin';
import { storageUrl } from '@/lib/supabase/public';
/* Peta cadangan diimpor, tidak disalin — dulu ada dua salinan dan sempat
   berbeda isinya. */
import { CADANGAN } from '@/lib/queries';

export const dynamic = 'force-dynamic';

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
