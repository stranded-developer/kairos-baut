import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdminBar from '../../AdminBar';
import PostForm from '../PostForm';
import { simpanPost, hapusPost } from '../actions';
import { adminGetPost } from '@/lib/admin-queries';
import ConfirmSubmit from '@/components/ConfirmSubmit';

export const dynamic = 'force-dynamic';

export default async function UbahPost({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ baru?: string }>;
}) {
  const { slug } = await params;
  const { baru } = await searchParams;
  const post = await adminGetPost(slug);
  if (!post) notFound();

  return (
    <div className="adm">
      <AdminBar current="blog" />
      <div className="adm-main">
        <p className="adm-crumbs">
          <Link href="/admin/blog">Blog</Link> / {post.title}
        </p>
        <div className="adm-head">
          <div>
            <h1>{post.title}</h1>
            <p className="lede"><code>/blog</code> · {post.topic}</p>
          </div>
          <form action={hapusPost}>
            <input type="hidden" name="slug" value={post.slug} />
            <ConfirmSubmit confirmLabel="Yakin? Klik lagi untuk menghapus">
              Hapus tulisan
            </ConfirmSubmit>
          </form>
        </div>

        {baru && <p className="adm-ok">Tulisan dibuat. Silakan lengkapi isinya.</p>}

        <PostForm post={post} action={simpanPost} mode="ubah" />
      </div>
    </div>
  );
}
