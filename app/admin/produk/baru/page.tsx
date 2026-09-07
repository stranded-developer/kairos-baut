import Link from 'next/link';
import AdminBar from '../../AdminBar';
import ProductForm from '../ProductForm';
import { buatProduk } from '../actions';

export default function ProdukBaru() {
  return (
    <div className="adm">
      <AdminBar current="produk" />
      <div className="adm-main">
        <p className="adm-crumbs">
          <Link href="/admin/produk">Produk</Link> / Baru
        </p>
        <h1>Produk baru.</h1>
        <p className="lede">Isi minimal nama, ID, kategori, dan stok. Sisanya bisa dilengkapi nanti.</p>

        <ProductForm product={{ published: true, sort_order: 0 }} action={buatProduk} mode="baru" />
      </div>
    </div>
  );
}
