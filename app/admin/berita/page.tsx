import Link from 'next/link';
import AdminBar from '../AdminBar';
import SetelanForm from '../pengaturan/SetelanForm';
import KontakForm, { KontakBaru, type Kontak } from './KontakForm';
import { adminDaftarBerita } from './data';
import { createAdminClient } from '@/lib/supabase/admin';
import { BERITA_TEKS, tanggalPanjang } from '@/lib/data/news';

export const dynamic = 'force-dynamic';

/* ============================================================================
   Backoffice Berita: daftar berita, naskah halaman /berita, kontak media.
   ========================================================================= */

export default async function AdminBerita() {
  const db = createAdminClient();
  const [daftar, { data: kontakRows }, { data: setelan }] = await Promise.all([
    adminDaftarBerita(),
    db.from('press_contacts').select('id,nama,peran,surel,telepon,urutan').order('urutan'),
    db.from('site_settings').select('key,value').like('key', 'n\\_%'),
  ]);

  const belumMigrasi = daftar === null;
  const nilai = new Map((setelan ?? []).map((r) => [r.key as string, r.value as string]));
  const kontak = (kontakRows ?? []) as Kontak[];
  const jumlahContoh = (daftar ?? []).filter((b) => b.contoh).length;

  return (
    <div className="adm">
      <AdminBar current="berita" />
      <div className="adm-main">
        <div className="adm-head">
          <div>
            <h1>Berita.</h1>
            <p className="lede">
              {belumMigrasi ? 'Halaman ' : `${daftar.length} berita di `}
              <a href="/berita" target="_blank">/berita</a>. Klik untuk menyunting.
            </p>
          </div>
          {!belumMigrasi && <Link className="btn" href="/admin/berita/baru">+ Berita baru</Link>}
        </div>

        {belumMigrasi && (
          <div className="adm-warn" role="alert">
            <b>Belum bisa disunting — langkah manual masih kurang.</b>
            <p>
              Jalankan <code>supabase/migrations/0005_pengaturan.sql</code> (kalau belum), lalu{' '}
              <code>supabase/migrations/0009_berita.sql</code> di SQL editor Supabase, lalu muat
              ulang halaman ini.
            </p>
            <p>
              Sementara itu <code>/berita</code> <b>tetap tampil normal</b> dengan isi contoh yang
              sama seperti sekarang.
            </p>
          </div>
        )}

        {jumlahContoh > 0 && (
          <div className="adm-warn" role="note">
            <b>{jumlahContoh} berita masih berupa contoh karangan dari tahap mockup.</b>
            <p>Ganti isinya dengan kabar sungguhan atau hapus sebelum situs dipromosikan.</p>
          </div>
        )}

        {!belumMigrasi && (
          <div className="adm-list">
            {daftar.map((b) => (
              <Link className="adm-item" href={`/admin/berita/${b.slug}`} key={b.slug}>
                <span className="adm-item-art adm-item-foto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {b.foto && <img src={b.foto} alt="" />}
                </span>
                <span className="adm-item-main">
                  <b>{b.judul}</b>
                  <small>{b.ringkas.slice(0, 78)}{b.ringkas.length > 78 ? '…' : ''}</small>
                </span>
                <span className="adm-item-meta">{tanggalPanjang(b.tanggal)}</span>
                <span className="adm-pill">{b.kategori}</span>
                {b.unggulan && <span className="adm-pill adm-pill--star">★ Utama</span>}
                {b.contoh && <span className="adm-pill adm-pill--low">Contoh</span>}
                {!b.published && <span className="adm-pill adm-pill--draft">Disembunyikan</span>}
                <span className="adm-item-go" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        )}

        <section className="adm-group">
          <h2>Teks halaman</h2>
          <div className="adm-bloks">
            {BERITA_TEKS.map((k) => (
              <details className="adm-lipat" key={k.grp}>
                <summary>
                  {k.grp} <small>{k.isian.length} isian</small>
                </summary>
                <SetelanForm
                  judul={k.grp}
                  ket={k.ket}
                  items={k.isian.map((i) => ({
                    key: i.key, label: i.label, note: i.note ?? '', panjang: i.panjang ?? false,
                    value: nilai.get(i.key) ?? i.value,
                  }))}
                />
              </details>
            ))}
          </div>
        </section>

        {!belumMigrasi && (
          <section className="adm-group">
            <h2>Kontak media</h2>
            <p className="adm-note-sm">
              Orang-orang di blok &ldquo;Untuk media&rdquo;. Kartunya membuka email ke alamat masing-masing.
            </p>
            <KontakBaru />
            <div className="adm-bloks">
              {kontak.map((k) => <KontakForm key={k.id} k={k} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
