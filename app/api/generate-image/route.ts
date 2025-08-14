import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const width = parseInt(searchParams.get('width') || '1200')
  const height = parseInt(searchParams.get('height') || '630')
  const delay = parseInt(searchParams.get('delay') || '0')
  const progressive = searchParams.get('progressive') === 'true'
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
    // Create gradient effect using multiple colored rectangles
    // This completely avoids SVG and fontconfig dependencies
    
    const gradientSteps = 10
    const stepHeight = Math.ceil(finalHeight / gradientSteps)
    
    // Create base image with solid color
    let baseImage = sharp({
      create: {
        width: finalWidth,
        height: finalHeight,
        channels: 3,
        background: { r: 102, g: 126, b: 234 } // Start color #667eea
      }
    })

    // Create gradient effect by overlaying rectangles with varying opacity
    const overlays = []
    for (let i = 0; i < gradientSteps; i++) {
      const progress = i / (gradientSteps - 1)
      // Interpolate between start color (102, 126, 234) and end color (118, 75, 162)
      const r = Math.round(102 + (118 - 102) * progress)
      const g = Math.round(126 + (75 - 126) * progress)
      const b = Math.round(234 + (162 - 234) * progress)
      
      const stepImage = await sharp({
        create: {
          width: finalWidth,
          height: stepHeight,
          channels: 3,
          background: { r, g, b }
        }
      }).png().toBuffer()

      overlays.push({
        input: stepImage,
        top: i * stepHeight,
        left: 0
      })
    }

    // Apply gradient overlays
    if (overlays.length > 0) {
      baseImage = baseImage.composite(overlays)
    }

    // Add simple geometric shapes to represent text areas
    const centerX = Math.round(finalWidth / 2)
    const titleY = Math.round(finalHeight * 0.4)
    const sizeY = Math.round(finalHeight * 0.55)
    const delayY = Math.round(finalHeight * 0.7)

    // Create text placeholder rectangles
    const titleRect = await sharp({
      create: {
        width: Math.min(Math.round(finalWidth * 0.6), 400),
        height: Math.round(finalHeight * 0.08),
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0.9 }
      }
    }).png().toBuffer()

    const sizeRect = await sharp({
      create: {
        width: Math.min(Math.round(finalWidth * 0.4), 250),
        height: Math.round(finalHeight * 0.06),
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0.7 }
      }
    }).png().toBuffer()

    const compositeOps = [
      {
        input: titleRect,
        top: titleY,
        left: centerX - Math.round(Math.min(finalWidth * 0.6, 400) / 2)
      },
      {
        input: sizeRect,
        top: sizeY,
        left: centerX - Math.round(Math.min(finalWidth * 0.4, 250) / 2)
      }
    ]

    // Add delay indicator if specified
    if (delay > 0) {
      const delayRect = await sharp({
        create: {
          width: Math.min(Math.round(finalWidth * 0.3), 180),
          height: Math.round(finalHeight * 0.04),
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0.5 }
        }
      }).png().toBuffer()

      compositeOps.push({
        input: delayRect,
        top: delayY,
        left: centerX - Math.round(Math.min(finalWidth * 0.3, 180) / 2)
      })
    }

    // Composite all elements
    const finalImage = await baseImage.composite(compositeOps).png().toBuffer()

    // Progressive loading: send a few bytes immediately, then pause, then send the rest
    if (progressive && delay > 0) {
      const stream = new ReadableStream({
        start(controller) {
          const bytes = new Uint8Array(finalImage)
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
          'Content-Type': 'image/png',
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

    return new NextResponse(finalImage, {
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
