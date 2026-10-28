'use client';

import { useEffect, useRef } from 'react';
import { bacaAngka } from '@/lib/angka';

/* Angka menghitung naik saat blok ini masuk layar. Dipicu event
   `kairos:reveal` yang dikirim SiteChrome — sama seperti mockup.
   Angka dan keterangannya dari naskah beranda (/admin/beranda). */
export default function Stats({ items }: { items: { nilai: string; label: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function countUp(el: HTMLElement) {
      const to = +(el.dataset.to ?? 0);
      const plus = el.querySelector('em') ? '<em>+</em>' : '';
      if (reduceMotion) {
        el.innerHTML = to.toLocaleString('id-ID') + plus;
        return;
      }
      const t0 = performance.now();
      const dur = 1300;
      (function step(t: number) {
        const p = Math.min(1, (t - t0) / dur);
        el.innerHTML = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('id-ID') + plus;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }

    const onReveal = (e: Event) => {
      const detail = (e as CustomEvent).detail as Element;
      if (detail !== root) return;
      root.querySelectorAll<HTMLElement>('[data-to]').forEach(countUp);
    };

    document.addEventListener('kairos:reveal', onReveal);
    return () => document.removeEventListener('kairos:reveal', onReveal);
  }, []);

  return (
    <div className="stats rv" ref={ref}>
      {items.map((it, i) => {
        const a = bacaAngka(it.nilai);
        return (
          <div className="stat" key={i}>
            {/* Angka → mulai dari 0 lalu dihitung naik. Bukan angka (mis.
                "ISO") → tampil apa adanya, tanpa animasi. */}
            {a ? (
              <div className="n" data-to={a.ke}>
                0{a.plus && <em>+</em>}
              </div>
            ) : (
              <div className="n">{it.nilai}</div>
            )}
            <div className="c">{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}
