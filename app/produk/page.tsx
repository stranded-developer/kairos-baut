import { Suspense } from 'react';
import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import ProductIndex from './ProductIndex';
import { getProducts } from '@/lib/queries';
import './produk.css';

export const metadata: Metadata = {
  title: 'Indeks Produk — Kairos Baut',
  description:
    'Indeks lengkap baut, mur, ring, as drat, dan angkur Kairos Baut — standar, ukuran, grade, material, dan status stok.',
};

/* Dibangun statis, lalu disegarkan berkala. Backoffice memanggil
   revalidatePath('/produk') setelah menyimpan, jadi perubahan tampil segera
   tanpa menunggu jendela ini habis. */
export const revalidate = 300;

export default async function ProdukPage() {
  const products = await getProducts();

  return (
    <Shell current="produk">
      <Suspense fallback={null}>
        <ProductIndex products={products} />
      </Suspense>
    </Shell>
  );
}
