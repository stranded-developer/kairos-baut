'use client';

import { useState } from 'react';
import PhotoSlot from '@/components/PhotoSlot';

export interface Panel {
  img: string;
  alt: string;
  idx: string;
  h3: string;
  body: string;
}

/* Hover di desktop (CSS), tap/klik di layar sentuh (aria-expanded).
   Foto dan teks alternatifnya datang dari site_media; teks panel tetap di
   halaman karena itu naskah beranda, bukan data produk. */
export default function IndustryPanels({ panels }: { panels: Panel[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="panels rv">
      {panels.map((p, i) => (
        <button
          key={p.idx}
          className="panel"
          type="button"
          aria-expanded={open === i}
          onClick={() => setOpen(open === i ? null : i)}
        >
          <PhotoSlot className="shot ph" src={p.img} alt={p.alt} />
          <div className="panel-in">
            <span className="idx">{p.idx}</span>
            <h3>{p.h3}</h3>
            <div className="body">{p.body}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
