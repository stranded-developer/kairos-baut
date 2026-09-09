import AdminBar from '../AdminBar';
import BlokForm from './BlokForm';
import MediaCard, { type Slot } from '../foto/MediaCard';
import { createAdminClient } from '@/lib/supabase/admin';
import { storageUrl } from '@/lib/supabase/public';
import { BLOK_BAWAAN, CADANGAN_TENTANG, type Blok } from '@/lib/data/about';

export const dynamic = 'force-dynamic';

/* ============================================================================
   Backoffice halaman Tentang Kami.

   Naskah DAN foto ada di satu halaman ini, meski sumbernya dua tabel berbeda
   (about_blocks + site_media). Foto memakai MediaCard milik /admin/foto apa
   adanya, jadi seluruh jalur unggah yang sudah teruji ikut terpakai —
   pemeriksaan rasio, pemotongan tengah, WebP, teks alternatif.
   ========================================================================= */

type MediaRow = { key: string; label: string; grp: string; alt: string; note: string; storage_path: string | null };

export default async function AdminTentang() {
  const db = createAdminClient();

  const [blokRes, mediaRes] = await Promise.all([
    db.from('about_blocks')
      .select('key,label,kind,heading,body,media_key,flip,caption,note,sort_order')
      .order('sort_order'),
    db.from('site_media')
      .select('key,label,grp,alt,note,storage_path')
      .eq('grp', 'Tentang Kami')
      .order('sort_order'),
  ]);

  /* Migrasi 0002 dijalankan manual di SQL editor Supabase (tidak ada psql
     maupun Supabase CLI di mesin ini). Selama belum dijalankan, halaman ini
     tetap dibuka — tapi menampilkan isi bawaan dalam keadaan TIDAK bisa
     disimpan, disertai keterangan langkah yang kurang. Lebih baik daripada
     galat mentah yang tidak menjelaskan apa-apa. */
  const belumMigrasi = !!blokRes.error || (blokRes.data ?? []).length === 0;

  const blok: Blok[] = belumMigrasi
    ? BLOK_BAWAAN
    : (blokRes.data ?? []).map((r) => ({
        key: r.key, label: r.label, kind: r.kind as Blok['kind'],
        heading: r.heading, body: r.body, mediaKey: r.media_key,
        flip: r.flip, caption: r.caption, note: r.note, sortOrder: r.sort_order,
      }));

  const slots: Slot[] = ((mediaRes.data ?? []) as MediaRow[]).map((r) => ({
    key: r.key,
    label: r.label,
    grp: r.grp,
    alt: r.alt,
    note: r.note,
    src: r.storage_path ? storageUrl('site-photos', r.storage_path) : (CADANGAN_TENTANG[r.key] ?? ''),
    fallback: !r.storage_path,
  }));

  return (
    <div className="adm">
      <AdminBar current="tentang" />
      <div className="adm-main">
        <h1>Tentang Kami.</h1>
        <p className="lede">
          Naskah dan foto halaman <a href="/tentang" target="_blank">/tentang</a>. Bagiannya
          tetap — yang diganti isinya, bukan susunannya.
        </p>

        {belumMigrasi && (
          <div className="adm-warn" role="alert">
            <b>Belum bisa disimpan — satu langkah manual masih kurang.</b>
            <p>
              Tabel <code>about_blocks</code> belum ada di Supabase. Jalankan berkas{' '}
              <code>supabase/migrations/0002_tentang.sql</code> di SQL editor Supabase,
              lalu muat ulang halaman ini.
            </p>
            <p>
              Sementara itu halaman <code>/tentang</code> <b>tetap tampil normal</b> memakai
              isi bawaan yang sama — yang di bawah ini hanya belum bisa disunting.
            </p>
          </div>
        )}

        <section className="adm-group">
          <h2>Naskah</h2>
          <div className="adm-bloks">
            {blok.map((b) => (
              <BlokForm key={b.key} blok={b} />
            ))}
          </div>
        </section>

        <section className="adm-group">
          <h2>Foto</h2>
          {slots.length === 0 ? (
            <p className="adm-note-sm">
              Slot fotonya ikut dibuat oleh migrasi 0002 — belum ada. Sampai itu dijalankan,
              halaman publik memakai foto stok dari <code>/public/img</code>.
            </p>
          ) : (
            <div className="adm-medias">
              {slots.map((s) => (
                <MediaCard key={s.key} slot={s} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
