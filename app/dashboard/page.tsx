'use client';

import { useState, useEffect } from 'react';
import LinkCard from '@/components/LinkCard';
import Link from 'next/link';

interface UrlData {
  id: string;
  code: string;
  original: string;
  active: boolean;
  createdAt: string;
  _count: { clicks: number };
}

export default function DashboardPage() {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/urls')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUrls(data);
        else setError('Failed to load links');
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: string) {
    setUrls((prev) => prev.filter((u) => u.id !== id));
  }

  function handleToggle(id: string, active: boolean) {
    setUrls((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active } : u))
    );
  }

  const totalClicks = urls.reduce((s, u) => s + u._count.clicks, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {urls.length} links · {totalClicks} total clicks
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          + New Link
        </Link>
      </div>

      {loading && (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && urls.length === 0 && !error && (
        <div className="mt-8 rounded-xl border border-zinc-200 p-8 text-center dark:border-zinc-800">
          <p className="text-zinc-500">No links yet.</p>
          <Link
            href="/"
            className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Create your first short link
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {urls.map((url) => (
          <LinkCard
            key={url.id}
            link={url}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
