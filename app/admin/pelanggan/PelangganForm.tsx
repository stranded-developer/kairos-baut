'use client';

import { useActionState } from 'react';
import { simpanPelanggan, hapusPelanggan, type PelangganState } from './actions';
import ConfirmSubmit from '@/components/ConfirmSubmit';
import { ATURAN_LOGO, kalimatSyarat } from '@/lib/image-specs';

export type BarisPelanggan = {
  id: string;
  nama: string;
  logo: string | null;
  urutan: number;
  terbit: boolean;
};

/* Format yang diterima — sama dengan MIME_DIIZINKAN di lib/storage.ts. */
export const TERIMA_LOGO = 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml';

/* Logo tidak memakai PemotongGambar: rasionya bebas dan tidak dipotong, jadi
   kotak geser-perbesar hanya akan menyesatkan. Cukup input berkas biasa. */
export default function PelangganForm({ p }: { p: BarisPelanggan }) {
  const [simpan, simpanAction, pending] = useActionState<PelangganState, FormData>(simpanPelanggan, {});
  const [buang, buangAction] = useActionState<PelangganState, FormData>(hapusPelanggan, {});

  const pesan = simpan.error ?? buang.error ?? simpan.ok ?? buang.ok;
  const salah = !!(simpan.error || buang.error);

  return (
    <div className="adm-proyek">
      <div className="adm-proyek-pic adm-logo-pic">
        {p.logo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.logo} alt="" />
        ) : (
          <b>{p.nama}</b>
        )}
        {!p.terbit && <span className="adm-tag">Disembunyikan</span>}
      </div>

      <div className="adm-proyek-body">
        {pesan && (
          <p className={salah ? 'adm-error' : 'adm-ok'} role={salah ? 'alert' : 'status'}>{pesan}</p>
        )}

        <form action={simpanAction} className="adm-proyek-form">
          <input type="hidden" name="id" value={p.id} />

          <div className="adm-proyek-baris">
            <label className="adm-field">
              <span>Nama perusahaan</span>
              <input name="nama" defaultValue={p.nama} />
            </label>
            <label className="adm-field adm-field--kecil">
              <span>Urutan</span>
              <input name="urutan" type="number" defaultValue={p.urutan} />
            </label>
          </div>

          <label className="adm-check">
            <input type="checkbox" name="published" defaultChecked={p.terbit} />
            <span>Tampilkan di beranda</span>
          </label>

          <details className="adm-proyek-foto">
            <summary>{p.logo ? 'Ganti logo' : 'Tambah logo'}</summary>
            <p className="adm-hint--rule">{kalimatSyarat(ATURAN_LOGO)} PNG/SVG berlatar transparan paling rapi.</p>
            <input type="file" name="file" accept={TERIMA_LOGO} className="adm-file" />
            {p.logo && (
              <label className="adm-check">
                <input type="checkbox" name="buang_logo" />
                <span>Hapus logo — tampilkan nama sebagai teks</span>
              </label>
            )}
          </details>

          <button className="btn btn--sm" type="submit" disabled={pending}>
            {pending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>

        <form action={buangAction} className="adm-proyek-hapus">
          <input type="hidden" name="id" value={p.id} />
          <ConfirmSubmit className="btn btn--sm btn--danger" confirmLabel="Yakin? Klik lagi">
            Hapus pelanggan
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
