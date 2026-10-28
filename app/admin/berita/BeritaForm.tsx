'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { buatSlug } from '@/lib/post-form';
import PemotongGambar from '@/components/PemotongGambar';
import { ATURAN_BERITA, kalimatSyarat } from '@/lib/image-specs';
import type { BeritaState } from './actions';

export interface BeritaData {
  slug?: string; judul?: string; kategori?: string; tanggal?: string; lokasi?: string;
  ringkas?: string; body?: string; alt?: string; unggulan?: boolean; published?: boolean;
  foto?: string | null; contoh?: boolean;
}

export default function BeritaForm({
  berita, action, mode, kategoriAda,
}: {
  berita: BeritaData;
  action: (prev: BeritaState, fd: FormData) => Promise<BeritaState>;
  mode: 'baru' | 'ubah';
  kategoriAda: string[];
}) {
  const [state, formAction, pending] = useActionState<BeritaState, FormData>(action, {});
  const [judul, setJudul] = useState(berita.judul ?? '');
  const [slug, setSlug] = useState(berita.slug ?? '');
  const [slugDisentuh, setSlugDisentuh] = useState(mode === 'ubah');
  /* Foto opsional — Simpan tetap hidup tanpa berkas baru. */
  const [fotoSiap, setFotoSiap] = useState(true);

  return (
    <form action={formAction} className="adm-form">
      {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state.ok && <p className="adm-ok" role="status">{state.ok}</p>}
      {berita.contoh && (
        <div className="adm-warn" role="note">
          <b>Ini berita contoh dari tahap mockup — isinya karangan.</b>
          <p>
            Ganti dengan kabar sungguhan, atau hapus. Label &ldquo;Contoh&rdquo; hilang begitu
            berita ini disimpan.
          </p>
        </div>
      )}

      <div className="adm-cols">
        <div>
          <fieldset className="adm-set">
            <legend>Berita</legend>

            <label className="adm-field">
              <span>Judul</span>
              <input
                name="judul"
                value={judul}
                required
                onChange={(e) => {
                  setJudul(e.target.value);
                  if (!slugDisentuh) setSlug(buatSlug(e.target.value));
                }}
              />
            </label>

            <label className="adm-field">
              <span>Slug (alamat halaman)</span>
              <input
                name="slug"
                value={slug}
                required
                pattern="[a-z0-9\-]+"
                readOnly={mode === 'ubah'}
                onChange={(e) => { setSlug(e.target.value); setSlugDisentuh(true); }}
              />
              <small>
                {mode === 'ubah'
                  ? <>Tidak bisa diubah — tautan yang sudah tersebar akan mati. Alamatnya: <code>/berita/{slug}</code></>
                  : 'Dibuat otomatis dari judul. Boleh disunting sebelum disimpan.'}
              </small>
            </label>

            <div className="adm-row2">
              <label className="adm-field">
                <span>Kategori</span>
                <input name="kategori" defaultValue={berita.kategori ?? 'Siaran pers'} list="kategori-berita" required />
                <datalist id="kategori-berita">
                  {kategoriAda.map((k) => <option key={k} value={k} />)}
                </datalist>
              </label>
              <label className="adm-field">
                <span>Tanggal</span>
                <input
                  name="tanggal"
                  type="date"
                  defaultValue={berita.tanggal ?? new Date().toISOString().slice(0, 10)}
                  required
                />
              </label>
            </div>

            <label className="adm-field">
              <span>Lokasi <small>(opsional)</small></span>
              <input name="lokasi" defaultValue={berita.lokasi ?? ''} placeholder="mis. Jakarta" />
              <small>Tampil di baris tanggal artikel: &ldquo;Jakarta, 28 Agustus 2026&rdquo;.</small>
            </label>

            <label className="adm-field">
              <span>Ringkasan</span>
              <textarea name="ringkas" rows={3} defaultValue={berita.ringkas ?? ''} />
              <small>Tampil di kartu daftar berita dan di bawah judul artikel.</small>
            </label>

            <label className="adm-field">
              <span>Isi artikel</span>
              <textarea name="body" rows={16} defaultValue={berita.body ?? ''} placeholder="Tulis isi lengkapnya di sini…" />
              <small>
                Pisahkan paragraf dengan satu baris kosong. Baris berawalan <code>## </code> jadi
                subjudul; baris-baris berawalan <code>- </code> jadi daftar butir. Boleh kosong —
                artikel lalu cukup menampilkan ringkasan.
              </small>
            </label>
          </fieldset>
        </div>

        <div>
          <fieldset className="adm-set">
            <legend>Foto</legend>
            {berita.foto && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img className="adm-berita-foto" src={berita.foto} alt="" />
            )}
            <p className="adm-hint--rule">{kalimatSyarat(ATURAN_BERITA)}</p>
            <PemotongGambar aturan={ATURAN_BERITA} onSiap={setFotoSiap} opsional />
            {berita.foto && (
              <label className="adm-check">
                <input type="checkbox" name="buang_foto" />
                <span>Hapus foto</span>
              </label>
            )}
            <label className="adm-field">
              <span>Teks alternatif foto</span>
              <input name="alt" defaultValue={berita.alt ?? ''} placeholder="Gambarkan isi fotonya" />
            </label>
          </fieldset>

          <fieldset className="adm-set">
            <legend>Penerbitan</legend>
            <label className="adm-check">
              <input type="checkbox" name="unggulan" defaultChecked={berita.unggulan ?? false} />
              <span>Jadikan berita utama (kartu besar)</span>
            </label>
            <p className="adm-hint" style={{ marginTop: 8 }}>
              Hanya satu berita yang bisa jadi utama. Kalau tidak ada yang dicentang, berita
              terbaru yang tampil besar.
            </p>
            <label className="adm-check">
              <input type="checkbox" name="published" defaultChecked={berita.published ?? true} />
              <span>Tampilkan di situs</span>
            </label>
          </fieldset>
        </div>
      </div>

      <div className="adm-actions">
        <button className="btn" type="submit" disabled={pending || !fotoSiap}>
          {pending ? 'Menyimpan…' : mode === 'baru' ? 'Buat berita' : 'Simpan perubahan'}
        </button>
        <Link className="btn btn--ghost" href="/admin/berita">Kembali</Link>
        {mode === 'ubah' && (
          <Link className="btn btn--ghost" href={`/berita/${slug}`} target="_blank">Lihat di situs ↗</Link>
        )}
      </div>
    </form>
  );
}
