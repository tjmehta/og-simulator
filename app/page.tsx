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
  const siteName = params.site_name as string || 'OG Simulator'
  const delay = parseInt(params.delay as string || '0')

  // Handle meta tags from arrays
  const metaTagNames = Array.isArray(params.meta_tag_name) ? params.meta_tag_name : (params.meta_tag_name ? [params.meta_tag_name] : [])
  const metaTagValues = Array.isArray(params.meta_tag_value) ? params.meta_tag_value : (params.meta_tag_value ? [params.meta_tag_value] : [])

  // Build meta tags object
  const customMetaTags: { [key: string]: string } = {}
  for (let i = 0; i < Math.max(metaTagNames.length, metaTagValues.length); i++) {
    const name = metaTagNames[i] as string || ''
    const value = metaTagValues[i] as string || ''
    if (name && value) {
      customMetaTags[name] = value
    }
  }

  // Override siteName with custom meta tag if present
  const finalSiteName = customMetaTags['og:site_name'] || siteName

  // Add page delay if specified
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay * 1000))
  }

  // Get the current host for absolute URLs
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const baseUrl = `${protocol}://${host}`

  // Handle multiple images using array-based query parameters
  const imageUrls: string[] = []

  // Get arrays of image parameters
  const images = Array.isArray(params.image) ? params.image : (params.image ? [params.image] : [])
  const imageTypes = Array.isArray(params.image_type) ? params.image_type : (params.image_type ? [params.image_type] : [])
  const imageDelays = Array.isArray(params.image_delay) ? params.image_delay : (params.image_delay ? [params.image_delay] : [])
  const imageWidths = Array.isArray(params.image_width) ? params.image_width : (params.image_width ? [params.image_width] : [])
  const imageHeights = Array.isArray(params.image_height) ? params.image_height : (params.image_height ? [params.image_height] : [])
  const imageSizes = Array.isArray(params.image_size) ? params.image_size : (params.image_size ? [params.image_size] : [])

  // Find the maximum length to process all images
  const maxLength = Math.max(
    images.length,
    imageTypes.length,
    imageDelays.length,
    imageWidths.length,
    imageHeights.length,
    imageSizes.length
  )

  for (let i = 0; i < maxLength; i++) {
    const imageUrl = images[i] as string || ''
    const imageType = imageTypes[i] as string || ''
    const imageDelay = imageDelays[i] as string || '0'
    const imageWidth = imageWidths[i] as string || ''
    const imageHeight = imageHeights[i] as string || ''
    const imageSize = imageSizes[i] as string || ''

    // Skip if no relevant parameters
    if (!imageUrl && !imageType && !imageWidth && !imageHeight && !imageSize) {
      continue
    }

    let finalImageUrl: string | undefined = undefined

    if (imageUrl && imageType === 'external') {
      // External image with proxy
      finalImageUrl = `${baseUrl}/api/image-proxy?url=${encodeURIComponent(imageUrl)}&delay=${parseInt(imageDelay) * 1000}`
    } else if (imageType === 'generate' || imageSize || imageWidth || imageHeight) {
      // Generated image
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

    if (finalImageUrl) {
      imageUrls.push(finalImageUrl)
    }
  }

  // Build openGraph object with custom meta tags
  const openGraphData: any = {
    title: customMetaTags['og:title'] || title,
    description: customMetaTags['og:description'] || description,
    url: customMetaTags['og:url'] || url,
    siteName: finalSiteName,
    type: customMetaTags['og:type'] || 'website',
    ...(imageUrls.length > 0 && { images: imageUrls.map(url => ({ url })) }),
  }

  // Add locale if specified
  if (customMetaTags['og:locale']) {
    openGraphData.locale = customMetaTags['og:locale']
  }

  // Build twitter card data with custom meta tags
  const twitterData: any = {
    card: customMetaTags['twitter:card'] || 'summary_large_image',
    title: customMetaTags['twitter:title'] || title,
    description: customMetaTags['twitter:description'] || description,
    ...(imageUrls.length > 0 && { images: imageUrls }),
  }

  // Build other meta tags
  const otherMetaTags: any = {}
  Object.entries(customMetaTags).forEach(([name, value]) => {
    // Skip meta tags that are already handled by openGraph and twitter
    if (!name.startsWith('og:') && !name.startsWith('twitter:')) {
      otherMetaTags[name] = value
    }
  })

  return {
    title: customMetaTags['og:title'] || title,
    description: customMetaTags['og:description'] || description,
    openGraph: openGraphData,
    twitter: twitterData,
    other: otherMetaTags,
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
