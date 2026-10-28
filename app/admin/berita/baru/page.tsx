import AdminBar from '../../AdminBar';
import BeritaForm from '../BeritaForm';
import { buatBerita } from '../actions';
import { adminDaftarBerita, saranKategori } from '../data';

export const dynamic = 'force-dynamic';

export default async function BeritaBaru() {
  const daftar = await adminDaftarBerita();
  return (
    <div className="adm">
      <AdminBar current="berita" />
      <div className="adm-main">
        <h1>Berita baru.</h1>
        <BeritaForm berita={{}} action={buatBerita} mode="baru" kategoriAda={saranKategori(daftar)} />
      </div>
    </div>
  );
}
