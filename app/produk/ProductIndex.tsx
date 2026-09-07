'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ART, CATEGORIES, STOCK, VIEWS, type Product } from '@/lib/data/products';
import { WA_NUMBER } from '@/components/WhatsAppFab';

/* Tiga "foto" pada panel detail — produk, gambar teknis, kemasan.
   Masih grafik vektor; diganti foto asli dari Supabase di Bagian 6. */
function view(p: Product, kind: string): string {
  if (kind === 'teknis') {
    return (
      '<g opacity=".85">' + ART[p.art] + '</g>' +
      '<g stroke="#146B33" stroke-width=".8" fill="none">' +
      '<path d="M14 70 L106 70"/><path d="M14 66 L14 74"/><path d="M106 66 L106 74"/>' +
      '<path d="M110 20 L110 60"/><path d="M106 20 L114 20"/><path d="M106 60 L114 60"/></g>' +
      '<text x="60" y="78" text-anchor="middle" font-family="ui-monospace, monospace" font-size="5" fill="#146B33">' + p.size + '</text>' +
      '<text x="112" y="16" text-anchor="middle" font-family="ui-monospace, monospace" font-size="5" fill="#146B33">' + p.std.split(' ')[0] + '</text>'
    );
  }
  if (kind === 'kemasan') {
    return (
      '<path d="M22 30 L60 18 L98 30 L98 64 L60 76 L22 64 Z" fill="#E2E8E1"/>' +
      '<path d="M22 30 L60 42 L98 30" fill="none" stroke="#B8C3BC" stroke-width="1.5"/>' +
      '<path d="M60 42 L60 76" fill="none" stroke="#B8C3BC" stroke-width="1.5"/>' +
      '<rect x="32" y="46" width="22" height="14" rx="2" fill="#fff" stroke="#B8C3BC" stroke-width="1"/>' +
      '<g stroke="#8A968F" stroke-width="1.4"><path d="M35 50 L51 50"/><path d="M35 54 L47 54"/></g>' +
      '<g transform="translate(52 -6) scale(.42)" opacity=".9">' + ART[p.art] + '</g>'
    );
  }
  return ART[p.art];
}

function Art({ inner }: { inner: string }) {
  return <svg viewBox="0 0 120 80" aria-hidden="true" dangerouslySetInnerHTML={{ __html: inner }} />;
}

/* Foto asli kalau ada, kalau belum gambar vektor. Dipakai di thumbnail baris,
   panel besar, dan ketiga thumbnail — supaya perpindahan ke foto sungguhan
   terjadi serentak, bukan sebagian. */
function Gambar({ p, kind }: { p: Product; kind: 'produk' | 'teknis' | 'kemasan' }) {
  const foto = p.photos?.[kind];
  if (foto) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={foto.url} alt={foto.alt || p.name} className="pshot" />;
  }
  return <Art inner={view(p, kind)} />;
}

export default function ProductIndex({ products }: { products: Product[] }) {
  const PRODUCTS = products;
  const params = useSearchParams();
  const [term, setTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [viewKind, setViewKind] = useState<string>('produk');

  const dlgRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<Element | null>(null);

  /* ---------- Keadaan awal — dari ?q= / ?f= / #id yang dikirim halaman lain ---------- */
  useEffect(() => {
    const q = params.get('q');
    const f = params.get('f');
    if (q) setTerm(q);
    if (f && CATEGORIES.some((c) => c.f === f)) setFilter(f);

    const id = decodeURIComponent(location.hash.slice(1));
    if (id && PRODUCTS.some((p) => p.id === id)) setOpenId(id);
    // Sekali saja saat halaman dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    const t = term.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (filter !== 'all' && p.cat !== filter) return false;
      if (!t) return true;
      return [p.name, p.sub, p.std, p.size, p.grade, p.mat, p.desc].join(' ').toLowerCase().includes(t);
    });
  }, [term, filter, PRODUCTS]);

  const active = openId ? PRODUCTS.find((p) => p.id === openId) ?? null : null;

  /* ---------- Buka / tutup dialog ---------- */
  const open = useCallback((id: string) => {
    lastFocus.current = document.activeElement;
    setViewKind('produk');
    setOpenId(id);
  }, []);

  const close = useCallback(() => {
    const d = dlgRef.current;
    if (d?.open) d.close();
  }, []);

  useEffect(() => {
    const d = dlgRef.current;
    if (!d) return;
    if (active && !d.open) {
      history.replaceState(null, '', '#' + active.id);
      d.showModal();
      closeRef.current?.focus();
    }
  }, [active]);

  useEffect(() => {
    const d = dlgRef.current;
    if (!d) return;
    const onClose = () => {
      history.replaceState(null, '', location.pathname + location.search);
      setOpenId(null);
      (lastFocus.current as HTMLElement | null)?.focus?.();
    };
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, []);

  const countLabel = `${list.length} produk${term || filter !== 'all' ? ' ditampilkan' : ''}`;

  return (
    <>
      <section className="phead">
        <div className="wrap">
          <p className="crumbs">
            <Link href="/">Beranda</Link> / Katalog
          </p>
          <div className="row">
            <div>
              <h1>Indeks produk.</h1>
              <p className="lede">
                Sembilan lini produk, semuanya stok gudang sendiri. Klik satu baris untuk melihat
                rincian standar, material, finishing, dan penggunaannya.
              </p>
            </div>
            <div className="pactions">
              <a className="btn btn--ghost" href="#" onClick={(e) => e.preventDefault()}>
                Unduh katalog (PDF)
              </a>
              <a className="btn" href="/#kontak">
                Minta Penawaran
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="toolbar">
        <div className="wrap toolbar-in">
          <div className="tsearch">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              id="q"
              ref={searchRef}
              aria-label="Cari di indeks produk"
              placeholder="Cari nama, standar, ukuran, atau material…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <button
              type="button"
              id="qclear"
              aria-label="Bersihkan pencarian"
              hidden={!term}
              onClick={() => {
                setTerm('');
                searchRef.current?.focus();
              }}
            >
              ×
            </button>
          </div>
          <div className="chips" role="group" aria-label="Filter kategori">
            {CATEGORIES.map((c) => (
              <button
                key={c.f}
                className="chip"
                aria-pressed={filter === c.f}
                onClick={() => setFilter(c.f)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <p className="count" id="count" role="status">
            {countLabel}
          </p>
        </div>
      </div>

      <section className="sec" style={{ paddingTop: 'clamp(28px,3.5vw,44px)' }}>
        <div className="wrap">
          <div className="idxwrap">
            <table className="idx">
              <thead>
                <tr>
                  <th scope="col">Produk</th>
                  <th scope="col">Standar</th>
                  <th scope="col">Ukuran</th>
                  <th scope="col">Grade</th>
                  <th scope="col">Material</th>
                  <th scope="col">Stok</th>
                  <th scope="col">
                    <span className="sr">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody id="rows">
                {list.map((p) => {
                  const s = STOCK[p.stock];
                  return (
                    <tr
                      key={p.id}
                      data-id={p.id}
                      onClick={(e) => {
                        e.preventDefault();
                        open(p.id);
                      }}
                    >
                      <td>
                        <span className="pcell">
                          <span className="mini">
                            <Gambar p={p} kind="produk" />
                          </span>
                          <span>
                            <span className="pname">{p.name}</span>
                            <span className="pdesc">{p.sub}</span>
                          </span>
                        </span>
                      </td>
                      <td className="m" data-l="Standar">{p.std}</td>
                      <td className="m" data-l="Ukuran">{p.size}</td>
                      <td className="m" data-l="Grade">{p.grade}</td>
                      <td className="m" data-l="Material">{p.mat}</td>
                      <td data-l="Stok">
                        <span className={`stock ${s.cls}`.trim()}>
                          <i aria-hidden="true" />
                          {s.label}
                        </span>
                      </td>
                      <td data-l="">
                        <a className="rowlink" href={`#${p.id}`}>
                          Detail →
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="empty" id="empty" hidden={list.length > 0}>
            <b>Tidak ada yang cocok.</b>
            <p>
              Coba kata kunci lain, atau kirim spesifikasinya — kami sering punya barang yang belum
              masuk daftar.
            </p>
            <a className="btn" href="/#kontak" style={{ marginTop: 10 }}>
              Kirim Spesifikasi
            </a>
          </div>

          <div className="helpbar">
            <p>
              <strong>Tidak menemukan ukurannya?</strong>Kirim gambar kerja atau foto barang lama —
              tim kami bantu identifikasi standar dan grade-nya.
            </p>
            <a className="btn" href="/#kontak">
              Minta Penawaran
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Panel detail produk ---------- */}
      <dialog
        className="detail"
        id="detail"
        ref={dlgRef}
        aria-labelledby="dtitle"
        onClick={(e) => {
          if (e.target === dlgRef.current) close();
        }}
      >
        {active && (
          <div className="dwrap">
            <div className="dmedia">
              <div className="dshot" id="dshot">
                <Gambar p={active} kind={viewKind as 'produk' | 'teknis' | 'kemasan'} />
              </div>
              <div className="dthumbs" id="dthumbs">
                {VIEWS.map((v) => (
                  <button
                    key={v.k}
                    className="dthumb"
                    type="button"
                    aria-label={v.c}
                    aria-pressed={viewKind === v.k}
                    onClick={() => setViewKind(v.k)}
                  >
                    <Gambar p={active} kind={v.k} />
                  </button>
                ))}
              </div>
              <p className="dcaption" id="dcaption">
                {VIEWS.find((v) => v.k === viewKind)?.c}
              </p>
            </div>
            <div className="dbody">
              <div className="dtop">
                <div>
                  <div className="dstd" id="dstd">
                    {active.std} · {active.mat}
                  </div>
                  <h2 id="dtitle">{active.name}</h2>
                </div>
                <button className="dclose" id="dclose" ref={closeRef} type="button" aria-label="Tutup" onClick={close}>
                  ×
                </button>
              </div>
              <p id="ddesc">{active.desc}</p>
              <dl className="dspec" id="dspec">
                {Object.entries(active.spec).map(([k, v]) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="tags" id="dtags">
                {active.finish.map((f) => (
                  <span className="tag" key={f}>
                    {f}
                  </span>
                ))}
              </div>
              <h3 style={{ marginTop: 26 }}>Dipakai untuk</h3>
              <ul className="dapps" id="dapps">
                {active.apps.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <div className="dcta">
                <a className="btn" id="dquote" href={`/?produk=${active.id}#kontak`}>
                  Minta Penawaran
                </a>
                <a
                  className="btn btn--ghost"
                  id="dwa"
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                    `Halo Kairos Baut, saya mau tanya soal ${active.name} (${active.std}).`
                  )}`}
                >
                  Tanya via WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
