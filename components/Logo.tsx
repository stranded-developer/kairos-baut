import Link from 'next/link';

export default function Logo({ ariaLabel }: { ariaLabel?: string }) {
  return (
    <Link className="logo" href="/" aria-label={ariaLabel}>
      <svg width="30" height="26" viewBox="0 0 30 26" fill="none" aria-hidden="true">
        <path d="M2 24 L9 6 L14 16 L18 9 L28 24 Z" fill="#1E9E4A" />
        <path d="M13.5 1 L20 3.2 L13.5 5.4 Z" fill="currentColor" />
        <rect x="13" y="1" width="1.2" height="6" fill="currentColor" />
      </svg>
      <b>
        Kairos<i>Baut</i>
      </b>
    </Link>
  );
}
