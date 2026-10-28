import AdminBar from './AdminBar';

/* Ubin yang belum ada halamannya ditandai aria-disabled sampai bagiannya
   dikerjakan — supaya tidak ada tautan yang mati. */
const TILES = [
  { k: '01', href: '/admin/produk', h: 'Produk', p: 'Nama, standar, ukuran, grade, material, stok, deskripsi, dan tabel spesifikasi.', ready: true, part: 'Bagian 5' },
  { k: '02', href: '/admin/foto', h: 'Foto situs', p: 'Foto hero, gudang, empat panel industri, dan foto Tentang Kami.', ready: true, part: 'Bagian 6' },
  { k: '03', href: '/admin/berita', h: 'Berita', p: 'Berita & artikel lengkap, teks halaman Berita, dan kontak media.', ready: true, part: 'Bagian 10' },
  { k: '04', href: '/admin/blog', h: 'Blog', p: 'Catatan teknis — judul, topik, ringkasan, dan isi tulisan.', ready: true, part: 'Bagian 7' },
  { k: '05', href: '/admin/beranda', h: 'Beranda & font', p: 'Semua teks beranda — hero, pil, keunggulan, angka, industri, kartu kategori — dan pasangan font situs.', ready: true, part: 'Bagian 10' },
  { k: '06', href: '/admin/pelanggan', h: 'Pelanggan', p: 'Pita "Kami telah bekerja sama dengan" di beranda — tambah, urutkan, logo.', ready: true, part: 'Bagian 10' },
  { k: '07', href: '/admin/pengaturan', h: 'Kontak, logo & kaki halaman', p: 'Nomor WhatsApp, telepon, email, alamat, jam kerja, logo navbar, dan teks kaki halaman.', ready: true, part: 'Bagian 10' },
];

export default function AdminHome() {
  return (
    <div className="adm">
      <AdminBar current="beranda" />
      <div className="adm-main">
        <h1>Ringkasan.</h1>
        <p className="lede">Pilih bagian yang ingin disunting.</p>

        <div className="adm-grid">
          {TILES.map((t) => (
            <a
              className="adm-tile"
              key={t.k}
              href={t.ready ? t.href : undefined}
              {...(t.ready ? {} : { 'aria-disabled': 'true' as const })}
            >
              <div className="k">
                {t.k} — {t.ready ? 'Siap' : t.part}
              </div>
              <h2>{t.h}</h2>
              <p>{t.p}</p>
            </a>
          ))}
        </div>

        <div className="adm-note">
          <strong>Perubahan langsung tampil di situs.</strong>
          Setelah menyimpan, halaman publik disegarkan otomatis — tidak perlu
          menunggu. Kata sandi diatur lewat variabel <code>ADMIN_PASSWORD</code>.
        </div>
      </div>
    </div>
  );
}
