'use client';

import { useActionState } from 'react';
import { simpanSetelan, type SetelanState } from '../pengaturan/actions';
import type { PasanganFont } from '@/lib/data/home';

/* Pilihan pasangan font. Tiap pilihan menampilkan contoh judul + teks + label
   mono dalam font-nya sendiri — berkas font keempat pasangan dimuat oleh
   halaman induk khusus untuk pratinjau ini. */
export default function FontForm({ fonts, aktif }: { fonts: PasanganFont[]; aktif: string }) {
  const [state, action, pending] = useActionState<SetelanState, FormData>(simpanSetelan, {});

  return (
    <form action={action} className="adm-blok">
      <div className="adm-blok-head">
        <h3>Pasangan font</h3>
      </div>
      <p className="adm-note-sm">Berlaku untuk seluruh situs, bukan hanya beranda.</p>

      {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state.ok && <p className="adm-ok" role="status">{state.ok}</p>}

      <input type="hidden" name="key" value="font" />
      <div className="adm-fonts">
        {fonts.map((f) => (
          <label className="adm-font" key={f.id} style={{ fontFamily: f.sans }}>
            <input type="radio" name="v:font" value={f.id} defaultChecked={f.id === aktif} />
            <span className="adm-font-contoh">
              <b>Cari baut yang tepat.</b>
              <span>2.400 item baut, mur, dan ring siap kirim.</span>
              <i style={{ fontFamily: f.mono }}>DIN 933 · M4–M48</i>
            </span>
            <span className="adm-font-nama">{f.nama}</span>
            <small>{f.ket}</small>
          </label>
        ))}
      </div>

      <button className="btn btn--sm" type="submit" disabled={pending}>
        {pending ? 'Menyimpan…' : 'Simpan font'}
      </button>
    </form>
  );
}
