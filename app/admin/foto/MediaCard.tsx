'use client';

import { useActionState, useRef, useState } from 'react';
import { unggahFoto, simpanAlt, hapusFoto, type FotoState } from './actions';
import ConfirmSubmit from '@/components/ConfirmSubmit';

export interface Slot {
  key: string;
  label: string;
  grp: string;
  alt: string;
  note: string;
  src: string;
  fallback: boolean;
}

export default function MediaCard({ slot }: { slot: Slot }) {
  const [unggahState, unggahAction, unggahPending] = useActionState<FotoState, FormData>(unggahFoto, {});
  const [altState, altAction] = useActionState<FotoState, FormData>(simpanAlt, {});
  const [hapusState, hapusAction] = useActionState<FotoState, FormData>(hapusFoto, {});

  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null);
  const [namaBerkas, setNamaBerkas] = useState<string | null>(null);

  const pesan = unggahState.error ?? altState.error ?? hapusState.error
    ?? unggahState.ok ?? altState.ok ?? hapusState.ok;
  const pesanSalah = !!(unggahState.error || altState.error || hapusState.error);

  return (
    <div className="adm-media">
      <div className="adm-media-pic">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pratinjau ?? slot.src} alt="" />
        {slot.fallback && !pratinjau && <span className="adm-tag">Gambar cadangan</span>}
        {pratinjau && <span className="adm-tag adm-tag--new">Belum disimpan</span>}
      </div>

      <div className="adm-media-body">
        <h3>{slot.label}</h3>
        {slot.note && <p className="adm-note-sm">{slot.note}</p>}

        {pesan && (
          <p className={pesanSalah ? 'adm-error' : 'adm-ok'} role={pesanSalah ? 'alert' : 'status'}>
            {pesan}
          </p>
        )}

        <form action={unggahAction} ref={formRef}>
          <input type="hidden" name="key" value={slot.key} />
          <input
            ref={fileRef}
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="adm-file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) { setPratinjau(null); setNamaBerkas(null); return; }
              setNamaBerkas(`${f.name} · ${(f.size / 1048576).toFixed(1)} MB`);
              setPratinjau(URL.createObjectURL(f));
            }}
          />
          {namaBerkas && <p className="adm-filename">{namaBerkas}</p>}
          <div className="adm-media-btns">
            <button className="btn btn--sm" type="submit" disabled={unggahPending || !pratinjau}>
              {unggahPending ? 'Mengunggah…' : 'Unggah foto'}
            </button>
            {pratinjau && (
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => {
                  setPratinjau(null); setNamaBerkas(null);
                  if (fileRef.current) fileRef.current.value = '';
                }}
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <form action={altAction} className="adm-alt">
          <input type="hidden" name="key" value={slot.key} />
          <label className="adm-field">
            <span>Teks alternatif</span>
            <input name="alt" defaultValue={slot.alt} placeholder="Gambarkan isi fotonya" />
            <small>Dibaca pembaca layar dan tampil kalau foto gagal dimuat.</small>
          </label>
          <button className="btn btn--sm btn--ghost" type="submit">Simpan teks</button>
        </form>

        {!slot.fallback && (
          <form action={hapusAction} className="adm-media-remove">
            <input type="hidden" name="key" value={slot.key} />
            <ConfirmSubmit className="btn btn--sm btn--danger" confirmLabel="Yakin? Klik lagi">
              Lepas foto
            </ConfirmSubmit>
          </form>
        )}
      </div>
    </div>
  );
}
