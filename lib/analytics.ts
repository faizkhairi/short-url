import { prisma } from './db';

export async function getClickStats(urlId: string) {
  const [totalClicks, clicksByDay, topReferrers, deviceBreakdown, countryBreakdown] =
    await Promise.all([
      // Total clicks
      prisma.click.count({ where: { urlId } }),

      // Clicks by day (last 30 days)
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("timestamp") as date, COUNT(*)::bigint as count
        FROM "Click"
        WHERE "urlId" = ${urlId}
          AND "timestamp" > NOW() - INTERVAL '30 days'
        GROUP BY DATE("timestamp")
        ORDER BY date ASC
      `,

      // Top referrers
      prisma.click.groupBy({
        by: ['referrer'],
        where: { urlId, referrer: { not: null } },
        _count: true,
        orderBy: { _count: { referrer: 'desc' } },
        take: 10,
      }),

      // Device breakdown
      prisma.click.groupBy({
        by: ['device'],
        where: { urlId, device: { not: null } },
        _count: true,
        orderBy: { _count: { device: 'desc' } },
      }),

      // Country breakdown
      prisma.click.groupBy({
        by: ['country'],
        where: { urlId, country: { not: null } },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 10,
      }),
    ]);

  return {
    totalClicks,
    clicksByDay: clicksByDay.map((d) => ({
      date: String(d.date),
      count: Number(d.count),
    })),
    topReferrers: topReferrers.map((r) => ({
      referrer: r.referrer || 'Direct',
      count: r._count,
    })),
    deviceBreakdown: deviceBreakdown.map((d) => ({
      device: d.device || 'Unknown',
      count: d._count,
    })),
    countryBreakdown: countryBreakdown.map((c) => ({
      country: c.country || 'Unknown',
      count: c._count,
    })),
  };
}
