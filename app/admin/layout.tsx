import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Backoffice — Kairos Baut',
  /* Backoffice tidak boleh masuk indeks mesin pencari. */
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
