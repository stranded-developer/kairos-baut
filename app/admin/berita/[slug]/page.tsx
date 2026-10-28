import { notFound } from 'next/navigation';
import AdminBar from '../../AdminBar';
import BeritaForm from '../BeritaForm';
import { simpanBerita, hapusBerita } from '../actions';
import { adminDaftarBerita, adminSatuBerita, saranKategori } from '../data';
import ConfirmSubmit from '@/components/ConfirmSubmit';

export const dynamic = 'force-dynamic';

export default async function UbahBerita({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ baru?: string }>;
}) {
  const { slug } = await params;
  const { baru } = await searchParams;
  const [b, daftar] = await Promise.all([adminSatuBerita(slug), adminDaftarBerita()]);
  if (!b) notFound();

  return (
    <div className="adm">
      <AdminBar current="berita" />
      <div className="adm-main">
        <h1>Sunting berita.</h1>
        {baru && <p className="adm-ok" role="status">Berita dibuat.</p>}
        <BeritaForm berita={b} action={simpanBerita} mode="ubah" kategoriAda={saranKategori(daftar)} />

        <form action={hapusBerita} className="adm-danger">
          <input type="hidden" name="slug" value={b.slug} />
          <ConfirmSubmit className="btn btn--danger" confirmLabel="Yakin? Klik lagi untuk hapus">
            Hapus berita
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
