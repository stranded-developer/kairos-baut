import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { storageUrl } from '@/lib/supabase/public';
import { SARING } from '@/lib/data/news';

/* Pembacaan berita untuk backoffice — termasuk yang disembunyikan. */

export type BeritaAdmin = {
  slug: string; judul: string; kategori: string; tanggal: string; lokasi: string;
  ringkas: string; body: string; alt: string; unggulan: boolean; published: boolean;
  contoh: boolean; storage_path: string | null; foto: string | null;
};

const KOLOM = 'slug,judul,kategori,tanggal,lokasi,ringkas,body,alt,unggulan,published,contoh,storage_path';

function petakan(r: Omit<BeritaAdmin, 'foto'>): BeritaAdmin {
  const p = r.storage_path;
  return { ...r, foto: p ? (p.startsWith('/') ? p : storageUrl('site-photos', p)) : null };
}

/** null = tabelnya belum ada (migrasi 0009 belum dijalankan). */
export async function adminDaftarBerita(): Promise<BeritaAdmin[] | null> {
  const db = createAdminClient();
  const { data, error } = await db.from('news').select(KOLOM).order('tanggal', { ascending: false });
  if (error) return null;
  return (data as Omit<BeritaAdmin, 'foto'>[]).map(petakan);
}

export async function adminSatuBerita(slug: string): Promise<BeritaAdmin | null> {
  const db = createAdminClient();
  const { data } = await db.from('news').select(KOLOM).eq('slug', slug).maybeSingle();
  return data ? petakan(data as Omit<BeritaAdmin, 'foto'>) : null;
}

/** Saran kategori: daftar baku + yang sudah dipakai. */
export function saranKategori(daftar: BeritaAdmin[] | null): string[] {
  return [...new Set([...SARING.slice(1), ...(daftar ?? []).map((b) => b.kategori)])];
}
