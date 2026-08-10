/* ============================================================================
   KAIROS BAUT — perilaku bersama untuk semua halaman mockup.
   · header sticky
   · menu mobile (Draft 4 punya tombol burger yang belum berfungsi — ini yang
     membuatnya benar-benar jalan: aria-expanded, Esc, klik di luar, kunci scroll)
   · reveal saat scroll, dan event `kairos:reveal` untuk animasi per halaman
   ========================================================================= */
(function () {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header ---------- */
  var hdr = document.getElementById('hdr');
  if (hdr) {
    var tick = false;
    addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        hdr.classList.toggle('stuck', scrollY > 12);
        tick = false;
      });
    }, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var mobnav = document.getElementById('mobnav');

  function setMenu(open) {
    if (!burger || !mobnav) return;
    burger.setAttribute('aria-expanded', String(open));
    mobnav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (burger && mobnav) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    mobnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });
    addEventListener('click', function (e) {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      if (!e.target.closest('#mobnav') && !e.target.closest('#burger')) setMenu(false);
    });
    addEventListener('resize', function () {
      if (innerWidth > 1000) setMenu(false);
    });
  }

  /* ---------- Reveal ---------- */
  function reveal(el) {
    el.classList.add('in');
    document.dispatchEvent(new CustomEvent('kairos:reveal', { detail: el }));
  }

  var targets = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || reduce) {
    targets.forEach(reveal);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }
})();
