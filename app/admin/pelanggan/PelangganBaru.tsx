'use client';

import { useActionState, useEffect, useRef } from 'react';
import { buatPelanggan, type PelangganState } from './actions';
import { TERIMA_LOGO } from './PelangganForm';

/* Pelanggan baru langsung terbit — tanpa logo pun namanya tampil rapi
   sebagai teks, sama seperti empat nama awal. */
export default function PelangganBaru() {
  const [state, action, pending] = useActionState<PelangganState, FormData>(buatPelanggan, {});
  const ref = useRef<HTMLFormElement>(null);

  /* Dikosongkan setelah berhasil, supaya bisa langsung menambah yang berikutnya. */
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form action={action} className="adm-proyek-baru" ref={ref}>
      <h2>Tambah pelanggan</h2>
      {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state.ok && <p className="adm-ok" role="status">{state.ok}</p>}
      <label className="adm-field">
        <span>Nama perusahaan</span>
        <input name="nama" placeholder="mis. Waskita Karya" />
      </label>
      <label className="adm-field">
        <span>Logo <small>(opsional — tanpa logo, nama tampil sebagai teks)</small></span>
        <input type="file" name="file" accept={TERIMA_LOGO} className="adm-file" />
      </label>
      <button className="btn btn--sm" type="submit" disabled={pending}>
        {pending ? 'Menambah…' : 'Tambah'}
      </button>
    </form>
  );
}
