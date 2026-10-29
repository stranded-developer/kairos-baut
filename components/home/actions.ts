'use server';

import { getSettings } from '@/lib/queries';
import { daftarEmail } from '@/lib/data/settings';

/* ============================================================================
   Kiriman formulir penawaran beranda → email lewat Resend.

   Penerima: pengaturan `email_penawaran` (/admin/pengaturan, boleh beberapa
   alamat dipisah koma). Kosong atau belum ada (0010 belum dijalankan) →
   jatuh ke `email` kontak umum, supaya kiriman tidak pernah hilang.

   Pengirim: alamat di domain kairosbaut.com yang sudah Verified di Resend.
   Tidak perlu kotak surat sungguhan — balasan diarahkan ke pengunjung lewat
   reply_to, jadi tim cukup tekan "Balas".

   Resend dipanggil lewat REST biasa (fetch), tanpa paket SDK — hanya satu
   permintaan, tidak sepadan menambah dependensi.
   ========================================================================= */

export type KirimState = { ok?: boolean; error?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PENGIRIM = process.env.RESEND_FROM || 'Website Kairos Baut <noreply@kairosbaut.com>';

/* Batas panjang tiap kolom — formulir sungguhan jauh di bawah ini; yang
   melewatinya hampir pasti bot. */
const BATAS: Record<string, number> = {
  nama: 120, perusahaan: 160, email: 200, wa: 40, kategori: 80, spesifikasi: 4000,
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function kirimPenawaran(fd: FormData): Promise<KirimState> {
  /* Kolom jebakan: tersembunyi dari manusia, biasanya diisi bot. Bot diberi
     jawaban "berhasil" supaya tidak mencoba lagi. */
  if (String(fd.get('situs') ?? '')) return { ok: true };

  const v: Record<string, string> = {};
  for (const [k, maks] of Object.entries(BATAS)) {
    v[k] = String(fd.get(k) ?? '').trim();
    if (v[k].length > maks) return { error: true };
  }
  if (!v.nama || !v.wa || !v.spesifikasi || !EMAIL_RE.test(v.email)) return { error: true };

  const kunci = process.env.RESEND_API_KEY;
  if (!kunci) {
    console.error('[penawaran] RESEND_API_KEY belum dipasang — kiriman tidak terkirim.');
    return { error: true };
  }

  const setelan = await getSettings();
  let ke = daftarEmail(setelan.email_penawaran);
  if (ke.length === 0) ke = daftarEmail(setelan.email);
  if (ke.length === 0) {
    console.error('[penawaran] Tidak ada alamat penerima yang valid di pengaturan.');
    return { error: true };
  }

  const dari = v.perusahaan ? `${v.nama} (${v.perusahaan})` : v.nama;
  const baris: [string, string][] = [
    ['Nama', v.nama],
    ['Perusahaan', v.perusahaan || '—'],
    ['Email', v.email],
    ['WhatsApp', v.wa],
    ['Kategori', v.kategori || '—'],
    ['Spesifikasi & jumlah', v.spesifikasi],
  ];

  const text =
    `Permintaan penawaran baru dari formulir kairosbaut.com\n\n` +
    baris.map(([k, isi]) => `${k}:\n${isi}`).join('\n\n') +
    `\n\n—\nTekan "Balas" untuk membalas langsung ke ${v.email}.`;

  const html =
    `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.5">` +
    `<p style="margin:0 0 16px">Permintaan penawaran baru dari formulir <b>kairosbaut.com</b>.</p>` +
    `<table cellpadding="8" style="border-collapse:collapse;max-width:600px">` +
    baris
      .map(
        ([k, isi]) =>
          `<tr><td style="vertical-align:top;color:#666;white-space:nowrap;border-bottom:1px solid #eee">${esc(k)}</td>` +
          `<td style="border-bottom:1px solid #eee;white-space:pre-wrap">${esc(isi)}</td></tr>`
      )
      .join('') +
    `</table>` +
    `<p style="margin:16px 0 0;color:#666">Tekan "Balas" untuk membalas langsung ke ${esc(v.email)}.</p>` +
    `</div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${kunci}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: PENGIRIM,
        to: ke,
        reply_to: v.email,
        subject: `Permintaan penawaran — ${v.kategori || 'Umum'} — ${dari}`.slice(0, 200),
        text,
        html,
      }),
    });
    if (!res.ok) {
      console.error('[penawaran] Resend menolak:', res.status, await res.text());
      return { error: true };
    }
  } catch (e) {
    console.error('[penawaran] Gagal menghubungi Resend:', e);
    return { error: true };
  }

  return { ok: true };
}
