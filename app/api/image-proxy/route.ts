import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  const delay = parseInt(searchParams.get('delay') || '0')

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 })
  }

  try {
    // Add delay if specified
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay * 1000))
    }

    // Fetch the original image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'OG-Simulator/1.0',
      },
    })

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status })
    }

    // Get the image data and content type
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new NextResponse('Error fetching image', { status: 500 })
  }
}
