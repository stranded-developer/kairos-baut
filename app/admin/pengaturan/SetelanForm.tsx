'use client';

import { useActionState } from 'react';
import { simpanSetelan, type SetelanState } from './actions';

export type Setelan = { key: string; label: string; value: string; note: string; panjang?: boolean };

/* Kunci yang isinya banyak baris — ditampilkan sebagai textarea. */
const BANYAK_BARIS = new Set(['alamat_kantor', 'alamat_workshop', 'jam_kerja', 'tagline_kaki']);

/* Satu kelompok = satu formulir, seperti BlokForm di /admin/tentang: pesan
   berhasil/gagal menempel pada kelompok yang sedang disunting. */
export default function SetelanForm({ judul, ket, items }: { judul: string; ket?: string; items: Setelan[] }) {
  const [state, action, pending] = useActionState<SetelanState, FormData>(simpanSetelan, {});

  return (
    <form action={action} className="adm-blok">
      <div className="adm-blok-head">
        <h3>{judul}</h3>
      </div>
      {ket && <p className="adm-note-sm">{ket}</p>}

      {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state.ok && <p className="adm-ok" role="status">{state.ok}</p>}

      {items.map((s) => (
        <label className="adm-field" key={s.key}>
          <span>{s.label}</span>
          <input type="hidden" name="key" value={s.key} />
          {(s.panjang ?? BANYAK_BARIS.has(s.key)) ? (
            <textarea name={`v:${s.key}`} defaultValue={s.value} rows={3} />
          ) : (
            <input
              name={`v:${s.key}`}
              defaultValue={s.value}
              {...(s.key === 'email' ? { type: 'email' } : {})}
              {...(s.key === 'wa' ? { inputMode: 'tel' as const } : {})}
            />
          )}
          {s.note && <small>{s.note}</small>}
        </label>
      ))}

      <button className="btn btn--sm" type="submit" disabled={pending}>
        {pending ? 'Menyimpan…' : 'Simpan'}
      </button>
    </form>
  );
}
