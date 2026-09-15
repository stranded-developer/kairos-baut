'use client';

import { useActionState } from 'react';
import { buatProyek, type ProyekState } from './actions';

/* Proyek baru dibuat dengan nama + sektor saja. Slug-nya diturunkan dari
   nama, urutannya ditaruh paling belakang, dan statusnya sengaja belum
   terbit — fotonya dilengkapi dulu lewat kartu di bawah. */
export default function ProyekBaru({ sektorAda }: { sektorAda: string[] }) {
  const [state, action, pending] = useActionState<ProyekState, FormData>(buatProyek, {});

  return (
    <form action={action} className="adm-proyek-baru">
      <h2>Tambah proyek</h2>
      {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state.ok && <p className="adm-ok" role="status">{state.ok}</p>}
      <div className="adm-proyek-baris">
        <label className="adm-field">
          <span>Nama proyek</span>
          <input name="nama" placeholder="mis. Pelabuhan Patimban Tahap 3" />
        </label>
        <label className="adm-field">
          <span>Sektor</span>
          <input name="sektor" list="daftar-sektor-baru" placeholder="mis. Infrastruktur" />
        </label>
      </div>
      <datalist id="daftar-sektor-baru">
        {sektorAda.map((s) => <option key={s} value={s} />)}
      </datalist>
      <button className="btn btn--sm" type="submit" disabled={pending}>
        {pending ? 'Membuat…' : 'Tambah'}
      </button>
    </form>
  );
}
