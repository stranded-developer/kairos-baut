import AdminBar from '../AdminBar';
import SetelanForm, { type Setelan } from './SetelanForm';
import MediaCard, { type Slot } from '../foto/MediaCard';
import { createAdminClient } from '@/lib/supabase/admin';
import { storageUrl } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

/* ============================================================================
   Backoffice pengaturan situs — kontak, WhatsApp, kaki halaman.

   Daftar kunci dan labelnya datang dari tabel (di-seed 0005), jadi menambah
   pengaturan baru cukup lewat migrasi + lib/data/settings.ts.
   ========================================================================= */

type Row = Setelan & { grp: string };

export default async function AdminPengaturan() {
  const db = createAdminClient();
  const [{ data, error }, { data: media }] = await Promise.all([
    db.from('site_settings').select('key,label,grp,value,note').order('sort_order'),
    db.from('site_media').select('key,label,grp,alt,note,storage_path').like('key', 'merek-%').order('sort_order'),
  ]);

  /* Dua slot logo (0007). Kartunya MediaCard milik /admin/foto apa adanya —
     slot ini juga tampil di sana, di grup "Logo situs". */
  const slotLogo: Slot[] = (media ?? []).map((r) => ({
    key: r.key, label: r.label, grp: r.grp, alt: r.alt, note: r.note,
    src: r.storage_path ? storageUrl('site-photos', r.storage_path) : '',
    fallback: !r.storage_path,
  }));

  /* Naskah beranda (b_*) dan font ada di /admin/beranda, naskah berita (n_*)
     di /admin/berita — tidak ditampilkan dua kali di sini. */
  const rows = ((data ?? []) as Row[]).filter(
    (r) => !r.key.startsWith('b_') && !r.key.startsWith('n_') && r.key !== 'font'
  );
  const belumMigrasi = !!error || rows.length === 0;

  /* sort_order hanya berlaku DI DALAM kelompok (tiap kelompok mulai dari 1),
     jadi urutan kelompoknya ditetapkan di sini. Kelompok baru yang belum
     disebut jatuh ke belakang. */
  const URUT = ['Navbar & logo', 'Kontak', 'Kaki halaman'];
  const pos = (g: string) => (URUT.indexOf(g) + 1 || 99);
  const grup = new Map<string, Setelan[]>();
  for (const r of [...rows].sort((x, y) => pos(x.grp) - pos(y.grp))) {
    if (!grup.has(r.grp)) grup.set(r.grp, []);
    grup.get(r.grp)!.push(r);
  }

  return (
    <div className="adm">
      <AdminBar current="pengaturan" />
      <div className="adm-main">
        <h1>Kontak, logo &amp; kaki halaman.</h1>
        <p className="lede">
          Nomor WhatsApp, telepon, email, alamat, jam kerja, dan logo. Kontak tampil di blok
          Penawaran beranda, kaki halaman semua halaman, dan tombol WhatsApp — cukup diubah
          sekali di sini.
        </p>

        {belumMigrasi && (
          <div className="adm-warn" role="alert">
            <b>Belum bisa disunting — satu langkah manual masih kurang.</b>
            <p>
              Tabel <code>site_settings</code> belum ada di Supabase. Jalankan berkas{' '}
              <code>supabase/migrations/0005_pengaturan.sql</code> di SQL editor Supabase,
              lalu muat ulang halaman ini.
            </p>
            <p>
              Sementara itu situs <b>tetap tampil normal</b> memakai kontak yang sama seperti
              sebelumnya.
            </p>
          </div>
        )}

        <div className="adm-bloks">
          {[...grup].map(([judul, items]) => (
            <SetelanForm key={judul} judul={judul} items={items} />
          ))}
        </div>

        <section className="adm-group">
          <h2>Gambar logo</h2>
          {slotLogo.length === 0 ? (
            <p className="adm-note-sm">
              Slot logonya dibuat oleh migrasi <code>0007_merek.sql</code> — belum ada. Sampai itu
              dijalankan, gambar vektor bawaan yang tampil.
            </p>
          ) : (
            <div className="adm-medias">
              {slotLogo.map((s) => (
                <MediaCard key={s.key} slot={s} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
