/* Dipisah dari lib/data/home.ts supaya komponen klien (Stats) tidak ikut
   membawa seluruh naskah beranda ke bundel browser. */

/**
 * "15+" → { ke: 15, plus: true }; "2.400" → { ke: 2400 }; "ISO" → null
 * (tampil apa adanya, tanpa animasi hitung).
 */
export function bacaAngka(nilai: string): { ke: number; plus: boolean } | null {
  const m = nilai.trim().match(/^([\d.]+)(\+?)$/);
  if (!m) return null;
  const ke = Number(m[1].replace(/\./g, ''));
  return Number.isFinite(ke) ? { ke, plus: m[2] === '+' } : null;
}
