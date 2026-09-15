import AdminBar from '../AdminBar';
import ProyekForm from './ProyekForm';
import ProyekBaru from './ProyekBaru';
import { createAdminClient } from '@/lib/supabase/admin';
import { storageUrl } from '@/lib/supabase/public';
import { PROYEK, SEKTOR, type Proyek } from '@/lib/data/projects';

export const dynamic = 'force-dynamic';

type Row = {
  slug: string; nama: string; sektor: string; ringkas: string;
  alt: string; storage_path: string | null; urutan: number; published: boolean;
};

export default async function AdminIndustri() {
  const db = createAdminClient();

  /* Tanpa filter `published` — backoffice harus melihat yang disembunyikan
     juga, tidak seperti halaman publik. */
  const { data, error } = await db
    .from('projects')
    .select('slug,nama,sektor,ringkas,alt,storage_path,urutan,published')
    .order('urutan');

  const belumMigrasi = !!error || (data ?? []).length === 0;

  const baris: Array<{ p: Proyek; terbit: boolean }> = belumMigrasi
    ? PROYEK.map((p) => ({ p, terbit: true }))
    : (data as Row[]).map((r) => ({
        p: {
          slug: r.slug, nama: r.nama, sektor: r.sektor as Proyek['sektor'],
          ringkas: r.ringkas, alt: r.alt, urutan: r.urutan,
          foto: r.storage_path
            ? storageUrl('site-photos', r.storage_path)
            : `/img/proyek/${r.slug}.jpg`,
        },
        terbit: r.published,
      }));

  /* Saran sektor = yang sudah dipakai + daftar awal, supaya mengetik sektor
     baru tetap boleh tapi yang lama gampang dipilih ulang. */
  const sektorAda = [...new Set([...baris.map((b) => b.p.sektor), ...SEKTOR])].sort();

  return (
    <div className="adm">
      <AdminBar current="industri" />
      <div className="adm-main">
        <h1>Industri &amp; proyek.</h1>
        <p className="lede">
          Daftar proyek di <a href="/industri" target="_blank">/industri</a>. Boleh ditambah,
          diubah urutannya, dan dihapus — tidak seperti halaman Tentang Kami yang bagiannya tetap.
        </p>

        {belumMigrasi && (
          <div className="adm-warn" role="alert">
            <b>Belum bisa disimpan — satu langkah manual masih kurang.</b>
            <p>
              Tabel <code>projects</code> belum ada di Supabase. Jalankan berkas{' '}
              <code>supabase/migrations/0003_proyek.sql</code> di SQL editor Supabase, lalu
              muat ulang halaman ini.
            </p>
            <p>
              Sementara itu <code>/industri</code> <b>tetap tampil normal</b> memakai ke-13 proyek
              bawaan beserta fotonya dari company profile.
            </p>
          </div>
        )}

        {!belumMigrasi && <ProyekBaru sektorAda={sektorAda} />}

        <section className="adm-group">
          <h2>{baris.length} proyek</h2>
          <div className="adm-proyeks">
            {baris.map(({ p, terbit }) => (
              <ProyekForm key={p.slug} proyek={p} sektorAda={sektorAda} terbit={terbit} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
