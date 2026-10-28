/* ============================================================================
   Isi tulisan panjang (artikel berita) → HTML, tanpa HTML dari admin.

   Format yang dikenali, sengaja sedikit supaya bisa dijelaskan dalam satu
   kalimat di backoffice:
     · paragraf dipisah satu baris kosong;
     · baris berawalan "## " → subjudul;
     · baris-baris berawalan "- " → daftar butir.
   Semuanya dirender sebagai teks React biasa, jadi tidak ada jalur untuk
   menyuntikkan HTML.
   ========================================================================= */
export default function Naskah({ teks }: { teks: string }) {
  const blok = teks.replace(/\r\n/g, '\n').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return blok.map((b, i) => {
    const baris = b.split('\n').map((s) => s.trim());
    if (baris.length === 1 && baris[0].startsWith('## ')) {
      return <h2 key={i}>{baris[0].slice(3)}</h2>;
    }
    if (baris.every((s) => s.startsWith('- '))) {
      return (
        <ul key={i}>
          {baris.map((s, j) => <li key={j}>{s.slice(2)}</li>)}
        </ul>
      );
    }
    return <p key={i}>{baris.join(' ')}</p>;
  });
}
