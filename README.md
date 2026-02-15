# Short URL

A modern URL shortener with click analytics, QR code generation, and a real-time dashboard — built with Next.js 16, Prisma 7, and Neon PostgreSQL.

## Features

- **Shorten URLs** — Generate short links with optional custom aliases
- **QR Codes** — Auto-generated QR code for every short link
- **Click Analytics** — Track clicks with timestamp, geo-location, device, browser, OS, and referrer
- **Analytics Dashboard** — Visualize clicks over time, device breakdown, top referrers, and geographic distribution
- **Link Management** — Toggle links active/inactive, delete with cascade

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [Prisma 7](https://www.prisma.io/) | Type-safe ORM |
| [Neon PostgreSQL](https://neon.tech/) | Serverless database |
| [Recharts](https://recharts.org/) | Analytics charts |
| [nanoid](https://github.com/ai/nanoid) | Short code generation |
| [ua-parser-js](https://github.com/nicedaycode/ua-parser-js) | Device/browser detection |
| [react-qrcode-logo](https://github.com/gcoro/react-qrcode-logo) | QR code rendering |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Vitest](https://vitest.dev/) | Testing |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier available)

### Setup

```bash
# Clone the repo
git clone https://github.com/faizkhairi/short-url.git
cd short-url

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Neon database URL to .env
# DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start shortening URLs.

### Database Schema

```
Url (id, code, original, active, createdAt, updatedAt)
 └── Click (id, urlId, timestamp, country, city, device, browser, os, referrer)
```

## Project Structure

```
short-url/
├── app/
│   ├── page.tsx                  # URL shortener form
│   ├── [code]/route.ts           # Redirect + click tracking
│   ├── dashboard/
│   │   ├── page.tsx              # All links list
│   │   └── [id]/page.tsx         # Single link analytics
│   └── api/
│       ├── shorten/route.ts      # POST create short URL
│       ├── urls/route.ts         # GET list URLs
│       └── urls/[id]/route.ts    # GET analytics, PATCH, DELETE
├── components/
│   ├── ShortenForm.tsx           # URL input + result
│   ├── QRCode.tsx                # QR code wrapper
│   ├── LinkCard.tsx              # Link card with actions
│   ├── ClicksChart.tsx           # Clicks over time
│   ├── DeviceChart.tsx           # Device breakdown pie
│   ├── ReferrerTable.tsx         # Top referrers
│   └── GeoChart.tsx              # Country breakdown
├── lib/
│   ├── db.ts                     # Prisma client (Neon adapter)
│   ├── utils.ts                  # URL validation, nanoid
│   └── analytics.ts              # Click aggregation queries
└── prisma/schema.prisma          # Database schema
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |

## License

MIT
