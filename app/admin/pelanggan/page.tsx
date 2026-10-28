import AdminBar from '../AdminBar';
import PelangganForm, { type BarisPelanggan } from './PelangganForm';
import PelangganBaru from './PelangganBaru';
import { createAdminClient } from '@/lib/supabase/admin';
import { storageUrl } from '@/lib/supabase/public';
import { PELANGGAN_BAWAAN } from '@/lib/data/clients';

export const dynamic = 'force-dynamic';

type Row = { id: string; nama: string; storage_path: string | null; urutan: number; published: boolean };

export default async function AdminPelanggan() {
  const db = createAdminClient();
  /* Tanpa filter `published` — backoffice harus melihat yang disembunyikan juga. */
  const { data, error } = await db
    .from('clients')
    .select('id,nama,storage_path,urutan,published')
    .order('urutan');

  const belumMigrasi = !!error;

  const daftar: BarisPelanggan[] = belumMigrasi
    ? PELANGGAN_BAWAAN.map((p, i) => ({ ...p, urutan: i + 1, terbit: true }))
    : (data as Row[]).map((r) => ({
        id: r.id,
        nama: r.nama,
        logo: r.storage_path ? storageUrl('site-photos', r.storage_path) : null,
        urutan: r.urutan,
        terbit: r.published,
      }));

  return (
    <div className="adm">
      <AdminBar current="pelanggan" />
      <div className="adm-main">
        <h1>Pelanggan.</h1>
        <p className="lede">
          Pita &ldquo;Kami telah bekerja sama dengan&rdquo; di <a href="/" target="_blank">beranda</a>.
          Urutan kecil tampil lebih dulu. Tanpa logo, nama perusahaan tampil sebagai teks.
        </p>

        {belumMigrasi && (
          <div className="adm-warn" role="alert">
            <b>Belum bisa disunting — satu langkah manual masih kurang.</b>
            <p>
              Tabel <code>clients</code> belum ada di Supabase. Jalankan berkas{' '}
              <code>supabase/migrations/0006_pelanggan.sql</code> di SQL editor Supabase, lalu
              muat ulang halaman ini.
            </p>
            <p>
              Sementara itu beranda <b>tetap tampil normal</b> dengan empat nama yang sama.
            </p>
          </div>
        )}

        {!belumMigrasi && <PelangganBaru />}

        <section className="adm-group">
          <h2>{daftar.length} pelanggan</h2>
          {daftar.length === 0 ? (
            <p className="adm-note-sm">Belum ada pelanggan — pita di beranda disembunyikan.</p>
          ) : (
            <div className="adm-proyeks">
              {daftar.map((p) => (
                <PelangganForm key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
