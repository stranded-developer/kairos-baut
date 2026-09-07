'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { TOPIK, buatSlug, hitungWaktuBaca } from '@/lib/post-form';
import type { PostState } from './actions';

export interface PostData {
  slug?: string; title?: string; topic?: string; excerpt?: string; body?: string;
  art?: string; reading_time?: string | null; featured?: boolean;
  published?: boolean; published_at?: string;
}

/* Beberapa ilustrasi siap pakai — sama gayanya dengan yang ada di mockup
   (garis, stroke 1.3, viewBox 24). Admin tidak perlu menulis SVG. */
const ILUSTRASI: { k: string; l: string; d: string }[] = [
  { k: 'perisai', l: 'Standar / mutu', d: '<path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z"/><path d="M12 8v7"/><path d="M9.5 10.5 12 8l2.5 2.5"/>' },
  { k: 'cincin', l: 'Snap ring', d: '<path d="M12 3a9 9 0 1 1-4 17" stroke-linecap="round"/><circle cx="12" cy="3" r="1.6" fill="currentColor" stroke="none"/><circle cx="8" cy="20" r="1.6" fill="currentColor" stroke="none"/>' },
  { k: 'ulir', l: 'As drat', d: '<path d="M3 10h18v4H3z"/><path d="M6 10v4M10 10v4M14 10v4M18 10v4"/>' },
  { k: 'gudang', l: 'Material', d: '<path d="M4 18V8l8-4 8 4v10"/><path d="M4 18h16"/><path d="M9 18v-5h6v5"/>' },
  { k: 'jam', l: 'Torsi / waktu', d: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>' },
  { k: 'dokumen', l: 'Sertifikat', d: '<path d="M5 6h14v12H5z"/><path d="M8 10h8M8 14h5"/>' },
  { k: 'angkur', l: 'Angkur', d: '<path d="M12 4v16"/><path d="M7 9h10"/><path d="M9 20h6"/>' },
];

export default function PostForm({
  post, action, mode,
}: {
  post: PostData;
  action: (prev: PostState, fd: FormData) => Promise<PostState>;
  mode: 'baru' | 'ubah';
}) {
  const [state, formAction, pending] = useActionState<PostState, FormData>(action, {});
  const [title, setTitle] = useState(post.title ?? '');
  const [slug, setSlug] = useState(post.slug ?? '');
  const [slugDisentuh, setSlugDisentuh] = useState(mode === 'ubah');
  const [body, setBody] = useState(post.body ?? '');
  const [art, setArt] = useState(post.art ?? ILUSTRASI[0].d);

  const kata = body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <form action={formAction} className="adm-form">
      {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      {state.ok && <p className="adm-ok" role="status">{state.ok}</p>}

      <div className="adm-cols">
        <div>
          <fieldset className="adm-set">
            <legend>Tulisan</legend>

            <label className="adm-field">
              <span>Judul</span>
              <input
                name="title"
                value={title}
                required
                onChange={(e) => {
                  setTitle(e.target.value);
                  /* Slug ikut judul sampai admin menyuntingnya sendiri. */
                  if (!slugDisentuh) setSlug(buatSlug(e.target.value));
                }}
              />
            </label>

            <label className="adm-field">
              <span>Slug</span>
              <input
                name="slug"
                value={slug}
                required
                pattern="[a-z0-9\-]+"
                readOnly={mode === 'ubah'}
                onChange={(e) => { setSlug(e.target.value); setSlugDisentuh(true); }}
              />
              <small>
                {mode === 'ubah'
                  ? 'Tidak bisa diubah — tautan yang sudah tersebar akan mati.'
                  : 'Dibuat otomatis dari judul. Boleh disunting sebelum disimpan.'}
              </small>
            </label>

            <div className="adm-row2">
              <label className="adm-field">
                <span>Topik</span>
                <select name="topic" defaultValue={post.topic ?? 'Standar'}>
                  {TOPIK.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="adm-field">
                <span>Tanggal terbit</span>
                <input
                  name="published_at"
                  type="date"
                  defaultValue={post.published_at ?? new Date().toISOString().slice(0, 10)}
                  required
                />
              </label>
            </div>

            <label className="adm-field">
              <span>Ringkasan</span>
              <textarea name="excerpt" rows={3} defaultValue={post.excerpt ?? ''} />
              <small>Tampil di kartu daftar blog.</small>
            </label>

            <label className="adm-field">
              <span>Isi tulisan</span>
              <textarea
                name="body"
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tulis isi lengkapnya di sini…"
              />
              <small>
                {kata} kata · perkiraan {hitungWaktuBaca(body)}
              </small>
            </label>
          </fieldset>
        </div>

        <div>
          <fieldset className="adm-set">
            <legend>Ilustrasi kartu</legend>
            <p className="adm-hint">Gambar garis di kartu daftar blog.</p>
            <div className="adm-artgrid">
              {ILUSTRASI.map((i) => (
                <button
                  type="button"
                  key={i.k}
                  className="adm-art"
                  aria-pressed={art === i.d}
                  onClick={() => setArt(i.d)}
                  title={i.l}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"
                       aria-hidden="true" dangerouslySetInnerHTML={{ __html: i.d }} />
                </button>
              ))}
            </div>
            <input type="hidden" name="art" value={art} />
          </fieldset>

          <fieldset className="adm-set">
            <legend>Penerbitan</legend>

            <label className="adm-field">
              <span>Waktu baca</span>
              <input
                name="reading_time"
                defaultValue={post.reading_time ?? ''}
                placeholder={hitungWaktuBaca(body)}
              />
              <small>Kosongkan untuk dihitung otomatis dari isi tulisan.</small>
            </label>

            <label className="adm-check">
              <input type="checkbox" name="featured" defaultChecked={post.featured ?? false} />
              <span>Jadikan tulisan unggulan</span>
            </label>
            <p className="adm-hint" style={{ marginTop: 8 }}>
              Hanya satu tulisan yang bisa jadi unggulan. Mencentang ini otomatis
              melepas unggulan sebelumnya.
            </p>

            <label className="adm-check">
              <input type="checkbox" name="published" defaultChecked={post.published ?? true} />
              <span>Tampilkan di situs</span>
            </label>
          </fieldset>
        </div>
      </div>

      <div className="adm-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? 'Menyimpan…' : mode === 'baru' ? 'Buat tulisan' : 'Simpan perubahan'}
        </button>
        <Link className="btn btn--ghost" href="/admin/blog">Kembali</Link>
      </div>
    </form>
  );
}
