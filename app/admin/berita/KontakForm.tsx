'use client';

import { useActionState, useEffect, useRef } from 'react';
import { simpanKontak, hapusKontak, buatKontak, type BeritaState } from './actions';
import ConfirmSubmit from '@/components/ConfirmSubmit';

export type Kontak = { id: string; nama: string; peran: string; surel: string; telepon: string; urutan: number };

function Isian({ k }: { k?: Kontak }) {
  return (
    <>
      <div className="adm-row2">
        <label className="adm-field">
          <span>Nama</span>
          <input name="nama" defaultValue={k?.nama ?? ''} />
        </label>
        <label className="adm-field">
          <span>Peran</span>
          <input name="peran" defaultValue={k?.peran ?? ''} placeholder="mis. Komunikasi Perusahaan" />
        </label>
      </div>
      <div className="adm-row2">
        <label className="adm-field">
          <span>Email</span>
          <input name="surel" type="email" defaultValue={k?.surel ?? ''} />
        </label>
        <label className="adm-field">
          <span>Telepon <small>(opsional)</small></span>
          <input name="telepon" defaultValue={k?.telepon ?? ''} />
        </label>
      </div>
    </>
  );
}

/* Satu kontak media = satu kartu di blok "Untuk media". */
export default function KontakForm({ k }: { k: Kontak }) {
  const [simpan, simpanAction, pending] = useActionState<BeritaState, FormData>(simpanKontak, {});
  const [buang, buangAction] = useActionState<BeritaState, FormData>(hapusKontak, {});
  const pesan = simpan.error ?? buang.error ?? simpan.ok ?? buang.ok;
  const salah = !!(simpan.error || buang.error);

  return (
    <div className="adm-blok">
      {pesan && <p className={salah ? 'adm-error' : 'adm-ok'} role={salah ? 'alert' : 'status'}>{pesan}</p>}
      <form action={simpanAction} className="adm-proyek-form">
        <input type="hidden" name="id" value={k.id} />
        <Isian k={k} />
        <label className="adm-field adm-field--kecil">
          <span>Urutan</span>
          <input name="urutan" type="number" defaultValue={k.urutan} />
        </label>
        <button className="btn btn--sm" type="submit" disabled={pending}>
          {pending ? 'Menyimpan…' : 'Simpan'}
        </button>
      </form>
      <form action={buangAction} className="adm-proyek-hapus">
        <input type="hidden" name="id" value={k.id} />
        <ConfirmSubmit className="btn btn--sm btn--danger" confirmLabel="Yakin? Klik lagi">
          Hapus kontak
        </ConfirmSubmit>
      </form>
    </div>
  );
}

export function KontakBaru() {
  const [state, action, pending] = useActionState<BeritaState, FormData>(buatKontak, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form action={action} className="adm-proyek-baru" ref={ref}>
      <h2>Tambah kontak media</h2>
      {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state.ok && <p className="adm-ok" role="status">{state.ok}</p>}
      <Isian />
      <button className="btn btn--sm" type="submit" disabled={pending}>
        {pending ? 'Menambah…' : 'Tambah'}
      </button>
    </form>
  );
}
