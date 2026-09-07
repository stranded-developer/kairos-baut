import 'server-only';
import { createAdminClient } from './supabase/admin';
import type { Product } from './data/products';

/* Pembacaan untuk backoffice — memakai kunci rahasia supaya baris yang belum
   dipublikasikan ikut terlihat. Halaman publik TIDAK memakai ini. */

export type AdminProduct = Product & { sort_order: number; published: boolean };

const KOLOM = 'id,cat,art,name,sub,std,size,grade,mat,stock,description,spec,finish,apps,sort_order,published';

interface Row {
  id: string; cat: string; art: string; name: string; sub: string; std: string;
  size: string; grade: string; mat: string; stock: string; description: string;
  spec: Record<string, string>; finish: string[]; apps: string[];
  sort_order: number; published: boolean;
}

function map(r: Row): AdminProduct {
  return {
    id: r.id, cat: r.cat as AdminProduct['cat'], art: r.art, name: r.name, sub: r.sub,
    std: r.std, size: r.size, grade: r.grade, mat: r.mat,
    stock: r.stock as AdminProduct['stock'], desc: r.description,
    spec: r.spec, finish: r.finish, apps: r.apps,
    sort_order: r.sort_order, published: r.published,
  };
}

export async function adminGetProducts(): Promise<AdminProduct[]> {
  const db = createAdminClient();
  const { data, error } = await db.from('products').select(KOLOM).order('sort_order');
  if (error) throw new Error(error.message);
  return (data as Row[]).map(map);
}

export async function adminGetProduct(id: string): Promise<AdminProduct | null> {
  const db = createAdminClient();
  const { data, error } = await db.from('products').select(KOLOM).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? map(data as Row) : null;
}

export interface FotoProdukRow {
  id: string;
  kind: 'produk' | 'teknis' | 'kemasan';
  url: string;
  alt: string;
}

export async function adminGetProductPhotos(productId: string): Promise<FotoProdukRow[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from('product_photos')
    .select('id,kind,storage_path,alt')
    .eq('product_id', productId);
  if (error) throw new Error(error.message);

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return (data ?? []).map((r) => ({
    id: r.id,
    kind: r.kind,
    url: `${base}/storage/v1/object/public/product-photos/${r.storage_path}`,
    alt: r.alt ?? '',
  }));
}

/* ---- tulisan blog ---- */
export interface AdminPost {
  slug: string; title: string; topic: string; excerpt: string; body: string;
  art: string; reading_time: string | null; featured: boolean;
  published: boolean; published_at: string;
}

const KOLOM_POST = 'slug,title,topic,excerpt,body,art,reading_time,featured,published,published_at';

export async function adminGetPosts(): Promise<AdminPost[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from('posts').select(KOLOM_POST).order('published_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminPost[];
}

export async function adminGetPost(slug: string): Promise<AdminPost | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from('posts').select(KOLOM_POST).eq('slug', slug).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as AdminPost) ?? null;
}
