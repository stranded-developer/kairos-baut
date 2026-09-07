'use client';

import { useEffect } from 'react';

/* ============================================================================
   Perilaku bersama — pindahan dari kairos.js pada mockup statis.
   · header sticky (kelas .stuck saat digulir)
   · menu mobile: aria-expanded, Esc, klik di luar, kunci scroll
   · reveal saat scroll + event `kairos:reveal` untuk animasi per halaman
   ========================================================================= */
export function useSiteChrome() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];

    /* ---------- Header ---------- */
    const hdr = document.getElementById('hdr');
    if (hdr) {
      let tick = false;
      const onScroll = () => {
        if (tick) return;
        tick = true;
        requestAnimationFrame(() => {
          hdr.classList.toggle('stuck', scrollY > 12);
          tick = false;
        });
      };
      addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      cleanups.push(() => removeEventListener('scroll', onScroll));
    }

    /* ---------- Menu mobile ---------- */
    const burger = document.getElementById('burger');
    const mobnav = document.getElementById('mobnav');

    const setMenu = (open: boolean) => {
      if (!burger || !mobnav) return;
      burger.setAttribute('aria-expanded', String(open));
      mobnav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    if (burger && mobnav) {
      const onBurger = () => setMenu(burger.getAttribute('aria-expanded') !== 'true');
      const onNav = (e: Event) => {
        if ((e.target as HTMLElement).closest('a')) setMenu(false);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
          setMenu(false);
          (burger as HTMLElement).focus();
        }
      };
      const onOutside = (e: MouseEvent) => {
        if (burger.getAttribute('aria-expanded') !== 'true') return;
        const t = e.target as HTMLElement;
        if (!t.closest('#mobnav') && !t.closest('#burger')) setMenu(false);
      };
      const onResize = () => {
        if (innerWidth > 1000) setMenu(false);
      };

      burger.addEventListener('click', onBurger);
      mobnav.addEventListener('click', onNav);
      addEventListener('keydown', onKey);
      addEventListener('click', onOutside);
      addEventListener('resize', onResize);

      cleanups.push(() => {
        burger.removeEventListener('click', onBurger);
        mobnav.removeEventListener('click', onNav);
        removeEventListener('keydown', onKey);
        removeEventListener('click', onOutside);
        removeEventListener('resize', onResize);
        document.body.style.overflow = '';
      });
    }

    /* ---------- Reveal ---------- */
    const reveal = (el: Element) => {
      el.classList.add('in');
      document.dispatchEvent(new CustomEvent('kairos:reveal', { detail: el }));
    };

    const targets = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window) || reduce) {
      targets.forEach(reveal);
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      targets.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
}

export default function SiteChrome() {
  useSiteChrome();
  return null;
}
