import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 })
  }

  try {
    // Validate URL
    const parsedUrl = new URL(url)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 })
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Wikilinks/1.0; +https://wikilinks.app)'
      },
      // 5 second timeout via AbortSignal
      signal: AbortSignal.timeout(5000)
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 502 })
    }

    const html = await res.text()

    // Extract OG/meta tags
    const ogImage = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image')
    const ogTitle = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title') || extractTitle(html)
    const ogDescription = extractMeta(html, 'og:description') || extractMeta(html, 'twitter:description') || extractMeta(html, 'description')

    // Resolve relative image URLs
    const resolvedImage = ogImage ? resolveUrl(ogImage, parsedUrl.origin) : null

    return NextResponse.json({
      og_image_url: resolvedImage,
      og_title: ogTitle?.trim() || null,
      og_description: ogDescription?.trim() || null,
    })
  } catch (e: any) {
    // Timeout or network error — return empty gracefully
    return NextResponse.json({
      og_image_url: null,
      og_title: null,
      og_description: null,
    })
  }
}

function extractMeta(html: string, name: string): string | null {
  // Try property="og:..." or name="..."
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match?.[1] || null
}

function resolveUrl(url: string, origin: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `${origin}${url}`
  return url
}
