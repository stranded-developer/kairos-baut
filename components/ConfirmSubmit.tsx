'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

/* ============================================================================
   Tombol kirim dua langkah untuk tindakan yang merusak.

   Klik pertama mengubah tombol jadi pertanyaan; klik kedua benar-benar
   mengirim. Dipilih daripada `window.confirm` karena dialog bawaan peramban
   tidak bisa digayakan, tampil beda di tiap peramban, dan diblokir di sebagian
   konteks.

   Pengaman tambahan:
     · kembali batal sendiri setelah 5 detik — supaya tidak ada tombol "siap
       menghapus" yang menganggur di layar;
     · Esc membatalkan;
     · saat menunggu konfirmasi, fokus dipindah ke tombolnya, jadi Enter
       beruntun dari kolom isian tidak bisa memicu penghapusan tanpa sengaja.
   ========================================================================= */
export default function ConfirmSubmit({
  children,
  confirmLabel = 'Yakin? Klik lagi untuk hapus',
  className = 'btn btn--danger',
}: {
  children: React.ReactNode;
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (!armed) return;
    ref.current?.focus();
    const t = setTimeout(() => setArmed(false), 5000);
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setArmed(false);
    };
    addEventListener('keydown', esc);
    return () => {
      clearTimeout(t);
      removeEventListener('keydown', esc);
    };
  }, [armed]);

  if (pending) {
    return (
      <button className={className} type="submit" disabled>
        Menghapus…
      </button>
    );
  }

  return (
    <button
      ref={ref}
      className={`${className}${armed ? ' is-armed' : ''}`}
      type={armed ? 'submit' : 'button'}
      onClick={(e) => {
        if (!armed) {
          e.preventDefault();
          setArmed(true);
        }
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}
