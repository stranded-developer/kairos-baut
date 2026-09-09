'use client';

import { useActionState, useState } from 'react';
import {
  unggahFotoProduk,
  hapusFotoProduk,
  simpanAltProduk,
  type FotoProdukState,
} from './foto-actions';
import ConfirmSubmit from '@/components/ConfirmSubmit';
import PemotongGambar from '@/components/PemotongGambar';
import { ATURAN_PRODUK, kalimatSyarat } from '@/lib/image-specs';

export interface FotoProduk {
  id: string;
  kind: 'produk' | 'teknis' | 'kemasan';
  url: string;
  alt: string;
}

const JENIS = [
  { k: 'produk', l: 'Tampak produk', h: 'Foto utama — latar putih.' },
  { k: 'teknis', l: 'Gambar teknis', h: 'Sketsa ukuran & standar.' },
  { k: 'kemasan', l: 'Kemasan', h: 'Foto kemasan pengiriman.' },
] as const;

export default function ProductPhotos({
  productId,
  photos,
}: {
  productId: string;
  photos: FotoProduk[];
}) {
  return (
    <fieldset className="adm-set">
      <legend>Foto produk</legend>
      <p className="adm-hint">
        Selama sebuah jenis belum ada fotonya, situs memakai gambar vektor yang
        dipilih di atas. Jadi panel detail tidak pernah kosong.
      </p>
      {/* Syaratnya ditulis SEBELUM berkas dipilih. Karena foto berasio salah
          ditolak (bukan dipotong otomatis), admin harus tahu ukurannya dulu
          supaya tidak menebak-nebak. */}
      <p className="adm-hint adm-hint--rule">{kalimatSyarat(ATURAN_PRODUK)}</p>
      <div className="adm-photogrid">
        {JENIS.map((j) => (
          <PhotoSlotCard
            key={j.k}
            productId={productId}
            kind={j.k}
            label={j.l}
            hint={j.h}
            photo={photos.find((p) => p.kind === j.k) ?? null}
          />
        ))}
      </div>
    </fieldset>
  );
}

function PhotoSlotCard({
  productId, kind, label, hint, photo,
}: {
  productId: string;
  kind: 'produk' | 'teknis' | 'kemasan';
  label: string;
  hint: string;
  photo: FotoProduk | null;
}) {
  const [naik, naikAction, pending] = useActionState<FotoProdukState, FormData>(unggahFotoProduk, {});
  const [buang, buangAction] = useActionState<FotoProdukState, FormData>(hapusFotoProduk, {});
  const [altState, altAction] = useActionState<FotoProdukState, FormData>(simpanAltProduk, {});
  const [siap, setSiap] = useState(false);
  /* Dikendalikan React supaya nilai yang diketik sebelum mengunggah ikut
     terkirim bersama berkasnya, bukan hilang. */
  const [alt, setAlt] = useState(photo?.alt ?? '');

  const pesan = naik.error ?? buang.error ?? altState.error ?? naik.ok ?? buang.ok ?? altState.ok;
  const salah = !!(naik.error || buang.error || altState.error);

  return (
    <div className="adm-photo">
      {/* Foto yang SUDAH tersimpan. Pratinjau unggahan baru tidak lagi di sini
          — sudah jadi kotak pemotong di bawah. */}
      <div className="adm-photo-pic">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={photo.url} alt="" />
        ) : (
          <span className="adm-photo-empty">Belum ada foto</span>
        )}
      </div>

      <b>{label}</b>
      <small>{hint}</small>

      {pesan && (
        <p className={salah ? 'adm-error' : 'adm-ok'} role={salah ? 'alert' : 'status'}>{pesan}</p>
      )}
      <form action={naikAction}>
        <input type="hidden" name="product_id" value={productId} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="alt" value={alt} />
        <PemotongGambar aturan={ATURAN_PRODUK} onSiap={setSiap}>
          <button className="btn btn--sm" type="submit" disabled={pending || !siap}>
            {pending ? 'Mengunggah…' : photo ? 'Ganti foto' : 'Unggah'}
          </button>
        </PemotongGambar>
      </form>

      {/* Teks alternatif — bisa disunting sendiri, tanpa mengunggah ulang.
          Saat belum ada foto, nilainya ikut terkirim bersama unggahan pertama. */}
      <label className="adm-field adm-altfield">
        <span>Teks alternatif</span>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Gambarkan isi fotonya"
        />
      </label>
      {photo && (
        <form action={altAction} className="adm-altsave">
          <input type="hidden" name="photo_id" value={photo.id} />
          <input type="hidden" name="product_id" value={productId} />
          <input type="hidden" name="alt" value={alt} />
          <button className="btn btn--sm btn--ghost" type="submit">Simpan teks</button>
        </form>
      )}

      {photo && (
        <form action={buangAction}>
          <input type="hidden" name="photo_id" value={photo.id} />
          <input type="hidden" name="product_id" value={productId} />
          <ConfirmSubmit className="btn btn--sm btn--danger" confirmLabel="Yakin?">
            Hapus
          </ConfirmSubmit>
        </form>
      )}
    </div>
  );
}
