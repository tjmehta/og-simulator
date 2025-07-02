import { Metadata } from 'next'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import OGSimulatorClient from './og-simulator-client-new'

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const params = await searchParams
  const title = params.title as string || 'OG Tag Simulator'
  const description = params.description as string || 'Test and preview your Open Graph meta tags'
  const url = params.url as string || ''
  const image = params.image as string || ''
  const siteName = params.site_name as string || 'OG Simulator'
  const delay = params.delay as string || '0'
  const imageDelay = params.image_delay as string || '0'
  const imageWidth = params.image_width as string || ''
  const imageHeight = params.image_height as string || ''
  const imageSize = params.image_size as string || ''

  // Add delay if specified
  if (delay && parseInt(delay) > 0) {
    await new Promise(resolve => setTimeout(resolve, parseInt(delay) * 1000))
  }

  // Get the current host for absolute URLs
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const baseUrl = `${protocol}://${host}`

  // Determine the final image URL
  let finalImageUrl: string | undefined = undefined

  if (image) {
    // Use external image with proxy - absolute URL for OG tags
    finalImageUrl = `${baseUrl}/api/image-proxy?url=${encodeURIComponent(image)}&delay=${parseInt(imageDelay) * 1000}`
  } else if (imageSize || imageWidth || imageHeight) {
    // Generate image with specified dimensions - absolute URL for OG tags
    const imgParams = new URLSearchParams()
    imgParams.set('delay', (parseInt(imageDelay) * 1000).toString())
    if (imageSize && imageSize !== 'custom') {
      imgParams.set('size', imageSize)
    } else {
      if (imageWidth) imgParams.set('width', imageWidth)
      if (imageHeight) imgParams.set('height', imageHeight)
    }
    finalImageUrl = `${baseUrl}/api/generate-image?${imgParams.toString()}`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: 'website',
      ...(finalImageUrl && { images: [{ url: finalImageUrl }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(finalImageUrl && { images: [finalImageUrl] }),
    },
  }
}

export default function OGSimulator() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading...</h1>
        <p className="text-gray-600 dark:text-gray-300">Setting up your OG tag simulator</p>
      </div>
    </div>}>
      <OGSimulatorClient />
    </Suspense>
  )
}
