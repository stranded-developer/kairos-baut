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

const OPTIONS = [
  'Hex Bolt',
  'Carriage Bolt',
  'Mur & Ring',
  'As Drat / Stud',
  'Anchor Bolt',
  'Snap Ring',
  'Lainnya',
];

export default function QuoteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [kategori, setKategori] = useState('Hex Bolt');
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<{ text: string; color?: string }>({
    text: 'Dibalas dalam 1×24 jam kerja.',
  });

  const params = useSearchParams();
  const produk = params.get('produk');

  useEffect(() => {
    if (!produk) return;
    const want = CATEGORY_BY_PRODUCT[produk];
    if (want) setKategori(want);
  }, [produk]);

  /* Mockup: belum dikirim ke mana pun. Diganti Server Action di bagian
     berikutnya, begitu tabel penawaran ada di Supabase. */
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    if (!form.checkValidity()) {
      setStatus({ text: 'Lengkapi dulu kolom yang wajib diisi.', color: '#B4342A' });
      form.querySelector<HTMLElement>(':invalid')?.focus();
      return;
    }
    setSent(true);
    setStatus({
      text: 'Permintaan diterima. Tim kami membalas dalam 1×24 jam kerja.',
      color: 'var(--green-ink)',
    });
  }

  return (
    <form className="form" id="qform" noValidate ref={formRef} onSubmit={onSubmit}>
      <div className="r2">
        <div className="f">
          <label htmlFor="t1">Nama</label>
          <input id="t1" name="nama" autoComplete="name" placeholder="Nama lengkap" required />
        </div>
        <div className="f">
          <label htmlFor="t2">
            Perusahaan <span className="opt">(opsional)</span>
          </label>
          <input id="t2" name="perusahaan" autoComplete="organization" placeholder="PT / CV" />
        </div>
      </div>
      <div className="r2">
        <div className="f">
          <label htmlFor="t3">Email</label>
          <input
            id="t3"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@perusahaan.co.id"
            required
          />
        </div>
        <div className="f">
          <label htmlFor="t4">Nomor WhatsApp</label>
          <input
            id="t4"
            name="wa"
            type="tel"
            autoComplete="tel"
            placeholder="08xx xxxx xxxx"
            required
          />
        </div>
      </div>
      <div className="f">
        <label htmlFor="t5">Kategori produk</label>
        <select id="t5" name="kategori" value={kategori} onChange={(e) => setKategori(e.target.value)}>
          {OPTIONS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="f">
        <label htmlFor="t6">Spesifikasi &amp; jumlah</label>
        <textarea
          id="t6"
          name="spesifikasi"
          rows={3}
          placeholder="Hex bolt M16 × 60, grade 8.8, HDG — 500 pcs"
          required
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <button className="btn" type="submit">
          {sent ? 'Terkirim ✓' : 'Kirim Permintaan'}
        </button>
        <p className="formnote" role="status" id="qstatus" style={{ color: status.color }}>
          {status.text}
        </p>
      </div>
    </form>
  );
}
