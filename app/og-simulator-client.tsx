'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function OGSimulatorClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [siteName, setSiteName] = useState('')
  const [delay, setDelay] = useState([0])
  const [images, setImages] = useState<Array<{
    id: string
    type: 'generate' | 'external'
    url?: string
    width?: string
    height?: string
    size?: string
    delay: number
  }>>([])

  // Legacy state for URL params compatibility (we'll migrate these to the images array)
  const [imageUrl, setImageUrl] = useState('')
  const [imageDelay, setImageDelay] = useState([0])
  const [imageWidth, setImageWidth] = useState('')
  const [imageHeight, setImageHeight] = useState('')
  const [imageSize, setImageSize] = useState('')

    // Initialize from URL params
  useEffect(() => {
    setTitle(searchParams.get('title') || 'Test Page Title')
    setDescription(searchParams.get('description') || 'Test page description for OG tag generation')
    setImageUrl(searchParams.get('image') || '')
    setSiteName(searchParams.get('site_name') || 'Test Site')
    setDelay([parseInt(searchParams.get('delay') || '0')])
    setImageDelay([parseInt(searchParams.get('image_delay') || '0')])
    setImageWidth(searchParams.get('image_width') || '')
    setImageHeight(searchParams.get('image_height') || '')
    setImageSize(searchParams.get('image_size') || '')

    // Convert legacy URL params to images array if we have image data
    const hasImageUrl = searchParams.get('image')
    const hasGenerationParams = searchParams.get('image_width') || searchParams.get('image_height') || searchParams.get('image_size')

    if (hasImageUrl || hasGenerationParams) {
      setImages([{
        id: 'legacy',
        type: hasImageUrl ? 'external' : 'generate',
        url: searchParams.get('image') || undefined,
        width: searchParams.get('image_width') || undefined,
        height: searchParams.get('image_height') || undefined,
        size: searchParams.get('image_size') || undefined,
        delay: parseInt(searchParams.get('image_delay') || '0') / 1000 // Convert from ms to seconds
      }])
    }
  }, [searchParams])

  // Image management functions
  const addImage = () => {
    const newImage = {
      id: `img-${Date.now()}`,
      type: 'generate' as const,
      delay: 0
    }
    setImages(prev => [...prev, newImage])
  }

  const updateImage = (id: string, updates: Partial<typeof images[0]>) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, ...updates } : img
    ))
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const getImageUrl = (image: typeof images[0], absolute = false) => {
    const baseUrl = absolute && typeof window !== 'undefined' ? window.location.origin : ''

    if (image.type === 'external' && image.url) {
      if (image.delay > 0) {
        return `${baseUrl}/api/image-proxy?url=${encodeURIComponent(image.url)}&delay=${image.delay * 1000}`
      }
      return image.url
    } else if (image.type === 'generate' && (image.size || image.width || image.height)) {
      const params = new URLSearchParams()
      params.set('delay', (image.delay * 1000).toString())
      if (image.size && image.size !== 'custom') {
        params.set('size', image.size)
      } else {
        if (image.width) params.set('width', image.width)
        if (image.height) params.set('height', image.height)
      }
      return `${baseUrl}/api/generate-image?${params.toString()}`
    }
    return null
  }

  // Legacy helper for backwards compatibility
  const getLegacyImageUrl = (absolute = false) => {
    const baseUrl = absolute && typeof window !== 'undefined' ? window.location.origin : ''

    if (imageUrl) {
      return `${baseUrl}/api/image-proxy?url=${encodeURIComponent(imageUrl)}&delay=${imageDelay[0] * 1000}`
    } else if ((imageSize && imageSize !== 'custom') || imageWidth || imageHeight) {
      const params = new URLSearchParams()
      params.set('delay', (imageDelay[0] * 1000).toString())
      if (imageSize && imageSize !== 'custom') {
        params.set('size', imageSize)
      } else {
        if (imageWidth) params.set('width', imageWidth)
        if (imageHeight) params.set('height', imageHeight)
      }
      return `${baseUrl}/api/generate-image?${params.toString()}`
    }
    return null
  }

    // Generate test URL
  const generateTestURL = () => {
    const params = new URLSearchParams()
    if (title) params.set('title', title)
    if (description) params.set('description', description)
    if (imageUrl) params.set('image', imageUrl)
    if (siteName) params.set('site_name', siteName)
    if (delay[0] > 0) params.set('delay', delay[0].toString())
    if (imageDelay[0] > 0) params.set('image_delay', imageDelay[0].toString())

    // Only add image dimensions if generateImage is checked and no URL is provided
    if (!imageUrl && generateImage) {
      if (imageSize && imageSize !== 'custom') params.set('image_size', imageSize)
      if (imageWidth && (!imageSize || imageSize === 'custom')) params.set('image_width', imageWidth)
      if (imageHeight && (!imageSize || imageSize === 'custom')) params.set('image_height', imageHeight)
    }

    // Use full URL with domain for easy copying and sharing
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    return `${baseUrl}/?${params.toString()}`
  }

    // Update URL params when form changes
  const updateURL = () => {
    const params = new URLSearchParams()
    if (title) params.set('title', title)
    if (description) params.set('description', description)
    if (imageUrl) params.set('image', imageUrl)
    if (siteName) params.set('site_name', siteName)
    if (delay[0] > 0) params.set('delay', delay[0].toString())
    if (imageDelay[0] > 0) params.set('image_delay', imageDelay[0].toString())

    // Only add image dimensions if generateImage is checked and no URL is provided
    if (!imageUrl && generateImage) {
      if (imageSize && imageSize !== 'custom') params.set('image_size', imageSize)
      if (imageWidth && (!imageSize || imageSize === 'custom')) params.set('image_width', imageWidth)
      if (imageHeight && (!imageSize || imageSize === 'custom')) params.set('image_height', imageHeight)
    }

    router.push(`?${params.toString()}`, { scroll: false })
  }

  const copyTestURL = async () => {
    const testURL = generateTestURL()
    try {
      await navigator.clipboard.writeText(testURL)
      toast.success('Test URL copied to clipboard!', {
        description: 'Ready to paste into your third-party application',
      })
    } catch (err) {
      toast.error('Failed to copy URL', {
        description: 'Please try again or copy manually',
      })
    }
  }

    const generateSampleData = () => {
    setTitle('Amazing Product Launch - Revolutionary Tech for Everyone')
    setDescription('Discover our groundbreaking new product that will transform the way you work, play, and connect. Join thousands of satisfied customers who have already experienced the future.')
    setImageUrl('') // Clear URL to use generated image
    setSiteName('TechCorp')
    setDelay([2])
    setImageDelay([1])
    setImageWidth('1200')
    setImageHeight('630')
    setImageSize('custom')
    setGenerateImage(true) // Enable image generation

    updateURL()

    toast.success('Sample data generated!', {
      description: 'Form filled with sample content using generated image',
    })
  }

    const clearForm = () => {
    setTitle('')
    setDescription('')
    setImageUrl('')
    setSiteName('')
    setDelay([0])
    setImageDelay([0])
    setImageWidth('')
    setImageHeight('')
    setImageSize('custom')
    setGenerateImage(false) // Disable image generation

    router.push('/', { scroll: false })

    toast.info('Form cleared', {
      description: 'All fields have been reset',
    })
  }

  // Helper function to get the correct image URL
  const getImageUrl = (absolute = false) => {
    const baseUrl = absolute && typeof window !== 'undefined' ? window.location.origin : ''

    if (imageUrl) {
      // Use external image with proxy
      return `${baseUrl}/api/image-proxy?url=${encodeURIComponent(imageUrl)}&delay=${imageDelay[0] * 1000}`
    } else if (generateImage && ((imageSize && imageSize !== 'custom') || imageWidth || imageHeight)) {
      // Generate image with specified dimensions
      const params = new URLSearchParams()
      params.set('delay', (imageDelay[0] * 1000).toString())
      if (imageSize && imageSize !== 'custom') {
        params.set('size', imageSize)
      } else {
        if (imageWidth) params.set('width', imageWidth)
        if (imageHeight) params.set('height', imageHeight)
      }
      return `${baseUrl}/api/generate-image?${params.toString()}`
    }
    return null
  }

  const generateMetaTags = () => {
    const finalImageUrl = getImageUrl(true) // Use absolute URLs for meta tags
    return [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: siteName },
      ...(finalImageUrl ? [{ property: 'og:image', content: finalImageUrl }] : []),
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      ...(finalImageUrl ? [{ name: 'twitter:image', content: finalImageUrl }] : []),
    ]
  }

  const copyMetaTags = async () => {
    const tags = generateMetaTags()
      .map(tag => {
        const attrs = Object.entries(tag)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ')
        return `<meta ${attrs} />`
      })
      .join('\n')

    try {
      await navigator.clipboard.writeText(tags)
      toast.success('Meta tags copied to clipboard!', {
        description: `${generateMetaTags().length} tags copied successfully`,
      })
    } catch (err) {
      toast.error('Failed to copy meta tags', {
        description: 'Please try again or copy manually',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            OG Tag Simulator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate test URLs with dynamic OG tags and configurable delays
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>⚙️</span>
                Configure Test Parameters
              </CardTitle>
              <CardDescription>
                Set up your OG tags and delays to generate test URLs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter page title"
                  className="w-full"
                />
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Page Load Delay: {delay[0]}s</Label>
                  <Slider
                    value={delay}
                    onValueChange={setDelay}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter page description"
                  className="w-full min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Image Configuration</Label>

                  {/* Generate Image Checkbox */}
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <Checkbox
                      id="generateImage"
                      checked={generateImage}
                      onCheckedChange={(checked) => {
                        setGenerateImage(!!checked)
                        if (!checked) {
                          // Clear generation settings when unchecked
                          setImageWidth('')
                          setImageHeight('')
                          setImageSize('')
                        }
                      }}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="generateImage"
                        className="text-sm font-medium cursor-pointer"
                      >
                        📷 Generate placeholder image
                      </Label>
                      <p className="text-xs text-gray-500">
                        Creates a server-side SVG placeholder with custom dimensions
                      </p>
                    </div>
                  </div>

                  {/* Image Generation Options */}
                  {generateImage && (
                    <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="space-y-2">
                        <Label htmlFor="imageSize" className="text-sm">Size Preset</Label>
                        <Select value={imageSize} onValueChange={setImageSize}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose preset or custom dimensions" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">Custom dimensions</SelectItem>
                            <SelectItem value="small">Small (600×315) - Twitter Card</SelectItem>
                            <SelectItem value="medium">Medium (1200×630) - Facebook OG</SelectItem>
                            <SelectItem value="large">Large (1920×1080) - High Resolution</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(!imageSize || imageSize === 'custom') && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="imageWidth" className="text-sm">Width (px)</Label>
                            <Input
                              id="imageWidth"
                              value={imageWidth}
                              onChange={(e) => setImageWidth(e.target.value)}
                              placeholder="1200"
                              type="number"
                              min="100"
                              max="2000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="imageHeight" className="text-sm">Height (px)</Label>
                            <Input
                              id="imageHeight"
                              value={imageHeight}
                              onChange={(e) => setImageHeight(e.target.value)}
                              placeholder="630"
                              type="number"
                              min="100"
                              max="2000"
                            />
                          </div>
                        </div>
                      )}

                      {/* Generated Image URL Display */}
                      {generateImage && getImageUrl() && (
                        <div className="space-y-2">
                          <Label className="text-sm text-green-700 dark:text-green-300">Generated Image URL:</Label>
                          <div className="bg-white dark:bg-gray-900 p-2 rounded border text-xs font-mono break-all text-gray-600 dark:text-gray-400">
                            {getImageUrl(true)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* External Image URL */}
                  <div className="space-y-2">
                    <Label htmlFor="image">External Image URL</Label>
                    <Input
                      id="image"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full"
                      disabled={generateImage}
                    />
                    {generateImage && (
                      <p className="text-xs text-gray-500">
                        External URL is disabled when generating images. Uncheck "Generate" to use external URLs.
                      </p>
                    )}
                    {!generateImage && (
                      <p className="text-xs text-gray-500">
                        Use an external image URL, or check "Generate" to create a placeholder
                      </p>
                    )}
                  </div>

                  {/* Image Delay Control - Always visible */}
                  <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      ⏱️ Image Load Delay: {imageDelay[0]}s
                    </Label>
                    <Slider
                      value={imageDelay}
                      onValueChange={setImageDelay}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {(imageUrl || (generateImage && (imageSize || imageWidth || imageHeight)))
                        ? (imageUrl
                          ? "Delays external image loading via proxy"
                          : "Delays generated image response")
                        : "Configure delay for when an image is added"
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Your Site Name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Button onClick={updateURL} className="w-full">
                  🔄 Update Preview & URL
                </Button>
                <div className="flex gap-2">
                  <Button onClick={generateSampleData} variant="outline" className="flex-1">
                    📄 Generate Sample
                  </Button>
                  <Button onClick={clearForm} variant="outline" className="flex-1">
                    🗑️ Clear Form
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* URL Generation and Preview */}
          <div className="space-y-6">
            {/* Test URL Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔗</span>
                  Generated Test URL
                </CardTitle>
                <CardDescription>
                  Copy this URL to test in your third-party application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm font-mono break-all">
                    {generateTestURL()}
                  </div>
                  <Button onClick={copyTestURL} className="w-full">
                    📋 Copy Test URL
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>👁️</span>
                  Social Media Preview
                </CardTitle>
                <CardDescription>
                  How your content will appear when shared
                </CardDescription>
              </CardHeader>
              <CardContent>
                                <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 space-y-3">
                                    {getImageUrl() && (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageUrl() || ''}
                        alt="OG Image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                          if (nextElement) {
                            nextElement.style.display = 'flex'
                          }
                        }}
                      />
                      <div className="hidden w-full h-full bg-gray-200 dark:bg-gray-700 items-center justify-center text-gray-500">
                        Image not found
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400 text-sm mb-1">
                      {siteName}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                      {title || 'No title provided'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                      {description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Meta Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🏷️</span>
                  Generated Meta Tags
                </CardTitle>
                <CardDescription>
                  Copy these tags to your HTML head section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button onClick={copyMetaTags} size="sm">
                      Copy All Tags
                    </Button>
                    <Badge variant="secondary">
                      {generateMetaTags().length} tags
                    </Badge>
                  </div>
                  <Separator />
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm font-mono overflow-x-auto max-h-64 overflow-y-auto">
                    {generateMetaTags().map((tag, index) => {
                      const attrs = Object.entries(tag)
                        .map(([key, value]) => `${key}="${value}"`)
                        .join(' ')
                      return (
                        <div key={index} className="text-gray-800 dark:text-gray-200 mb-1">
                          &lt;<span className="text-blue-600 dark:text-blue-400">meta</span>{' '}
                          <span className="text-green-600 dark:text-green-400">{attrs}</span>{' '}
                          /&gt;
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Debug Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🐛</span>
                  Debug Information
                </CardTitle>
                <CardDescription>
                  Current parameters and timing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Configuration:</strong>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                      <div className="text-sm space-y-1">
                        <div>Page delay: {delay[0]}s ({delay[0] * 1000}ms)</div>
                        <div>Image delay: {imageDelay[0]}s ({imageDelay[0] * 1000}ms)</div>
                        {imageUrl && (
                          <div>Image source: External URL → Proxy with delay</div>
                        )}
                        {!imageUrl && generateImage && (imageSize || imageWidth || imageHeight) && (
                          <div>Image source: Generated SVG {imageSize && imageSize !== 'custom' ? `(${imageSize} preset)` : `(${imageWidth || '?'}×${imageHeight || '?'} custom)`}</div>
                        )}
                        {!imageUrl && !generateImage && (
                          <div>Image source: None configured (generation disabled)</div>
                        )}
                        {!imageUrl && generateImage && !imageSize && !imageWidth && !imageHeight && (
                          <div>Image source: Generation enabled but no dimensions set</div>
                        )}
                        {getImageUrl() && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 break-all space-y-1">
                            <div>Relative URL: {getImageUrl()}</div>
                            <div>Absolute URL: {getImageUrl(true)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <strong>URL Parameters:</strong>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                      {searchParams.toString() || 'No parameters'}
                    </div>
                  </div>

                  <div>
                    <strong>Validation:</strong>
                    <div className="space-y-1 mt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={title ? "default" : "destructive"}>
                          {title ? "✓" : "✗"} Title
                        </Badge>
                        <Badge variant={description ? "default" : "destructive"}>
                          {description ? "✓" : "✗"} Description
                        </Badge>
                        <Badge variant={delay[0] > 0 ? "default" : "secondary"}>
                          {delay[0] > 0 ? "⏱️" : "⚡"} Page Timing
                        </Badge>
                        <Badge variant={getImageUrl() ? "default" : "secondary"}>
                          {getImageUrl() ? "🖼️" : "📷"} Image {imageUrl ? "(External)" : generateImage && (imageSize || imageWidth || imageHeight) ? "(Generated)" : "(None)"}
                        </Badge>
                        <Badge variant={getImageUrl() && imageDelay[0] > 0 ? "default" : "secondary"}>
                          {getImageUrl() && imageDelay[0] > 0 ? "⏱️" : "⚡"} Image Timing
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
