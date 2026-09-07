import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminBar from '../../AdminBar';
import ProductForm from '../ProductForm';
import { simpanProduk, hapusProduk } from '../actions';
import { adminGetProduct, adminGetProductPhotos } from '@/lib/admin-queries';
import ProductPhotos from '../ProductPhotos';
import ConfirmSubmit from '@/components/ConfirmSubmit';

export const dynamic = 'force-dynamic';

export default async function UbahProduk({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ baru?: string }>;
}) {
  const { id } = await params;
  const { baru } = await searchParams;
  const product = await adminGetProduct(id);
  if (!product) notFound();
  const photos = await adminGetProductPhotos(id);

  return (
    <div className="adm">
      <AdminBar current="produk" />
      <div className="adm-main">
        <p className="adm-crumbs">
          <Link href="/admin/produk">Produk</Link> / {product.name}
        </p>
        <div className="adm-head">
          <div>
            <h1>{product.name}</h1>
            <p className="lede">
              Tampil di situs sebagai <code>/produk#{product.id}</code>
            </p>
          </div>
          <form action={hapusProduk}>
            <input type="hidden" name="id" value={product.id} />
            <ConfirmSubmit confirmLabel="Yakin? Klik lagi untuk menghapus">
              Hapus produk
            </ConfirmSubmit>
          </form>
        </div>

        {baru && <p className="adm-ok">Produk dibuat. Silakan lengkapi rinciannya.</p>}

        <div className="adm-photos-block">
          <ProductPhotos productId={product.id} photos={photos} />
        </div>

        <ProductForm product={product} action={simpanProduk} mode="ubah" />
      </div>
    </div>
  );
}
