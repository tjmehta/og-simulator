import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

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

    // Create gradient background using Sharp
    const gradientSvg = `
      <svg width="${finalWidth}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
      </svg>
    `

    // Calculate font sizes based on image dimensions
    const titleFontSize = Math.min(finalWidth, finalHeight) / 20
    const sizeFontSize = Math.min(finalWidth, finalHeight) / 30
    const delayFontSize = Math.min(finalWidth, finalHeight) / 40

    // Create the main title text SVG
    const titleTextSvg = `
      <svg width="${finalWidth}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="white" 
              font-family="Arial, sans-serif" font-size="${titleFontSize}" font-weight="bold">
          Generated Image
        </text>
      </svg>
    `

    // Create the size text SVG
    const sizeTextSvg = `
      <svg width="${finalWidth}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.8)" 
              font-family="Arial, sans-serif" font-size="${sizeFontSize}">
          ${finalWidth} × ${finalHeight}
        </text>
      </svg>
    `

    // Create the delay text SVG if delay is specified
    const delayTextSvg = delay > 0 ? `
      <svg width="${finalWidth}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.6)" 
              font-family="Arial, sans-serif" font-size="${delayFontSize}">
          Delayed ${delay}ms
        </text>
      </svg>
    ` : null

    // Generate PNG image using Sharp
    let image = sharp(Buffer.from(gradientSvg))
      .resize(finalWidth, finalHeight)
      .png()

    // Composite the text layers on top
    const compositeOperations = [
      { input: Buffer.from(titleTextSvg), top: 0, left: 0 },
      { input: Buffer.from(sizeTextSvg), top: 0, left: 0 }
    ]

    if (delayTextSvg) {
      compositeOperations.push({ input: Buffer.from(delayTextSvg), top: 0, left: 0 })
    }

    const pngBuffer = await image.composite(compositeOperations).png().toBuffer()

    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
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
