import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoUrl = searchParams.get('url')

  if (!videoUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    let videoId = ''
    try {
      const urlObj = new URL(videoUrl)
      if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1)
      } else if (urlObj.hostname.includes('youtube.com')) {
        if (urlObj.pathname.includes('/watch')) {
          videoId = urlObj.searchParams.get('v') || ''
        } else if (urlObj.pathname.includes('/shorts/')) {
          videoId = urlObj.pathname.split('/')[2]
        }
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    if (!videoId) {
      return NextResponse.json({ error: 'Could not extract video ID' }, { status: 400 })
    }

    let result = {
      videoId,
      title: '',
      channel: '',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      durationSeconds: 0,
      publishedAt: null as string | null
    }

    const apiKey = process.env.YOUTUBE_API_KEY || process.env.GEMINI_API_KEY

    if (apiKey) {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
      const response = await fetch(apiUrl)
      if (response.ok) {
        const data = await response.json()
        if (data.items && data.items.length > 0) {
          const item = data.items[0]
          result.title = item.snippet.title
          result.channel = item.snippet.channelTitle
          
          if (item.snippet.thumbnails?.medium?.url) {
            result.thumbnailUrl = item.snippet.thumbnails.medium.url
          }

          result.publishedAt = item.snippet.publishedAt

          const durationStr = item.contentDetails.duration
          result.durationSeconds = parseISODuration(durationStr)
          
          return NextResponse.json(result)
        }
      }
    }

    // Fallback: oEmbed
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const oembedResponse = await fetch(oembedUrl)
    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json()
      result.title = oembedData.title
      result.channel = oembedData.author_name
      if (oembedData.thumbnail_url) {
        result.thumbnailUrl = oembedData.thumbnail_url
      }
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Failed to fetch metadata', partialData: result }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function parseISODuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return 0
  
  const hours = (parseInt(match[1]) || 0)
  const minutes = (parseInt(match[2]) || 0)
  const seconds = (parseInt(match[3]) || 0)
  
  return hours * 3600 + minutes * 60 + seconds
}
