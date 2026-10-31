# OG Simulator

Generate test URLs with dynamic OG tags including images and simulating delays

Try it out - [OG Simulator](https://og-simulator.vercel.app)

## Search crawling and ownership

The canonical public URL is `https://og-simulator.vercel.app/`.
`app/sitemap.ts` publishes only this URL at `/sitemap.xml`; simulator query
parameters, user-supplied content, and image API routes are not sitemap entries.
`app/robots.ts` publishes `/robots.txt`, allows the public page, disallows `/api/`,
and points to the absolute production sitemap URL.

`app/layout.tsx` owns the canonical link and the public Google Search Console
verification tag. Keep these values tied to the existing production site, including
on preview deployments. The Search Console account owner verifies the URL-prefix
property and submits the sitemap after the accepted change is live.
