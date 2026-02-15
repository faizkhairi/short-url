'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ClicksChart from '@/components/ClicksChart';
import DeviceChart from '@/components/DeviceChart';
import ReferrerTable from '@/components/ReferrerTable';
import GeoChart from '@/components/GeoChart';
import QRCodeDisplay from '@/components/QRCode';
import { formatNumber, getBaseUrl } from '@/lib/utils';

interface UrlData {
  id: string;
  code: string;
  original: string;
  active: boolean;
  createdAt: string;
}

interface Stats {
  totalClicks: number;
  clicksByDay: { date: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  countryBreakdown: { country: string; count: number }[];
}

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<{ url: UrlData; stats: Stats } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/urls/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setData)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-red-500">{error || 'Link not found'}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { url, stats } = data;
  const shortUrl = `${getBaseUrl()}/${url.code}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-white">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-white">/{url.code}</span>
      </nav>

      {/* Summary card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              /{url.code}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 break-all">{url.original}</p>
            <p className="mt-2 text-sm text-zinc-400">
              Created {new Date(url.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-zinc-900 dark:text-white">
              {formatNumber(stats.totalClicks)}
            </p>
            <p className="text-sm text-zinc-500">total clicks</p>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <QRCodeDisplay value={shortUrl} />
        </div>
      </div>

      {/* Charts grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ClicksChart data={stats.clicksByDay} />
        <DeviceChart data={stats.deviceBreakdown} />
        <ReferrerTable data={stats.topReferrers} />
        <GeoChart data={stats.countryBreakdown} />
      </div>
    </div>
  );
}
