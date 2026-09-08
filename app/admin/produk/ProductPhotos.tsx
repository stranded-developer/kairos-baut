'use client';

import { useActionState, useRef, useState } from 'react';
import {
  unggahFotoProduk,
  hapusFotoProduk,
  simpanAltProduk,
  type FotoProdukState,
} from './foto-actions';
import ConfirmSubmit from '@/components/ConfirmSubmit';
import { useGambarTerpilih } from '@/components/useGambarTerpilih';
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
  const fileRef = useRef<HTMLInputElement>(null);
  const gambar = useGambarTerpilih(ATURAN_PRODUK);
  const pratinjau = gambar.pratinjau;
  /* Dikendalikan React supaya nilai yang diketik sebelum mengunggah ikut
     terkirim bersama berkasnya, bukan hilang. */
  const [alt, setAlt] = useState(photo?.alt ?? '');

  /* Galat dari browser didahulukan: ia muncul seketika saat berkas dipilih,
     sedangkan pesan server baru ada setelah unggahan. */
  const pesan = gambar.galat ?? naik.error ?? buang.error ?? altState.error ?? naik.ok ?? buang.ok ?? altState.ok;
  const salah = !!(gambar.galat || naik.error || buang.error || altState.error);

  return (
    <div className="adm-photo">
      <div className="adm-photo-pic">
        {pratinjau || photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={pratinjau ?? photo!.url} alt="" />
        ) : (
          <span className="adm-photo-empty">Belum ada foto</span>
        )}
        {pratinjau && <span className="adm-tag adm-tag--new">Belum disimpan</span>}
      </div>

      <b>{label}</b>
      <small>{hint}</small>

      {pesan && (
        <p className={salah ? 'adm-error' : 'adm-ok'} role={salah ? 'alert' : 'status'}>{pesan}</p>
      )}
      {/* Keterangan pemotongan — pemberitahuan, bukan galat. Kotak pratinjau
          di atas sudah 4:3 + cover, jadi yang terlihat = yang tersimpan. */}
      {!salah && gambar.catatanPotong && <p className="adm-crop">{gambar.catatanPotong}</p>}

      <form action={naikAction}>
        <input type="hidden" name="product_id" value={productId} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="alt" value={alt} />
        <input
          ref={fileRef}
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="adm-file"
          onChange={(e) => gambar.pilih(e.target.files?.[0] ?? null)}
        />
        {gambar.namaBerkas && <p className="adm-filename">{gambar.namaBerkas}</p>}
        {/* Tombol mati selama rasionya belum benar — tidak ada gunanya
            mengirim 8 MB hanya untuk ditolak server. */}
        <button className="btn btn--sm" type="submit" disabled={pending || !gambar.siap}>
          {pending ? 'Mengunggah…' : photo ? 'Ganti foto' : 'Unggah'}
        </button>
        {pratinjau && (
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            onClick={() => { gambar.reset(); if (fileRef.current) fileRef.current.value = ''; }}
          >
            Batal
          </button>
        )}
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
