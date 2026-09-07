import Link from 'next/link';
import AdminBar from '../AdminBar';
import { adminGetPosts } from '@/lib/admin-queries';
import { formatTanggal } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function AdminBlogList() {
  const posts = await adminGetPosts();

  return (
    <div className="adm">
      <AdminBar current="blog" />
      <div className="adm-main">
        <div className="adm-head">
          <div>
            <h1>Blog.</h1>
            <p className="lede">{posts.length} tulisan. Klik untuk menyunting.</p>
          </div>
          <Link className="btn" href="/admin/blog/baru">+ Tulisan baru</Link>
        </div>

        <div className="adm-list">
          {posts.map((p) => (
            <Link className="adm-item" href={`/admin/blog/${p.slug}`} key={p.slug}>
              <span className="adm-item-art">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"
                     aria-hidden="true" dangerouslySetInnerHTML={{ __html: p.art }} />
              </span>
              <span className="adm-item-main">
                <b>{p.title}</b>
                <small>{p.excerpt.slice(0, 78)}{p.excerpt.length > 78 ? '…' : ''}</small>
              </span>
              <span className="adm-item-meta">{formatTanggal(p.published_at)}</span>
              <span className="adm-pill">{p.topic}</span>
              {p.featured && <span className="adm-pill adm-pill--star">★ Unggulan</span>}
              {!p.published && <span className="adm-pill adm-pill--draft">Disembunyikan</span>}
              <span className="adm-item-go" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
