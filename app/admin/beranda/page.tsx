import AdminBar from '../AdminBar';
import SetelanForm from '../pengaturan/SetelanForm';
import FontForm from './FontForm';
import { createAdminClient } from '@/lib/supabase/admin';
import { BERANDA, FONT } from '@/lib/data/home';

export const dynamic = 'force-dynamic';

/* ============================================================================
   Backoffice naskah beranda + pasangan font.

   Label, petunjuk, dan jenis isian (satu baris / textarea) datang dari
   lib/data/home.ts; dari basis data hanya NILAINYA. Jadi halaman ini tetap
   utuh meski migrasi 0008 belum dijalankan — hanya belum bisa disimpan.
   Penyimpanan memakai aksi simpanSetelan milik /admin/pengaturan.
   ========================================================================= */

export default async function AdminBeranda() {
  const db = createAdminClient();
  const { data, error } = await db.from('site_settings').select('key,value');

  const nilai = new Map((data ?? []).map((r) => [r.key as string, r.value as string]));
  const belumMigrasi = !!error || !nilai.has('b_hero_judul');

  return (
    <div className="adm">
      {/* Font keempat pasangan, khusus untuk pratinjau di FontForm. */}
      {FONT.map((f) => (
        <link key={f.id} rel="stylesheet" href={f.url} />
      ))}
      <AdminBar current="beranda-naskah" />
      <div className="adm-main">
        <h1>Beranda.</h1>
        <p className="lede">
          Semua teks di <a href="/" target="_blank">beranda</a>, dan pasangan font situs.
          Susunannya tetap — yang diganti isinya. Foto diatur di Foto situs, pelanggan di
          Pelanggan, kontak di Kontak.
        </p>

        {belumMigrasi && (
          <div className="adm-warn" role="alert">
            <b>Belum bisa disimpan — langkah manual masih kurang.</b>
            <p>
              Jalankan <code>supabase/migrations/0005_pengaturan.sql</code> (kalau belum), lalu{' '}
              <code>supabase/migrations/0008_beranda.sql</code> di SQL editor Supabase, lalu muat
              ulang halaman ini.
            </p>
            <p>
              Sementara itu beranda <b>tetap tampil normal</b> dengan teks yang sama seperti di
              bawah ini.
            </p>
          </div>
        )}

        <div className="adm-bloks">
          <FontForm fonts={FONT} aktif={nilai.get('font') ?? FONT[0].id} />

          {/* Tiap bagian dilipat — 96 isian sekaligus terlalu panjang untuk
              digulir. Yang dibuka hanya bagian yang mau disunting. */}
          {BERANDA.map((k) => (
            <details className="adm-lipat" key={k.grp}>
              <summary>
                {k.grp} <small>{k.isian.length} isian</small>
              </summary>
              <SetelanForm
                judul={k.grp}
                ket={k.ket}
                items={k.isian.map((i) => ({
                  key: i.key,
                  label: i.label,
                  note: i.note ?? '',
                  panjang: i.panjang ?? false,
                  value: nilai.get(i.key) ?? i.value,
                }))}
              />
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
