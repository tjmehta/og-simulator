import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const width = parseInt(searchParams.get('width') || '1200')
  const height = parseInt(searchParams.get('height') || '630')
  const delay = parseInt(searchParams.get('delay') || '0')
  const size = searchParams.get('size') // 'small', 'medium', 'large'

  // Handle preset sizes
  let finalWidth = width
  let finalHeight = height

  if (size) {
    switch (size) {
      case 'small':
        finalWidth = 600
        finalHeight = 315
        break
      case 'medium':
        finalWidth = 1200
        finalHeight = 630
        break
      case 'large':
        finalWidth = 1920
        finalHeight = 1080
        break
    }
  }

  try {
    // Add delay if specified
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    // Generate SVG placeholder image
    const svg = `
      <svg width="${finalWidth}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${Math.min(finalWidth, finalHeight) / 20}" font-weight="bold">
          Generated Image
        </text>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="${Math.min(finalWidth, finalHeight) / 30}">
          ${finalWidth} × ${finalHeight}
        </text>
        ${delay > 0 ? `<text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif" font-size="${Math.min(finalWidth, finalHeight) / 40}">Delayed ${delay}ms</text>` : ''}
      </svg>
    `

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return new NextResponse('Error generating image', { status: 500 })
  }
}
