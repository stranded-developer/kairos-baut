/* ============================================================================
   KAIROS BAUT — pemilih opsi tampilan kepala halaman (navbar ↔ beranda).

   Lima opsi, semuanya hidup di halaman aslinya — tinggal ditekan bergantian
   saat presentasi. Pilihan tersimpan di localStorage, jadi berpindah ke
   halaman Produk / Blog tidak mengulang dari nol.

   Tautan langsung ke satu opsi (untuk dikirim ke orang lain):
     index.html?nav=a  …  index.html?nav=e
   Tombol "Salin tautan" menyalin tautan opsi yang sedang tampil.

   INI ALAT REVIEW. Lihat catatan penghapusan di kairos-variants.css.
   ========================================================================= */
(function () {
  'use strict';

  var LS = 'kairos.nav.v1';
  var BAR_H = 44;

  var OPTS = [
    { id: 'a', label: 'A · Sekarang',    note: 'Pembanding — navbar putih, beranda putih, persis versi yang lalu' },
    { id: 'b', label: 'B · Pita hijau',  note: 'Navbar hijau tua pekat. Kontras paling tegas, halaman di bawahnya tidak berubah' },
    { id: 'c', label: 'C · Gradasi',     note: 'Navbar putih bergaris hijau + hero bergradasi hijau ke putih. Paling halus' },
    { id: 'd', label: 'D · Foto latar',  note: 'Foto stok jadi latar hero selebar layar, navbar putih dibiarkan apa adanya' },
    { id: 'e', label: 'E · Foto penuh',  note: 'Sama seperti D, tapi navbar transparan di atas foto dan memadat saat digulir' }
  ];

  var ids = OPTS.map(function (o) { return o.id; });

  /* URL menang atas localStorage — supaya tautan yang dikirim selalu
     membuka opsi yang dimaksud, bukan pilihan terakhir pembacanya. */
  var fromUrl = (new URLSearchParams(location.search).get('nav') || '').toLowerCase();
  var current = ids.indexOf(fromUrl) > -1 ? fromUrl : null;
  var open = true;

  try {
    var saved = JSON.parse(localStorage.getItem(LS) || '{}');
    if (!current && ids.indexOf(saved.nav) > -1) current = saved.nav;
    if (typeof saved.open === 'boolean') open = saved.open;
  } catch (e) { /* localStorage diblokir — pakai bawaan */ }

  if (!current) current = 'a';

  function save() {
    try { localStorage.setItem(LS, JSON.stringify({ nav: current, open: open })); } catch (e) {}
  }

  function apply() {
    document.documentElement.setAttribute('data-nav', current);
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.nav === current));
    });
    save();
  }

  /* ---------- Batang ---------- */
  var bar = document.createElement('div');
  bar.id = 'vbar';
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'Opsi tampilan navbar — hanya untuk review');

  var cap = document.createElement('span');
  cap.className = 'cap';
  cap.textContent = 'Tampilan';
  bar.appendChild(cap);

  var buttons = OPTS.map(function (o) {
    var b = document.createElement('button');
    b.type = 'button';
    b.dataset.nav = o.id;
    b.textContent = o.label;
    b.title = o.note;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { current = o.id; apply(); });
    bar.appendChild(b);
    return b;
  });

  var sp = document.createElement('div');
  sp.className = 'sp';
  bar.appendChild(sp);

  var copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'ghost';
  copy.textContent = 'Salin tautan';
  copy.title = 'Salin tautan ke opsi yang sedang tampil';
  copy.addEventListener('click', function () {
    var u = new URL(location.href);
    u.searchParams.set('nav', current);
    var text = u.href;
    var done = function () {
      copy.textContent = 'Tersalin ✓';
      setTimeout(function () { copy.textContent = 'Salin tautan'; }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { prompt('Salin:', text); });
    else prompt('Salin:', text);
  });
  bar.appendChild(copy);

  var hide = document.createElement('button');
  hide.type = 'button';
  hide.className = 'ghost';
  hide.textContent = 'Sembunyikan ✕';
  hide.title = 'Sembunyikan batang ini (untuk screenshot)';
  bar.appendChild(hide);

  var btn = document.createElement('button');
  btn.id = 'vbtn';
  btn.type = 'button';
  btn.textContent = 'A–E';
  btn.title = 'Tampilkan pemilih opsi';

  function barHeight() { return innerWidth <= 760 ? 40 : BAR_H; }

  function setOpen(v) {
    open = v;
    bar.hidden = !v;
    btn.hidden = v;
    document.documentElement.style.setProperty('--vbar-h', v ? barHeight() + 'px' : '0px');
    document.body.style.paddingTop = v ? barHeight() + 'px' : '';
    save();
    (v ? hide : btn).focus();
  }

  hide.addEventListener('click', function () { setOpen(false); });
  btn.addEventListener('click', function () { setOpen(true); });

  /* Angka 1–5 memindah opsi tanpa menyentuh tetikus — enak saat presentasi. */
  addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    var n = ids[+e.key - 1];
    if (n) { current = n; apply(); }
  });

  addEventListener('resize', function () {
    if (!open) return;
    document.documentElement.style.setProperty('--vbar-h', barHeight() + 'px');
    document.body.style.paddingTop = barHeight() + 'px';
  });

  function mount() {
    document.body.insertBefore(bar, document.body.firstChild);
    document.body.appendChild(btn);
    bar.hidden = !open;
    btn.hidden = open;
    document.documentElement.style.setProperty('--vbar-h', open ? barHeight() + 'px' : '0px');
    if (open) document.body.style.paddingTop = barHeight() + 'px';
    apply();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
