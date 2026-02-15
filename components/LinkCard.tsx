'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatNumber, getBaseUrl } from '@/lib/utils';

interface LinkData {
  id: string;
  code: string;
  original: string;
  active: boolean;
  createdAt: string;
  _count: { clicks: number };
}

export default function LinkCard({
  link,
  onDelete,
  onToggle,
}: {
  link: LinkData;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const shortUrl = `${getBaseUrl()}/${link.code}`;

  async function handleDelete() {
    if (!confirm('Delete this link and all its analytics?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/urls/${link.id}`, { method: 'DELETE' });
      onDelete(link.id);
    } catch {
      setDeleting(false);
    }
  }

  async function handleToggle() {
    try {
      await fetch(`/api/urls/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !link.active }),
      });
      onToggle(link.id, !link.active);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        link.active
          ? 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
          : 'border-zinc-100 bg-zinc-50 opacity-60 dark:border-zinc-900 dark:bg-zinc-950'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              /{link.code}
            </a>
            <span className="text-xs text-zinc-400">
              {formatNumber(link._count.clicks)} clicks
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-zinc-500">{link.original}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {new Date(link.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/${link.id}`}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Analytics
          </Link>
          <button
            onClick={handleToggle}
            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
              link.active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
            }`}
          >
            {link.active ? 'Active' : 'Inactive'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
