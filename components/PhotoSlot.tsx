'use client';

import { useState, type ElementType, type ReactNode } from 'react';

/* ============================================================================
   Slot foto dengan cadangan — pengganti pola `data-ph` + onload/onerror
   inline pada mockup statis (lihat kairos.css baris 371).

   Berkas foto ada     → kelas `ok` dipasang pada pembungkus, foto tampil.
   Berkas foto hilang  → <img> dilepas, isi cadangan yang tampil.
                         Tata letak tidak pernah kosong.

   Kelas pembungkus DIKIRIM PENUH oleh pemanggil, tidak ditambah-tambahi di
   sini: `.ph` dan `.lg` punya kontrak CSS yang berbeda —
     .ph  → position:relative; overflow:hidden; latar --off; pakai .ph-alt
     .lg  → marquee logo klien; .lg.ok img{display:block} + .lg.ok b{display:none}
   Memaksakan `.ph` pada logo klien akan merusak barisan marquee.
   ========================================================================= */
export default function PhotoSlot({
  as: Tag = 'div',
  className = '',
  src,
  alt,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  src: string;
  alt: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  const [state, setState] = useState<'loading' | 'ok' | 'failed'>('loading');

  const cls = state === 'ok' ? `${className} ok`.trim() : className;

  return (
    <Tag className={cls} data-ph="" {...rest}>
      {state !== 'failed' && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt={alt} onLoad={() => setState('ok')} onError={() => setState('failed')} />
      )}
      {children}
    </Tag>
  );
}
