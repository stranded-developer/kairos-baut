import type { Metadata } from 'next';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { TOPICS } from '@/lib/data/posts';
import { getPosts } from '@/lib/queries';
import './blog.css';

export const metadata: Metadata = {
  title: 'Catatan Teknis — Kairos Baut',
  description:
    'Standar, material, dan finishing baut — catatan teknis dari tim Kairos Baut.',
};

function Art({ inner }: { inner: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" dangerouslySetInnerHTML={{ __html: inner }} />
  );
}

export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getPosts();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <Shell current="blog">
      <section className="phead">
        <div className="wrap">
          <p className="crumbs">
            <Link href="/">Beranda</Link> / Blog
          </p>
          <h1>Catatan teknis.</h1>
          <p className="lede">
            Standar, material, dan finishing — ditulis oleh tim yang tiap hari menjawab pertanyaan
            yang sama di telepon. Dipindahkan ke halaman ini supaya beranda tetap fokus pada produk.
          </p>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="topics">
            {TOPICS.map((t, i) => (
              <a className="topic" href="#" key={t} {...(i === 0 ? { 'aria-current': 'true' as const } : {})}>
                {t}
              </a>
            ))}
          </div>

          {featured && (
            <a className="feature rv" href="#">
              <div className="art">
                <Art inner={featured.art} />
              </div>
              <div className="txt">
                <div className="meta">
                  <span>{featured.date}</span>
                  <s>{featured.topic}</s>
                  {featured.readingTime && <span>{featured.readingTime}</span>}
                </div>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <div className="go" style={{ marginTop: 16 }}>
                  <span className="textlink">
                    Baca selengkapnya <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </a>
          )}

          <div className="posts rv">
            {rest.map((p) => (
              <a className="post" href="#" key={p.slug}>
                <div className="art">
                  <Art inner={p.art} />
                </div>
                <div className="txt">
                  <div className="meta">
                    <span>{p.date}</span>
                    <s>{p.topic}</s>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <div className="go">Baca →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
