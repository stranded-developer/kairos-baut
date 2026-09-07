'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/admin-guard';
import { bacaFormPost } from '@/lib/post-form';

export type PostState = { error?: string; ok?: string };

function segarkan() {
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
}

/* Hanya boleh ada satu tulisan unggulan — basis data memaksakannya lewat
   indeks unik parsial. Daripada membiarkan penyimpanan gagal dengan pesan
   Postgres yang tidak ramah, unggulan lama diturunkan lebih dulu. */
async function turunkanUnggulanLain(slugBaru: string) {
  const db = createAdminClient();
  await db.from('posts').update({ featured: false }).eq('featured', true).neq('slug', slugBaru);
}

export async function simpanPost(_prev: PostState, fd: FormData): Promise<PostState> {
  await requireAdmin();

  const parsed = bacaFormPost(fd);
  if ('error' in parsed) return { error: parsed.error };

  if (parsed.row.featured) await turunkanUnggulanLain(parsed.row.slug);

  const db = createAdminClient();
  const { error } = await db.from('posts').upsert(parsed.row, { onConflict: 'slug' });
  if (error) return { error: `Gagal menyimpan: ${error.message}` };

  segarkan();
  return { ok: 'Tersimpan.' };
}

export async function buatPost(_prev: PostState, fd: FormData): Promise<PostState> {
  await requireAdmin();

  const parsed = bacaFormPost(fd);
  if ('error' in parsed) return { error: parsed.error };

  const db = createAdminClient();
  const { data: ada } = await db.from('posts').select('slug').eq('slug', parsed.row.slug).maybeSingle();
  if (ada) return { error: `Slug "${parsed.row.slug}" sudah dipakai tulisan lain.` };

  if (parsed.row.featured) await turunkanUnggulanLain(parsed.row.slug);

  const { error } = await db.from('posts').insert(parsed.row);
  if (error) return { error: `Gagal membuat: ${error.message}` };

  segarkan();
  redirect(`/admin/blog/${parsed.row.slug}?baru=1`);
}

export async function hapusPost(fd: FormData): Promise<void> {
  await requireAdmin();

  const slug = String(fd.get('slug') ?? '');
  if (!slug) return;

  const db = createAdminClient();
  await db.from('posts').delete().eq('slug', slug);

  segarkan();
  redirect('/admin/blog');
}
