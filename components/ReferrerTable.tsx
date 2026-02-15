'use client';

interface ReferrerData {
  referrer: string;
  count: number;
}

export default function ReferrerTable({ data }: { data: ReferrerData[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Top Referrers
        </h3>
        <p className="mt-4 text-sm text-zinc-500">No referrer data yet.</p>
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Top Referrers
      </h3>
      <div className="mt-4 space-y-2">
        {data.map((r) => (
          <div key={r.referrer} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate text-zinc-700 dark:text-zinc-300">
                  {r.referrer}
                </span>
                <span className="text-zinc-500">{r.count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(r.count / total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
