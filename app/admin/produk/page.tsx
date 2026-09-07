import Link from 'next/link';
import AdminBar from '../AdminBar';
import { adminGetProducts } from '@/lib/admin-queries';
import { STOCK, ART } from '@/lib/data/products';

export const dynamic = 'force-dynamic';

export default async function AdminProdukList() {
  const products = await adminGetProducts();

  return (
    <div className="adm">
      <AdminBar current="produk" />
      <div className="adm-main">
        <div className="adm-head">
          <div>
            <h1>Produk.</h1>
            <p className="lede">{products.length} produk. Klik untuk menyunting.</p>
          </div>
          <Link className="btn" href="/admin/produk/baru">+ Produk baru</Link>
        </div>

        <div className="adm-list">
          {products.map((p) => (
            <Link className="adm-item" href={`/admin/produk/${p.id}`} key={p.id}>
              <span className="adm-item-art">
                <svg viewBox="0 0 120 80" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ART[p.art] ?? '' }} />
              </span>
              <span className="adm-item-main">
                <b>{p.name}</b>
                <small>{p.sub}</small>
              </span>
              <span className="adm-item-meta">{p.std}</span>
              <span className="adm-item-meta">{p.size}</span>
              <span className={`adm-pill adm-pill--${p.stock}`}>{STOCK[p.stock].label}</span>
              {!p.published && <span className="adm-pill adm-pill--draft">Disembunyikan</span>}
              <span className="adm-item-go" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
