import ShortenForm from '@/components/ShortenForm';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Shorten Your URLs
        </h1>
        <p className="mt-4 max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          Create short links, generate QR codes, and track every click with
          detailed analytics.
        </p>

        <div className="mt-8 w-full max-w-xl">
          <ShortenForm />
        </div>

        <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="text-2xl">🔗</div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">
              Custom Aliases
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Choose your own short code or let us generate one.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="text-2xl">📊</div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">
              Click Analytics
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Track clicks, devices, locations, and referrers.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="text-2xl">📱</div>
            <h3 className="mt-3 font-semibold text-zinc-900 dark:text-white">
              QR Codes
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Auto-generated QR code for every shortened link.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="mt-8 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
        >
          View Dashboard →
        </Link>
      </div>
    </div>
  );
}
