import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  const delay = parseInt(searchParams.get('delay') || '0')
  const progressive = searchParams.get('progressive') === 'true'

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 })
  }

  try {
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

    // Progressive loading: send a few bytes immediately, then pause, then send the rest
    if (progressive && delay > 0) {
      const stream = new ReadableStream({
        start(controller) {
          const bytes = new Uint8Array(imageBuffer)
          const chunkSize = Math.min(1024, bytes.length) // Send first 1KB
          
          // Send first chunk immediately
          controller.enqueue(bytes.slice(0, chunkSize))
          
          // Then pause and send the rest
          setTimeout(() => {
            controller.enqueue(bytes.slice(chunkSize))
            controller.close()
          }, delay * 1000)
        }
      })

      return new NextResponse(stream, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // Regular delay behavior: wait then send all data
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay * 1000))
    }

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
