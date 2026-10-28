'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/* Peta id produk → pilihan kategori pada formulir. Dipakai saat pengunjung
   datang dari panel detail di /produk (…?produk=hex-bolt#kontak). */
const CATEGORY_BY_PRODUCT: Record<string, string> = {
  'hex-bolt': 'Hex Bolt',
  'carriage-bolt': 'Carriage Bolt',
  'socket-cap': 'Lainnya',
  'hex-nut': 'Mur & Ring',
  'ring-washer': 'Mur & Ring',
  'snap-ring': 'Snap Ring',
  'as-drat': 'As Drat / Stud',
  'anchor-bolt': 'Anchor Bolt',
  'baut-struktur': 'Lainnya',
};

/* Semua teks formulir — dari naskah beranda (b_form_*), diatur di
   /admin/beranda. `pilihan` = satu pilihan per baris. */
export type TeksForm = {
  labelNama: string; phNama: string; labelPerusahaan: string; phPerusahaan: string;
  opsional: string; labelEmail: string; phEmail: string; labelWa: string; phWa: string;
  labelKategori: string; pilihan: string[]; labelSpek: string; phSpek: string;
  tombol: string; tombolTerkirim: string; catatan: string; galat: string; berhasil: string;
};

export default function QuoteForm({ teks }: { teks: TeksForm }) {
  const OPTIONS = teks.pilihan;
  const formRef = useRef<HTMLFormElement>(null);
  const [kategori, setKategori] = useState(OPTIONS[0] ?? '');
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<{ text: string; color?: string }>({
    text: teks.catatan,
  });

  const params = useSearchParams();
  const produk = params.get('produk');

  useEffect(() => {
    if (!produk) return;
    const want = CATEGORY_BY_PRODUCT[produk];
    /* Pilihan bisa diganti admin — kalau nama kategorinya tidak ada lagi,
       biarkan pilihan bawaan daripada memilih sesuatu yang tidak tampil. */
    if (want && OPTIONS.includes(want)) setKategori(want);
  }, [produk, OPTIONS]);

  /* Mockup: belum dikirim ke mana pun. Diganti Server Action di bagian
     berikutnya, begitu tabel penawaran ada di Supabase. */
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    if (!form.checkValidity()) {
      setStatus({ text: teks.galat, color: '#B4342A' });
      form.querySelector<HTMLElement>(':invalid')?.focus();
      return;
    }
    setSent(true);
    setStatus({
      text: teks.berhasil,
      color: 'var(--green-ink)',
    });
  }

  return (
    <form className="form" id="qform" noValidate ref={formRef} onSubmit={onSubmit}>
      <div className="r2">
        <div className="f">
          <label htmlFor="t1">{teks.labelNama}</label>
          <input id="t1" name="nama" autoComplete="name" placeholder={teks.phNama} required />
        </div>
        <div className="f">
          <label htmlFor="t2">
            {teks.labelPerusahaan} <span className="opt">{teks.opsional}</span>
          </label>
          <input id="t2" name="perusahaan" autoComplete="organization" placeholder={teks.phPerusahaan} />
        </div>
      </div>
      <div className="r2">
        <div className="f">
          <label htmlFor="t3">{teks.labelEmail}</label>
          <input
            id="t3"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={teks.phEmail}
            required
          />
        </div>
        <div className="f">
          <label htmlFor="t4">{teks.labelWa}</label>
          <input
            id="t4"
            name="wa"
            type="tel"
            autoComplete="tel"
            placeholder={teks.phWa}
            required
          />
        </div>
      </div>
      <div className="f">
        <label htmlFor="t5">{teks.labelKategori}</label>
        <select id="t5" name="kategori" value={kategori} onChange={(e) => setKategori(e.target.value)}>
          {OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="f">
        <label htmlFor="t6">{teks.labelSpek}</label>
        <textarea
          id="t6"
          name="spesifikasi"
          rows={3}
          placeholder={teks.phSpek}
          required
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <button className="btn" type="submit">
          {sent ? teks.tombolTerkirim : teks.tombol}
        </button>
        <p className="formnote" role="status" id="qstatus" style={{ color: status.color }}>
          {status.text}
        </p>
      </div>
    </form>
  );
}
