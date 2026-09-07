'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { ART, type Product } from '@/lib/data/products';
import type { SaveState } from './actions';

/* Baris berurutan — indeks dipakai sebagai kunci React karena label boleh
   kosong dan boleh berubah saat diketik. */
type Baris = { label: string; value: string };

const KATEGORI = [
  { v: 'baut', l: 'Baut' },
  { v: 'mur', l: 'Mur & Ring' },
  { v: 'batang', l: 'Batang Ulir' },
  { v: 'angkur', l: 'Angkur' },
];
const STOK = [
  { v: 'ready', l: 'Ready — siap kirim' },
  { v: 'low', l: 'Terbatas' },
  { v: 'indent', l: 'Indent' },
];

export default function ProductForm({
  product,
  action,
  mode,
}: {
  product: Partial<Product> & { sort_order?: number; published?: boolean };
  action: (prev: SaveState, fd: FormData) => Promise<SaveState>;
  mode: 'baru' | 'ubah';
}) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(action, {});

  const [spec, setSpec] = useState<Baris[]>(
    Object.entries(product.spec ?? {}).map(([label, value]) => ({ label, value }))
  );
  const [finish, setFinish] = useState<string[]>(product.finish ?? []);
  const [apps, setApps] = useState<string[]>(product.apps ?? []);
  const [art, setArt] = useState(product.art ?? 'hex');

  const geser = (i: number, arah: -1 | 1) => {
    const j = i + arah;
    if (j < 0 || j >= spec.length) return;
    const next = [...spec];
    [next[i], next[j]] = [next[j], next[i]];
    setSpec(next);
  };

  return (
    <form action={formAction} className="adm-form">
      {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state.ok && <p className="adm-ok" role="status">{state.ok}</p>}

      <div className="adm-cols">
        {/* ---------- kolom kiri ---------- */}
        <div>
          <fieldset className="adm-set">
            <legend>Dasar</legend>

            <label className="adm-field">
              <span>Nama produk</span>
              <input name="name" defaultValue={product.name ?? ''} required />
            </label>

            <label className="adm-field">
              <span>Sub-judul</span>
              <input name="sub" defaultValue={product.sub ?? ''} placeholder="Baut kepala segi enam" />
            </label>

            <label className="adm-field">
              <span>ID / slug</span>
              <input
                name="id"
                defaultValue={product.id ?? ''}
                required
                pattern="[a-z0-9\-]+"
                readOnly={mode === 'ubah'}
                title="Huruf kecil, angka, dan tanda hubung"
              />
              <small>
                {mode === 'ubah'
                  ? 'Tidak bisa diubah — dipakai sebagai tautan #id di halaman produk.'
                  : 'Huruf kecil, angka, tanda hubung. Dipakai sebagai tautan, mis. /produk#hex-bolt'}
              </small>
            </label>

            <div className="adm-row2">
              <label className="adm-field">
                <span>Kategori</span>
                <select name="cat" defaultValue={product.cat ?? 'baut'}>
                  {KATEGORI.map((k) => <option key={k.v} value={k.v}>{k.l}</option>)}
                </select>
              </label>
              <label className="adm-field">
                <span>Stok</span>
                <select name="stock" defaultValue={product.stock ?? 'ready'}>
                  {STOK.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </label>
            </div>

            <div className="adm-row2">
              <label className="adm-field">
                <span>Standar</span>
                <input name="std" defaultValue={product.std ?? ''} placeholder="DIN 933 / 931" />
              </label>
              <label className="adm-field">
                <span>Ukuran</span>
                <input name="size" defaultValue={product.size ?? ''} placeholder="M4 – M48" />
              </label>
            </div>

            <div className="adm-row2">
              <label className="adm-field">
                <span>Grade</span>
                <input name="grade" defaultValue={product.grade ?? ''} placeholder="4.8 · 8.8 · 10.9" />
              </label>
              <label className="adm-field">
                <span>Material</span>
                <input name="mat" defaultValue={product.mat ?? ''} placeholder="Carbon · SS304" />
              </label>
            </div>

            <label className="adm-field">
              <span>Deskripsi</span>
              <textarea name="description" rows={5} defaultValue={product.desc ?? ''} />
              <small>Tampil di panel detail produk.</small>
            </label>
          </fieldset>

          <fieldset className="adm-set">
            <legend>Gambar vektor</legend>
            <div className="adm-artgrid">
              {Object.keys(ART).map((k) => (
                <button
                  type="button"
                  key={k}
                  className="adm-art"
                  aria-pressed={art === k}
                  onClick={() => setArt(k)}
                  title={k}
                >
                  <svg viewBox="0 0 120 80" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ART[k] }} />
                </button>
              ))}
            </div>
            <input type="hidden" name="art" value={art} />
            <small>
              Dipakai selama foto asli belum diunggah. Unggahan foto menyusul di
              halaman terpisah.
            </small>
          </fieldset>
        </div>

        {/* ---------- kolom kanan ---------- */}
        <div>
          <fieldset className="adm-set">
            <legend>Tabel spesifikasi</legend>
            <p className="adm-hint">
              Urutan baris di sini persis urutan yang tampil di situs. Pakai ↑ ↓
              untuk menggeser.
            </p>
            {spec.map((r, i) => (
              <div className="adm-specrow" key={i}>
                <input
                  name="spec_label"
                  value={r.label}
                  placeholder="Label, mis. Standar"
                  onChange={(e) => {
                    const n = [...spec]; n[i] = { ...n[i], label: e.target.value }; setSpec(n);
                  }}
                />
                <input
                  name="spec_value"
                  value={r.value}
                  placeholder="Nilai"
                  onChange={(e) => {
                    const n = [...spec]; n[i] = { ...n[i], value: e.target.value }; setSpec(n);
                  }}
                />
                <div className="adm-rowbtns">
                  <button type="button" onClick={() => geser(i, -1)} disabled={i === 0} aria-label="Naikkan">↑</button>
                  <button type="button" onClick={() => geser(i, 1)} disabled={i === spec.length - 1} aria-label="Turunkan">↓</button>
                  <button type="button" onClick={() => setSpec(spec.filter((_, x) => x !== i))} aria-label="Hapus baris">×</button>
                </div>
              </div>
            ))}
            <button type="button" className="adm-add" onClick={() => setSpec([...spec, { label: '', value: '' }])}>
              + Tambah baris
            </button>
          </fieldset>

          <ListField
            legend="Finishing"
            hint="Tampil sebagai chip di panel detail."
            name="finish"
            items={finish}
            setItems={setFinish}
            placeholder="Zinc plating"
          />

          <ListField
            legend="Dipakai untuk"
            hint="Tampil sebagai daftar berpoin."
            name="apps"
            items={apps}
            setItems={setApps}
            placeholder="Perakitan rangka mesin"
          />

          <fieldset className="adm-set">
            <legend>Penerbitan</legend>
            <div className="adm-row2">
              <label className="adm-field">
                <span>Urutan</span>
                <input name="sort_order" type="number" defaultValue={product.sort_order ?? 0} />
                <small>Kecil tampil lebih dulu.</small>
              </label>
              <label className="adm-check">
                <input type="checkbox" name="published" defaultChecked={product.published ?? true} />
                <span>Tampilkan di situs</span>
              </label>
            </div>
          </fieldset>
        </div>
      </div>

      <div className="adm-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Menyimpan…' : mode === 'baru' ? 'Buat produk' : 'Simpan perubahan'}
        </button>
        <Link className="btn btn--ghost" href="/admin/produk">Kembali</Link>
      </div>
    </form>
  );
}

function ListField({
  legend, hint, name, items, setItems, placeholder,
}: {
  legend: string; hint: string; name: string;
  items: string[]; setItems: (v: string[]) => void; placeholder: string;
}) {
  return (
    <fieldset className="adm-set">
      <legend>{legend}</legend>
      <p className="adm-hint">{hint}</p>
      {items.map((v, i) => (
        <div className="adm-listrow" key={i}>
          <input
            name={name}
            value={v}
            placeholder={placeholder}
            onChange={(e) => {
              const n = [...items]; n[i] = e.target.value; setItems(n);
            }}
          />
          <button type="button" onClick={() => setItems(items.filter((_, x) => x !== i))} aria-label="Hapus">×</button>
        </div>
      ))}
      <button type="button" className="adm-add" onClick={() => setItems([...items, ''])}>
        + Tambah
      </button>
    </fieldset>
  );
}
