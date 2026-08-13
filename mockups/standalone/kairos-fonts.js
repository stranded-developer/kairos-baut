/* ============================================================================
   KAIROS BAUT — pemilih huruf (font switcher) untuk sesi review klien.

   Batang di paling atas halaman. Klien mencoba huruf secara langsung pada
   halaman aslinya, lalu menekan "Salin pilihan" dan mengirimkannya ke tim
   desain. Pilihan tersimpan di localStorage, jadi berpindah halaman tidak
   mengulang dari nol.

   Tiga kendali:
   · HURUF — huruf utama (isi + judul, bila JUDUL disetel "Sama").
   · JUDUL — huruf khusus judul. Biarkan "Sama" untuk satu huruf saja.
   · LABEL — huruf label kecil/spesifikasi (DIN 933, M4–M48, STOK GUDANG).
             "Mono" inilah yang membuat halaman produk terasa "techy";
             pilih "Sans" agar label ikut huruf utama.

   Semua huruf diambil dari Google Fonts saat dipilih — tidak ada yang perlu
   diunduh atau dipasang manual, semuanya berlisensi bebas (SIL OFL / Apache).

   INI HANYA ALAT REVIEW. Sebelum produksi: hapus <script src="kairos-fonts.js">
   dari tiap halaman, hapus file ini, lalu kunci pilihan final di kairos.css.
   ========================================================================= */
(function () {
  'use strict';

  var LS = 'kairos.font.v2';
  var BAR_H = 44;

  var SYS_SANS = '"Helvetica Neue", Helvetica, "Segoe UI", Arial, sans-serif';
  var SYS_MONO = 'ui-monospace, "SF Mono", "Roboto Mono", Menlo, Consolas, monospace';

  /* Daftar huruf.
       g    — nama keluarga di Google Fonts (null = huruf sistem, tanpa unduhan)
       w    — sumbu berat yang benar-benar tersedia untuk keluarga itu.
              Wajib akurat: css2 menolak permintaan berat yang tidak ada,
              dan huruf gagal termuat.
       note — penjelasan singkat, tampil sebagai tooltip
     Dikelompokkan agar klien bisa membandingkan dalam satu "rasa". */
  var SANS = [
    { grp: 'Netral / korporat' },
    { id: 'sistem',   label: 'Sistem',           g: null, stack: SYS_SANS,       note: 'Helvetica Neue — huruf bawaan perangkat, persis mockup sekarang' },
    { id: 'inter',    label: 'Inter',            g: 'Inter',            w: 'wght@400..800',            note: 'Netral, sangat terbaca. Pilihan paling aman untuk B2B' },
    { id: 'plexsans', label: 'IBM Plex Sans',    g: 'IBM+Plex+Sans',    w: 'wght@400;500;600;700',     note: 'Dirancang IBM untuk dokumen teknik — pas untuk tabel spesifikasi' },
    { id: 'public',   label: 'Public Sans',      g: 'Public+Sans',      w: 'wght@400..800',            note: 'Huruf resmi pemerintah AS — lugas dan institusional' },
    { id: 'source',   label: 'Source Sans 3',    g: 'Source+Sans+3',    w: 'wght@400..800',            note: 'Humanis dan industrial, nyaman untuk teks teknis panjang' },
    { id: 'opensans', label: 'Open Sans',        g: 'Open+Sans',        w: 'wght@400..800',            note: 'Paling umum dipakai — familiar, tidak pernah salah' },
    { id: 'lato',     label: 'Lato',             g: 'Lato',             w: 'wght@400;700;900',         note: 'Korporat klasik, sedikit lebih hangat dari Helvetica' },

    { grp: 'Geometris / modern' },
    { id: 'jakarta',  label: 'Plus Jakarta Sans', g: 'Plus+Jakarta+Sans', w: 'wght@400..800',          note: 'Buatan Tokotype — huruf resmi kota Jakarta. Modern, relevan lokal' },
    { id: 'poppins',  label: 'Poppins',          g: 'Poppins',          w: 'wght@400;500;600;700;800', note: 'Sangat populer di Indonesia — bulat, ramah, mudah dikenali' },
    { id: 'manrope',  label: 'Manrope',          g: 'Manrope',          w: 'wght@400..800',            note: 'Geometris tapi hangat, judul terasa bersih' },
    { id: 'dmsans',   label: 'DM Sans',          g: 'DM+Sans',          w: 'wght@400..800',            note: 'Ringkas dan rapi, cocok untuk antarmuka padat' },
    { id: 'outfit',   label: 'Outfit',           g: 'Outfit',           w: 'wght@400..800',            note: 'Judul tebal terlihat sangat tegas' },
    { id: 'figtree',  label: 'Figtree',          g: 'Figtree',          w: 'wght@400..800',            note: 'Modern dan bersahabat, sedikit lebih lembut' },
    { id: 'urbanist', label: 'Urbanist',         g: 'Urbanist',         w: 'wght@400..800',            note: 'Ramping dan geometris, kesan premium' },

    { grp: 'Tegas / industrial' },
    { id: 'instr',    label: 'Instrument Sans',  g: 'Instrument+Sans',  w: 'wght@400..700',            note: 'Kontemporer, judul terasa mantap dan padat' },
    { id: 'archivo',  label: 'Archivo',          g: 'Archivo',          w: 'wght@400..800',            note: 'Berakar huruf papan nama industri — kuat pada judul besar' },
    { id: 'barlow',   label: 'Barlow',           g: 'Barlow',           w: 'wght@400;500;600;700;800', note: 'Rasa teknik / otomotif, sedikit menyempit sehingga hemat ruang' },
    { id: 'chivo',    label: 'Chivo',            g: 'Chivo',            w: 'wght@400..900',            note: 'Grotesk tegas dengan kontras kuat' },
    { id: 'grotesk',  label: 'Space Grotesk',    g: 'Space+Grotesk',    w: 'wght@400..700',            note: 'Paling berkarakter — tapi paling dekat ke kesan "techy"' },

    { grp: 'Hangat / humanis' },
    { id: 'worksans', label: 'Work Sans',        g: 'Work+Sans',        w: 'wght@400..800',            note: 'Netral hangat, enak dibaca dalam paragraf panjang' },
    { id: 'karla',    label: 'Karla',            g: 'Karla',            w: 'wght@400..800',            note: 'Sedikit nyentrik, membuat halaman terasa tidak kaku' },
    { id: 'rubik',    label: 'Rubik',            g: 'Rubik',            w: 'wght@400..800',            note: 'Sudut membulat — paling ramah, paling tidak "teknis"' },
    { id: 'mulish',   label: 'Mulish',           g: 'Mulish',           w: 'wght@400..800',            note: 'Bersih dan tenang, judul tidak berteriak' }
  ];

  /* Huruf label kecil — menggantikan var(--mono). */
  var LABEL = [
    { id: 'sans',     label: 'Sans (ikut huruf utama)', g: null,                                       note: 'Label memakai huruf utama — paling tidak "techy"' },
    { id: 'mono',     label: 'Mono sistem',      g: null, stack: SYS_MONO,                             note: 'Mono bawaan perangkat — persis mockup sekarang' },
    { id: 'plexmono', label: 'IBM Plex Mono',    g: 'IBM+Plex+Mono',    w: 'wght@400;500;600;700',     note: 'Mono teknik yang lebih lembut dari mono sistem' },
    { id: 'jetbrains',label: 'JetBrains Mono',   g: 'JetBrains+Mono',   w: 'wght@400..700',            note: 'Mono lebar dan jelas, angka sangat terbaca' },
    { id: 'robotomono', label: 'Roboto Mono',    g: 'Roboto+Mono',      w: 'wght@400..700',            note: 'Mono netral, paling tidak mencolok' },
    { id: 'dmmono',   label: 'DM Mono',          g: 'DM+Mono',          w: 'wght@400;500',             note: 'Mono ramping dan tenang' },
    { id: 'spacemono',label: 'Space Mono',       g: 'Space+Mono',       w: 'wght@400;700',             note: 'Paling berkarakter — juga paling "techy"' }
  ];

  /* Huruf judul: "Sama" plus seluruh daftar sans. */
  var DISPLAY = [{ id: 'sama', label: 'Sama dengan huruf utama', same: true, note: 'Judul memakai huruf utama — satu huruf untuk seluruh situs' }]
    .concat(SANS.filter(function (f) { return f.id; }));

  var LISTS = { sans: SANS, display: DISPLAY, label: LABEL };
  var CAPTION = { sans: 'Huruf', display: 'Judul', label: 'Label' };

  var state = { sans: 'sistem', display: 'sama', label: 'mono', open: true };
  try {
    var saved = JSON.parse(localStorage.getItem(LS) || '{}');
    if (saved && typeof saved === 'object') {
      ['sans', 'display', 'label'].forEach(function (k) { if (saved[k]) state[k] = saved[k]; });
      if (typeof saved.open === 'boolean') state.open = saved.open;
    }
  } catch (e) { /* localStorage diblokir — pakai bawaan */ }

  function items(key) { return LISTS[key].filter(function (f) { return f.id; }); }
  function find(key, id) {
    var list = items(key);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }

  /* ---------- Pemuatan Google Fonts (sekali per keluarga) ---------- */
  var loaded = {};
  function loadFamily(g, w) {
    if (!g || loaded[g]) return;
    loaded[g] = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + g + (w ? ':' + w : '') + '&display=swap';
    /* Jaring pengaman: kalau sumbu berat ditolak, muat keluarganya saja
       supaya halaman tidak pernah kehilangan hurufnya sama sekali. */
    link.onerror = function () {
      var plain = document.createElement('link');
      plain.rel = 'stylesheet';
      plain.href = 'https://fonts.googleapis.com/css2?family=' + g + '&display=swap';
      document.head.appendChild(plain);
    };
    document.head.appendChild(link);
  }

  function stackFor(item, fallback) {
    if (item.stack) return item.stack;
    if (!item.g) return fallback;
    return '"' + item.g.replace(/\+/g, ' ') + '", ' + fallback;
  }

  /* ---------- Terapkan ---------- */
  function apply() {
    var s = find('sans', state.sans);
    var d = find('display', state.display);
    var l = find('label', state.label);

    loadFamily(s.g, s.w);
    loadFamily(d.g, d.w);
    loadFamily(l.g, l.w);

    var sansStack = stackFor(s, SYS_SANS);
    var dispStack = d.same ? sansStack : stackFor(d, SYS_SANS);
    var labelStack = l.id === 'sans' ? sansStack : stackFor(l, SYS_MONO);

    var root = document.documentElement.style;
    root.setProperty('--sans', sansStack);
    root.setProperty('--display', dispStack);
    root.setProperty('--mono', labelStack);
    /* Label sans butuh sedikit lebih tebal agar tetap "berbunyi" pada ukuran
       10–11px dengan letter-spacing lebar. */
    root.setProperty('--mono-weight', l.id === 'sans' ? '600' : '400');

    save();
    sync();
  }

  /* ---------- Gaya ---------- */
  var UI = SYS_SANS.replace(/"/g, "'");
  var css = document.createElement('style');
  css.textContent = [
    ':root { --fbar-h: ' + BAR_H + 'px; }',
    'body { padding-top: var(--fbar-h); }',
    'header { top: var(--fbar-h) !important; }',
    'html { scroll-padding-top: calc(88px + var(--fbar-h)); }',
    'h1, h2, h3, h4 { font-family: var(--display, var(--sans)); }',
    '.mono, [class*="mono"] { font-weight: var(--mono-weight, 400); }',

    '#fbar {',
    '  position: fixed; inset: 0 0 auto 0; z-index: 300; height: var(--fbar-h);',
    '  display: flex; align-items: center; gap: 12px; padding: 0 12px;',
    '  background: #0B3A1D; color: #fff; font: 500 12px/1 ' + UI + ';',
    '  overflow-x: auto; overflow-y: visible; scrollbar-width: none;',
    '}',
    '#fbar::-webkit-scrollbar { display: none; }',
    '#fbar[hidden] { display: none; }',
    '#fbar .grp { display: flex; align-items: center; gap: 5px; flex: none; }',
    '#fbar .cap { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.5); }',
    '#fbar button { font: inherit; cursor: pointer; white-space: nowrap; border-radius: 999px;',
    '  border: 1px solid rgba(255,255,255,.22); background: transparent; color: rgba(255,255,255,.85);',
    '  padding: 6px 11px; transition: background .18s, border-color .18s, color .18s; }',
    '#fbar button:hover { background: rgba(255,255,255,.12); color: #fff; }',
    '#fbar button:focus-visible { outline: 2px solid #9FE9B9; outline-offset: 2px; }',
    '#fbar .now { background: #1E9E4A; border-color: #1E9E4A; color: #fff; font-weight: 700; min-width: 96px; }',
    '#fbar .now:hover { background: #23B255; }',
    '#fbar .step { padding: 6px 9px; font-size: 13px; line-height: 1; }',
    '#fbar .sep { flex: none; width: 1px; height: 18px; background: rgba(255,255,255,.18); }',
    '#fbar .sp { flex: 1 1 auto; min-width: 8px; }',
    '#fbar .ghost { border-color: transparent; color: rgba(255,255,255,.62); }',

    /* panel pilihan */
    '#fpanel {',
    '  position: fixed; top: var(--fbar-h); z-index: 310; width: 330px;',
    '  max-height: min(70vh, 560px); overflow-y: auto; overscroll-behavior: contain;',
    '  background: #fff; color: #0E1A12; border: 1px solid #E1E8DF; border-top: 0;',
    '  border-radius: 0 0 12px 12px; box-shadow: 0 24px 60px rgba(11,58,29,.28);',
    '  padding: 6px; font: 400 14px/1.3 ' + UI + ';',
    '}',
    '#fpanel[hidden] { display: none; }',
    '#fpanel .ghd { font: 700 10px/1 ' + UI + '; letter-spacing: .16em; text-transform: uppercase;',
    '  color: #64726A; padding: 14px 12px 7px; }',
    '#fpanel .opt { display: block; width: 100%; text-align: left; cursor: pointer;',
    '  border: 0; background: none; padding: 9px 12px; border-radius: 8px; color: inherit; }',
    '#fpanel .opt:hover { background: #F5F8F4; }',
    '#fpanel .opt[aria-selected="true"] { background: #E9F4EC; }',
    '#fpanel .opt[aria-selected="true"] .nm::after { content: " ✓"; color: #15773A; }',
    '#fpanel .opt:focus-visible { outline: 2px solid #15773A; outline-offset: -2px; }',
    '#fpanel .nm { display: block; font-size: 16px; font-weight: 700; letter-spacing: -.01em; }',
    '#fpanel .sm { display: block; font-size: 12.5px; color: #64726A; margin-top: 3px; }',

    /* tombol buka saat batang disembunyikan */
    '#fbtn { position: fixed; top: 10px; right: 12px; z-index: 300; width: 38px; height: 38px;',
    '  border-radius: 50%; cursor: pointer; border: 1px solid rgba(255,255,255,.2);',
    '  background: #0B3A1D; color: #fff; font: 700 14px/1 ' + UI + ';',
    '  box-shadow: 0 6px 20px rgba(11,58,29,.35); }',
    '#fbtn[hidden] { display: none; }',

    '@media (max-width: 760px) {',
    '  :root { --fbar-h: 40px; }',
    '  #fbar { gap: 8px; font-size: 11.5px; }',
    '  #fbar .cap { display: none; }',
    '  #fbar .now { min-width: 0; }',
    '  #fpanel { width: auto; left: 8px !important; right: 8px; }',
    '}',
    '@media print { #fbar, #fbtn, #fpanel { display: none !important; } body { padding-top: 0; } }'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- Panel ---------- */
  var panel = document.createElement('div');
  panel.id = 'fpanel';
  panel.hidden = true;
  panel.setAttribute('role', 'listbox');
  var panelKey = null;

  /* Pratinjau: satu permintaan untuk semua keluarga, hanya 400/700, dimuat
     sekali saat panel pertama dibuka. Cukup untuk melihat bentuk hurufnya. */
  var previewsLoaded = false;
  function loadPreviews() {
    if (previewsLoaded) return;
    previewsLoaded = true;
    var fams = {};
    SANS.concat(LABEL).forEach(function (f) { if (f.g) fams[f.g] = 1; });
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?' +
      Object.keys(fams).map(function (g) { return 'family=' + g + ':wght@400;700'; }).join('&') +
      '&display=swap';
    document.head.appendChild(link);
  }

  function openPanel(key, anchor) {
    if (panelKey === key) return closePanel();
    panelKey = key;
    loadPreviews();
    panel.innerHTML = '';

    LISTS[key].forEach(function (f) {
      if (f.grp) {
        var h = document.createElement('div');
        h.className = 'ghd';
        h.textContent = f.grp;
        panel.appendChild(h);
        return;
      }
      var stack = f.same ? 'inherit'
        : (key === 'label' && f.id === 'sans') ? 'inherit'
        : stackFor(f, key === 'label' ? SYS_MONO : SYS_SANS);

      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.setAttribute('role', 'option');
      b.setAttribute('aria-selected', String(state[key] === f.id));
      b.innerHTML = '<span class="nm"></span><span class="sm"></span>';
      b.firstChild.textContent = f.label;
      b.firstChild.style.fontFamily = stack;
      b.lastChild.textContent = f.note || '';
      b.addEventListener('click', function () {
        state[key] = f.id;
        apply();
        closePanel();
      });
      panel.appendChild(b);
    });

    panel.hidden = false;
    var r = anchor.getBoundingClientRect();
    panel.style.left = Math.max(8, Math.min(r.left, innerWidth - 338)) + 'px';
    anchor.setAttribute('aria-expanded', 'true');
    var sel = panel.querySelector('[aria-selected="true"]');
    if (sel) sel.scrollIntoView({ block: 'center' });
  }

  function closePanel() {
    panel.hidden = true;
    panelKey = null;
    bar.querySelectorAll('.now').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }

  /* ---------- Batang ---------- */
  var bar = document.createElement('div');
  bar.id = 'fbar';
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'Pemilih huruf — hanya untuk review');

  var nowBtns = {};

  function control(key, withSteppers) {
    var g = document.createElement('div');
    g.className = 'grp';

    var c = document.createElement('span');
    c.className = 'cap';
    c.textContent = CAPTION[key];
    g.appendChild(c);

    var now = document.createElement('button');
    now.type = 'button';
    now.className = 'now';
    now.setAttribute('aria-haspopup', 'listbox');
    now.setAttribute('aria-expanded', 'false');
    now.addEventListener('click', function (e) { e.stopPropagation(); openPanel(key, now); });
    g.appendChild(now);
    nowBtns[key] = now;

    if (withSteppers) {
      [['‹', -1, 'Huruf sebelumnya'], ['›', 1, 'Huruf berikutnya']].forEach(function (spec) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'step';
        b.textContent = spec[0];
        b.title = spec[2];
        b.setAttribute('aria-label', spec[2]);
        b.addEventListener('click', function () {
          var list = items(key), i = 0;
          for (var n = 0; n < list.length; n++) if (list[n].id === state[key]) i = n;
          state[key] = list[(i + spec[1] + list.length) % list.length].id;
          apply();
        });
        g.appendChild(b);
      });
    }
    return g;
  }

  bar.appendChild(control('sans', true));
  var s1 = document.createElement('div'); s1.className = 'sep'; bar.appendChild(s1);
  bar.appendChild(control('display', false));
  var s2 = document.createElement('div'); s2.className = 'sep'; bar.appendChild(s2);
  bar.appendChild(control('label', false));

  var sp = document.createElement('div'); sp.className = 'sp'; bar.appendChild(sp);

  var copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'ghost';
  copy.textContent = 'Salin pilihan';
  copy.title = 'Salin nama huruf yang sedang dipakai, lalu kirim ke tim desain';
  copy.addEventListener('click', function () {
    var text = 'Huruf: ' + find('sans', state.sans).label +
               ' · Judul: ' + find('display', state.display).label +
               ' · Label: ' + find('label', state.label).label;
    var done = function () {
      copy.textContent = 'Tersalin ✓';
      setTimeout(function () { copy.textContent = 'Salin pilihan'; }, 1600);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { prompt('Salin:', text); });
    else prompt('Salin:', text);
  });
  bar.appendChild(copy);

  var reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'ghost';
  reset.textContent = 'Reset';
  reset.title = 'Kembali ke huruf mockup awal';
  reset.addEventListener('click', function () {
    state.sans = 'sistem'; state.display = 'sama'; state.label = 'mono';
    apply(); closePanel();
  });
  bar.appendChild(reset);

  var hide = document.createElement('button');
  hide.type = 'button';
  hide.className = 'ghost';
  hide.textContent = 'Sembunyikan ✕';
  hide.title = 'Sembunyikan batang ini (untuk screenshot)';
  bar.appendChild(hide);

  var btn = document.createElement('button');
  btn.id = 'fbtn';
  btn.type = 'button';
  btn.textContent = 'Aa';
  btn.title = 'Tampilkan pemilih huruf';

  function setOpen(open) {
    state.open = open;
    bar.hidden = !open;
    btn.hidden = open;
    if (!open) closePanel();
    document.documentElement.style.setProperty(
      '--fbar-h', open ? (innerWidth <= 760 ? 40 : BAR_H) + 'px' : '0px');
    save();
    (open ? hide : btn).focus();
  }
  hide.addEventListener('click', function () { setOpen(false); });
  btn.addEventListener('click', function () { setOpen(true); });

  addEventListener('click', function (e) {
    if (panelKey && !e.target.closest('#fpanel') && !e.target.closest('#fbar')) closePanel();
  });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panelKey) { var k = panelKey; closePanel(); nowBtns[k].focus(); }
  });

  function sync() {
    ['sans', 'display', 'label'].forEach(function (k) {
      var f = find(k, state[k]);
      nowBtns[k].textContent = f.label.replace(' (ikut huruf utama)', '').replace(' dengan huruf utama', '');
      nowBtns[k].title = f.note || '';
    });
  }

  function mount() {
    document.body.insertBefore(bar, document.body.firstChild);
    document.body.appendChild(panel);
    document.body.appendChild(btn);
    bar.hidden = !state.open;
    btn.hidden = state.open;
    if (!state.open) document.documentElement.style.setProperty('--fbar-h', '0px');
    apply();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
