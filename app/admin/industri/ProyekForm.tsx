'use client';

import { useActionState, useState } from 'react';
import { simpanProyek, hapusProyek, type ProyekState } from './actions';
import PemotongGambar from '@/components/PemotongGambar';
import ConfirmSubmit from '@/components/ConfirmSubmit';
import { ATURAN_PROYEK, kalimatSyarat } from '@/lib/image-specs';
import type { Proyek } from '@/lib/data/projects';

export default function ProyekForm({
  proyek,
  sektorAda,
  terbit,
}: {
  proyek: Proyek;
  sektorAda: string[];
  terbit: boolean;
}) {
  const [simpan, simpanAction, pending] = useActionState<ProyekState, FormData>(simpanProyek, {});
  const [buang, buangAction] = useActionState<ProyekState, FormData>(hapusProyek, {});
  /* Foto boleh tidak diganti — tombol Simpan tetap hidup tanpa berkas baru. */
  const [fotoSiap, setFotoSiap] = useState(true);

  const pesan = simpan.error ?? buang.error ?? simpan.ok ?? buang.ok;
  const salah = !!(simpan.error || buang.error);

  return (
    <div className="adm-proyek">
      <div className="adm-proyek-pic">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={proyek.foto} alt="" />
        {!terbit && <span className="adm-tag">Disembunyikan</span>}
      </div>

      <div className="adm-proyek-body">
        {pesan && (
          <p className={salah ? 'adm-error' : 'adm-ok'} role={salah ? 'alert' : 'status'}>{pesan}</p>
        )}

        <form action={simpanAction} className="adm-proyek-form">
          <input type="hidden" name="slug" value={proyek.slug} />

          <label className="adm-field">
            <span>Nama proyek</span>
            <input name="nama" defaultValue={proyek.nama} />
          </label>

          <div className="adm-proyek-baris">
            <label className="adm-field">
              <span>Sektor</span>
              {/* Daftar saran, tapi tetap boleh diketik bebas — sektor bukan
                  daftar tertutup, dan saringan di /industri dibangun dari
                  data yang ada. */}
              <input name="sektor" defaultValue={proyek.sektor} list="daftar-sektor" />
            </label>
            <label className="adm-field adm-field--kecil">
              <span>Urutan</span>
              <input name="urutan" type="number" defaultValue={proyek.urutan} />
            </label>
          </div>
          <datalist id="daftar-sektor">
            {sektorAda.map((s) => <option key={s} value={s} />)}
          </datalist>

          <label className="adm-field">
            <span>Keterangan singkat <small>(opsional)</small></span>
            <input name="ringkas" defaultValue={proyek.ringkas} placeholder="Kosongkan kalau tidak perlu" />
          </label>

          <label className="adm-field">
            <span>Teks alternatif foto</span>
            <input name="alt" defaultValue={proyek.alt} />
          </label>

          <label className="adm-check">
            <input type="checkbox" name="published" defaultChecked={terbit} />
            <span>Tampilkan di halaman Industri</span>
          </label>

          <details className="adm-proyek-foto">
            <summary>Ganti foto</summary>
            <p className="adm-hint--rule">{kalimatSyarat(ATURAN_PROYEK)}</p>
            <PemotongGambar aturan={ATURAN_PROYEK} onSiap={setFotoSiap} opsional />
          </details>

          <button className="btn btn--sm" type="submit" disabled={pending || !fotoSiap}>
            {pending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>

        <form action={buangAction} className="adm-proyek-hapus">
          <input type="hidden" name="slug" value={proyek.slug} />
          <ConfirmSubmit className="btn btn--sm btn--danger" confirmLabel="Yakin? Klik lagi">
            Hapus proyek
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
