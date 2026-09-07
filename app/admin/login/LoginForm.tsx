'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { login, type LoginState } from './actions';

export default function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') ?? '';
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action}>
      {state.error && (
        <p className="adm-error" role="alert">
          {state.error}
        </p>
      )}
      <input type="hidden" name="next" value={next} />
      <label className="adm-field">
        <span>Kata sandi</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          required
        />
      </label>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? 'Memeriksa…' : 'Masuk'}
      </button>
    </form>
  );
}
