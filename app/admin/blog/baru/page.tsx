import Link from 'next/link';
import AdminBar from '../../AdminBar';
import PostForm from '../PostForm';
import { buatPost } from '../actions';

export default function PostBaru() {
  return (
    <div className="adm">
      <AdminBar current="blog" />
      <div className="adm-main">
        <p className="adm-crumbs">
          <Link href="/admin/blog">Blog</Link> / Baru
        </p>
        <h1>Tulisan baru.</h1>
        <p className="lede">Slug dibuat otomatis dari judul.</p>

        <PostForm post={{ published: true, featured: false }} action={buatPost} mode="baru" />
      </div>
    </div>
  );
}
