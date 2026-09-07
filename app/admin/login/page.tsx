import { Suspense } from 'react';
import type { Metadata } from 'next';
import Logo from '@/components/Logo';
import LoginForm from './LoginForm';
import '../admin.css';

export const metadata: Metadata = {
  title: 'Masuk — Backoffice Kairos Baut',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="adm-login">
      <div className="adm-card">
        <Logo />
        <h1>Backoffice</h1>
        <p className="sub">Masukkan kata sandi untuk menyunting isi situs.</p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
