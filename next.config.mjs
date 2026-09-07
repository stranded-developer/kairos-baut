import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Ada package-lock.json lain di ~/ — tanpa ini Next menebak root workspace
     ke direktori home dan memperingatkan tiap build. */
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),

  experimental: {
    /* Bawaan Server Action cuma 1 MB — foto produk/hero pasti lebih besar.
       Disamakan dengan batas bucket Supabase (10 MB) supaya penolakan terjadi
       di satu tempat saja, bukan dua batas berbeda yang membingungkan. */
    serverActions: { bodySizeLimit: '10mb' },
  },

  images: { formats: ['image/avif', 'image/webp'] },
};

export default nextConfig;
