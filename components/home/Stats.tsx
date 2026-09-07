'use client';

import { useEffect, useRef } from 'react';

/* Angka menghitung naik saat blok ini masuk layar. Dipicu event
   `kairos:reveal` yang dikirim SiteChrome — sama seperti mockup. */
export default function Stats() {
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
      <div className="stat">
        <div className="n" data-to="15">
          0<em>+</em>
        </div>
        <div className="c">Tahun melayani industri</div>
      </div>
      <div className="stat">
        <div className="n" data-to="2400">
          0
        </div>
        <div className="c">Item stok siap kirim</div>
      </div>
      <div className="stat">
        <div className="n" data-to="34">
          0
        </div>
        <div className="c">Provinsi terjangkau</div>
      </div>
    </div>
  );
}
