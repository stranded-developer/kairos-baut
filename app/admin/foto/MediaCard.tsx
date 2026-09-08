'use client';

import { useActionState, useRef } from 'react';
import { unggahFoto, simpanAlt, hapusFoto, type FotoState } from './actions';
import ConfirmSubmit from '@/components/ConfirmSubmit';
import { useGambarTerpilih } from '@/components/useGambarTerpilih';
import { aturanSlot, kalimatSyarat, rasioCss } from '@/lib/image-specs';

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
  /* Tiap slot punya aturannya sendiri — hero 3:2, gudang 2:1, panel industri
     4:3, logo klien bebas. Lihat lib/image-specs.ts. */
  const aturan = aturanSlot(slot.key);
  const gambar = useGambarTerpilih(aturan);
  const pratinjau = gambar.pratinjau;

  /* Galat dari browser didahulukan: ia muncul seketika saat berkas dipilih,
     sedangkan pesan server baru ada setelah unggahan. */
  const pesan = gambar.galat ?? unggahState.error ?? altState.error ?? hapusState.error
    ?? unggahState.ok ?? altState.ok ?? hapusState.ok;
  const pesanSalah = !!(gambar.galat || unggahState.error || altState.error || hapusState.error);

  return (
    <div className="adm-media">
      {/* Kotak pratinjau memakai rasio slot + object-fit: cover, jadi bagian
          foto yang terlihat di sini SAMA PERSIS dengan yang akan tersimpan.
          Slot logo dikecualikan: logo tidak dipotong dan latarnya transparan,
          jadi tetap object-fit: contain. */}
      <div
        className={`adm-media-pic${aturan.rasio ? '' : ' adm-media-pic--logo'}`}
        style={rasioCss(aturan) ? { aspectRatio: rasioCss(aturan)! } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pratinjau ?? slot.src} alt="" />
        {slot.fallback && !pratinjau && <span className="adm-tag">Gambar cadangan</span>}
        {pratinjau && <span className="adm-tag adm-tag--new">Belum disimpan</span>}
      </div>

      <div className="adm-media-body">
        <h3>{slot.label}</h3>
        {slot.note && <p className="adm-note-sm">{slot.note}</p>}
        {/* Syarat rasio ditulis dari lib/image-specs.ts, bukan dari kolom
            `note` di basis data — supaya yang tertulis di layar dan yang
            diterapkan server tidak mungkin berbeda. */}
        <p className="adm-note-sm adm-hint--rule">{kalimatSyarat(aturan)}</p>

        {pesan && (
          <p className={pesanSalah ? 'adm-error' : 'adm-ok'} role={pesanSalah ? 'alert' : 'status'}>
            {pesan}
          </p>
        )}
        {/* Keterangan pemotongan — pemberitahuan, bukan galat. */}
        {!pesanSalah && gambar.catatanPotong && (
          <p className="adm-crop">{gambar.catatanPotong}</p>
        )}

        <form action={unggahAction} ref={formRef}>
          <input type="hidden" name="key" value={slot.key} />
          <input
            ref={fileRef}
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
            className="adm-file"
            onChange={(e) => gambar.pilih(e.target.files?.[0] ?? null)}
          />
          {gambar.namaBerkas && <p className="adm-filename">{gambar.namaBerkas}</p>}
          <div className="adm-media-btns">
            {/* Tombol mati selama rasionya belum benar. */}
            <button className="btn btn--sm" type="submit" disabled={unggahPending || !gambar.siap}>
              {unggahPending ? 'Mengunggah…' : 'Unggah foto'}
            </button>
            {pratinjau && (
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => {
                  gambar.reset();
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
