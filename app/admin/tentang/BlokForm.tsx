'use client';

import { useActionState } from 'react';
import { simpanBlok, type TentangState } from './actions';
import type { Blok } from '@/lib/data/about';

/* Satu blok naskah = satu formulir tersendiri. Sengaja tidak dijadikan satu
   formulir raksasa: menyimpan bagian yang sedang disunting saja lebih aman,
   dan pesan berhasil/gagalnya jelas menempel pada blok yang mana. */
export default function BlokForm({ blok }: { blok: Blok }) {
  const [state, action, pending] = useActionState<TentangState, FormData>(simpanBlok, {});

  const isKutipan = blok.kind === 'kutipan';
  const isTanda = blok.kind === 'tanda-tangan';

  const labelJudul = isKutipan ? 'Kutipan (moto)' : isTanda ? 'Nama' : 'Judul bagian';
  const labelIsi = isTanda ? 'Salam pembuka' : 'Isi';

  return (
    <form action={action} className="adm-blok">
      <input type="hidden" name="key" value={blok.key} />

      <div className="adm-blok-head">
        <h3>{blok.label}</h3>
        <code>{blok.key}</code>
      </div>
      {blok.note && <p className="adm-note-sm">{blok.note}</p>}

      {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state.ok && <p className="adm-ok" role="status">{state.ok}</p>}

      <label className="adm-field">
        <span>{labelJudul}</span>
        <input name="heading" defaultValue={blok.heading} />
      </label>

      <label className="adm-field">
        <span>{labelIsi}</span>
        <textarea name="body" defaultValue={blok.body} rows={isTanda ? 2 : 6} />
        {!isTanda && (
          <small>
            Pisahkan paragraf dengan <b>satu baris kosong</b>. Tidak perlu tanda HTML apa pun.
          </small>
        )}
      </label>

      {isTanda && (
        <label className="adm-field">
          <span>Jabatan</span>
          <input name="caption" defaultValue={blok.caption} />
        </label>
      )}
      {!isTanda && <input type="hidden" name="caption" value={blok.caption} />}

      {/* Hanya blok berfoto yang bisa dibalik — tanpa foto, membalik kolom
          tidak mengubah apa pun. */}
      {blok.mediaKey ? (
        <label className="adm-check">
          <input type="checkbox" name="flip" defaultChecked={blok.flip} />
          <span>Foto di kanan (bukan di kiri)</span>
        </label>
      ) : (
        <input type="hidden" name="flip" value={blok.flip ? 'on' : ''} />
      )}

      <button className="btn btn--sm" type="submit" disabled={pending}>
        {pending ? 'Menyimpan…' : 'Simpan'}
      </button>
    </form>
  );
}
