'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface ImageConfig {
  id: string
  type: 'generate' | 'external'
  url?: string
  width?: string
  height?: string
  size?: string
  delay: number
}

interface MetaTag {
  id: string
  name: string
  value: string
}

export default function OGSimulatorClientNew() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [title, setTitle] = useState(searchParams.get('title') || 'Test Page Title')
  const [description, setDescription] = useState(searchParams.get('description') || 'Test page description for OG tag generation')
  const [delay, setDelay] = useState([parseInt(searchParams.get('delay') || '0')])
  const [images, setImages] = useState<ImageConfig[]>(() => {
    const imageUrls = searchParams.getAll('image')
    const imageTypes = searchParams.getAll('image_type')
    const imageDelays = searchParams.getAll('image_delay')
    const imageWidths = searchParams.getAll('image_width')
    const imageHeights = searchParams.getAll('image_height')
    const imageSizes = searchParams.getAll('image_size')

    if (imageUrls.length === 0 && imageTypes.length === 0) return []

    const maxLength = Math.max(imageUrls.length, imageTypes.length, imageDelays.length, imageWidths.length, imageHeights.length, imageSizes.length)
    const initialImages: ImageConfig[] = []

    for (let i = 0; i < maxLength; i++) {
      const imageUrl = imageUrls[i] || ''
      const imageType = imageTypes[i] as 'generate' | 'external' || 'generate'
      const imageDelay = parseFloat(imageDelays[i] || '0')
      const imageWidth = imageWidths[i] || ''
      const imageHeight = imageHeights[i] || ''
      const imageSize = imageSizes[i] || ''

      if (!imageUrl && !imageWidth && !imageHeight && !imageSize && imageType !== 'generate') continue

      initialImages.push({
        id: `img-${i}-${Date.now()}`,
        type: imageType,
        url: imageUrl || undefined,
        width: imageWidth || undefined,
        height: imageHeight || undefined,
        size: imageSize || undefined,
        delay: imageDelay
      })
    }
    return initialImages
  })
  const [metaTags, setMetaTags] = useState<MetaTag[]>(() => {
    const metaTagNames = searchParams.getAll('meta_tag_name')
    const metaTagValues = searchParams.getAll('meta_tag_value')
    const siteName = searchParams.get('site_name')

    const urlMetaTags: MetaTag[] = []
    for (let i = 0; i < Math.max(metaTagNames.length, metaTagValues.length); i++) {
      const name = metaTagNames[i] || ''
      const value = metaTagValues[i] || ''
      if (name && value) {
        urlMetaTags.push({
          id: `meta-${i}-${Date.now()}`,
          name,
          value
        })
      }
    }

    if (siteName && !urlMetaTags.some(tag => tag.name === 'og:site_name')) {
      urlMetaTags.push({
        id: 'site-name-compat',
        name: 'og:site_name',
        value: siteName
      })
    }

    return urlMetaTags.length > 0 ? urlMetaTags : [{ id: 'site-name', name: 'og:site_name', value: 'Test Site' }]
  })



  // Update browser URL as form changes
  useEffect(() => {
    const params = new URLSearchParams()

    if (title) params.set('title', title)
    if (description) params.set('description', description)
    if (delay[0] > 0) params.set('delay', delay[0].toString())

    // Add all meta tags as arrays
    metaTags.forEach((tag) => {
      if (tag.name && tag.value) {
        params.append('meta_tag_name', tag.name)
        params.append('meta_tag_value', tag.value)
      }
    })

    // Also add site_name for backward compatibility
    const siteNameTag = metaTags.find(tag => tag.name === 'og:site_name')
    if (siteNameTag?.value) params.set('site_name', siteNameTag.value)

    // Add image parameters using arrays
    images.forEach((image) => {
      if (image.type === 'external' && image.url) {
        params.append('image', image.url)
        params.append('image_type', 'external')
        params.append('image_delay', image.delay.toString())
      } else if (image.type === 'generate') {
        params.append('image', '') // Empty for generated images
        params.append('image_type', 'generate')
        params.append('image_delay', image.delay.toString())

        if (image.size && image.size !== 'custom') {
          params.append('image_size', image.size)
          params.append('image_width', '')
          params.append('image_height', '')
        } else {
          params.append('image_size', '')
          params.append('image_width', image.width || '')
          params.append('image_height', image.height || '')
        }
      }
    })

    // Compare current URL params with new params (order-independent)
    const currentParams = new URLSearchParams(window.location.search)
    const currentParamsObject: { [key: string]: string[] } = {}
    const newParamsObject: { [key: string]: string[] } = {}

    // Build current params object
    for (const [key, value] of currentParams.entries()) {
      if (!currentParamsObject[key]) currentParamsObject[key] = []
      currentParamsObject[key].push(value)
    }

    // Build new params object
    for (const [key, value] of params.entries()) {
      if (!newParamsObject[key]) newParamsObject[key] = []
      newParamsObject[key].push(value)
    }

    // Sort arrays for comparison (order doesn't matter)
    for (const key in currentParamsObject) {
      currentParamsObject[key].sort()
    }
    for (const key in newParamsObject) {
      newParamsObject[key].sort()
    }

    // Check if params have actually changed
    const paramsChanged = JSON.stringify(currentParamsObject) !== JSON.stringify(newParamsObject)

    // Update browser URL only if params changed
    if (paramsChanged) {
      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }

  }, [title, description, delay, images, metaTags])

  // Image management functions
  const addImage = () => {
    const newImage: ImageConfig = {
      id: `img-${Date.now()}`,
      type: 'generate',
      delay: 0
    }
    setImages(prev => [...prev, newImage])
  }

  const updateImage = (id: string, updates: Partial<ImageConfig>) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, ...updates } : img
    ))
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  // Meta tag management functions
  const addMetaTag = () => {
    const newTag: MetaTag = {
      id: `meta-${Date.now()}`,
      name: '',
      value: ''
    }

    setMetaTags(prev => [...prev, newTag])
  }

  const updateMetaTag = (id: string, updates: Partial<MetaTag>) => {

    setMetaTags(prev => prev.map(tag =>
      tag.id === id ? { ...tag, ...updates } : tag
    ))
  }

  const removeMetaTag = (id: string) => {

    setMetaTags(prev => prev.filter(tag => tag.id !== id))
  }

  const getImageUrl = (image: ImageConfig, absolute = false) => {
    const baseUrl = absolute && typeof window !== 'undefined' ? window.location.origin : ''

    if (image.type === 'external' && image.url) {
      if (image.delay > 0) {
        return `${baseUrl}/api/image-proxy?url=${encodeURIComponent(image.url)}&delay=${image.delay * 1000}`
      }
      return absolute ? image.url : image.url
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

  // Helper function to generate the test URL for third-party applications
  const getTestUrl = () => {
    const params = new URLSearchParams()

    if (title) params.set('title', title)
    if (description) params.set('description', description)
    if (delay[0] > 0) params.set('delay', delay[0].toString())

    // Add all meta tags as arrays
    metaTags.forEach((tag) => {
      if (tag.name && tag.value) {
        params.append('meta_tag_name', tag.name)
        params.append('meta_tag_value', tag.value)
      }
    })

    // Also add site_name for backward compatibility
    const siteNameTag = metaTags.find(tag => tag.name === 'og:site_name')
    if (siteNameTag?.value) params.set('site_name', siteNameTag.value)

    // Add image parameters using arrays
    images.forEach((image) => {
      if (image.type === 'external' && image.url) {
        params.append('image', image.url)
        params.append('image_type', 'external')
        params.append('image_delay', image.delay.toString())
      } else if (image.type === 'generate') {
        params.append('image', '') // Empty for generated images
        params.append('image_type', 'generate')
        params.append('image_delay', image.delay.toString())

        if (image.size && image.size !== 'custom') {
          params.append('image_size', image.size)
          params.append('image_width', '')
          params.append('image_height', '')
        } else {
          params.append('image_size', '')
          params.append('image_width', image.width || '')
          params.append('image_height', image.height || '')
        }
      }
    })

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            OG Simulator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate test URLs with dynamic OG tags including images
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

              {/* Images Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Images ({images.length})</Label>
                  <Button onClick={addImage} size="sm" variant="outline">
                    ➕ Add Image
                  </Button>
                </div>

                {images.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed">
                    <p>No images configured</p>
                    <p className="text-sm">Click "Add Image" to get started</p>
                  </div>
                )}

                {images.map((image, index) => (
                  <Card key={image.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Image {index + 1}</CardTitle>
                        <Button
                          onClick={() => removeImage(image.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Image Type Selector */}
                      <div className="space-y-2">
                        <Label className="text-sm">Image Type</Label>
                        <Select
                          value={image.type}
                          onValueChange={(value: 'generate' | 'external') =>
                            updateImage(image.id, {
                              type: value,
                              // Clear type-specific fields when switching
                              ...(value === 'external' ? { width: undefined, height: undefined, size: undefined } : { url: undefined })
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="generate">📷 Generate Placeholder</SelectItem>
                            <SelectItem value="external">🔗 External URL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Generate Mode */}
                      {image.type === 'generate' && (
                        <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="space-y-2">
                            <Label className="text-sm">Size Preset</Label>
                            <Select
                              value={image.size || ''}
                              onValueChange={(value) => updateImage(image.id, { size: value })}
                            >
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

                          {(!image.size || image.size === 'custom') && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label className="text-sm">Width (px)</Label>
                                <Input
                                  value={image.width || ''}
                                  onChange={(e) => updateImage(image.id, { width: e.target.value })}
                                  placeholder="1200"
                                  type="number"
                                  min="100"
                                  max="2000"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">Height (px)</Label>
                                <Input
                                  value={image.height || ''}
                                  onChange={(e) => updateImage(image.id, { height: e.target.value })}
                                  placeholder="630"
                                  type="number"
                                  min="100"
                                  max="2000"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* External URL Mode */}
                      {image.type === 'external' && (
                        <div className="space-y-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="space-y-2">
                            <Label className="text-sm">Image URL</Label>
                            <Input
                              value={image.url || ''}
                              onChange={(e) => updateImage(image.id, { url: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        </div>
                      )}

                      {/* Image Delay */}
                      <div className="space-y-2">
                        <Label className="text-sm">Image Load Delay: {image.delay}s</Label>
                        <Slider
                          value={[image.delay]}
                          onValueChange={([value]) => updateImage(image.id, { delay: value })}
                          max={10}
                          step={0.5}
                          className="w-full"
                        />
                      </div>

                      {/* Image URL Preview */}
                      {getImageUrl(image) && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm text-gray-700 dark:text-gray-300">
                              {image.type === 'external' && image.delay > 0 ? 'Proxy URL:' :
                               image.type === 'external' ? 'Direct URL:' : 'Generated URL:'}
                            </Label>
                            <Button
                              onClick={async () => {
                                const url = getImageUrl(image, true)
                                if (url) {
                                  await navigator.clipboard.writeText(url)
                                  toast.success('Image URL copied!')
                                }
                              }}
                              size="sm"
                              variant="outline"
                            >
                              📋 Copy
                            </Button>
                          </div>
                          <div className="bg-white dark:bg-gray-900 p-2 rounded border text-xs font-mono break-all text-gray-600 dark:text-gray-400 max-h-20 overflow-y-auto">
                            {getImageUrl(image, true)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Meta Tags Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Meta Tags ({metaTags.length})</Label>
                  <Button onClick={addMetaTag} size="sm" variant="outline">
                    ➕ Add Meta Tag
                  </Button>
                </div>

                {metaTags.map((tag) => (
                  <Card key={tag.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Meta Tag</Label>
                          <Button
                            onClick={() => removeMetaTag(tag.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-2">
                            <Label className="text-sm">Tag Name</Label>
                            <Select
                              value={tag.name}
                              onValueChange={(value) => updateMetaTag(tag.id, { name: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select or enter custom tag name" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="og:site_name">og:site_name</SelectItem>
                                <SelectItem value="og:type">og:type</SelectItem>
                                <SelectItem value="og:url">og:url</SelectItem>
                                <SelectItem value="og:locale">og:locale</SelectItem>
                                <SelectItem value="article:author">article:author</SelectItem>
                                <SelectItem value="article:published_time">article:published_time</SelectItem>
                                <SelectItem value="twitter:card">twitter:card</SelectItem>
                                <SelectItem value="twitter:site">twitter:site</SelectItem>
                                <SelectItem value="twitter:creator">twitter:creator</SelectItem>
                                <SelectItem value="custom">Custom Tag Name</SelectItem>
                              </SelectContent>
                            </Select>
                            {tag.name === 'custom' && (
                              <Input
                                value={tag.name}
                                onChange={(e) => updateMetaTag(tag.id, { name: e.target.value })}
                                placeholder="Enter custom tag name (e.g. og:custom)"
                                className="mt-2"
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Tag Value</Label>
                            <Input
                              value={tag.value}
                              onChange={(e) => updateMetaTag(tag.id, { value: e.target.value })}
                              placeholder="Enter tag value"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setTitle('Amazing Product')
                      setDescription('Discover our groundbreaking new product that will transform the way you work, play, and connect. Join thousands of satisfied customers who have already experienced the future.')
                      console.log('setMetaTags', [
                        { id: 'site-name', name: 'og:site_name', value: 'TechCorp' },
                        { id: 'type', name: 'og:type', value: 'website' }
                      ])
                      setMetaTags([
                        { id: 'site-name', name: 'og:site_name', value: 'TechCorp' },
                        { id: 'type', name: 'og:type', value: 'website' }
                      ])
                      setDelay([2])

                      setImages([
                        {
                          id: 'sample-1',
                          type: 'generate',
                          width: '1200',
                          height: '630',
                          size: 'custom',
                          delay: 1
                        },
                        {
                          id: 'sample-2',
                          type: 'external',
                          url: 'https://picsum.photos/800/400',
                          delay: 0.5
                        }
                      ])

                      toast.success('Sample data generated with 2 images!')
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    📄 Generate Sample
                  </Button>
                  <Button
                    onClick={() => {
                      setTitle('')
                      setDescription('')
                      console.log('setMetaTags', [
                        { id: 'site-name', name: 'og:site_name', value: 'Test Site' }
                      ])
                      setMetaTags([
                        { id: 'site-name', name: 'og:site_name', value: 'Test Site' }
                      ])
                      setDelay([0])
                      setImages([])
                      toast.info('Form cleared')
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    🗑️ Clear Form
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Generated Test URL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔗</span>
                  Generated Test URL
                </CardTitle>
                <CardDescription>
                  Use this URL for third-party applications to crawl your OG tags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Test URL:</Label>
                    <Button
                      onClick={async () => {
                        const url = getTestUrl()
                        await navigator.clipboard.writeText(url)
                        toast.success('Test URL copied to clipboard!')
                      }}
                      size="sm"
                      variant="outline"
                    >
                      📋 Copy URL
                    </Button>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-3 rounded border text-sm font-mono break-all text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
                    {getTestUrl()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Third-party applications can crawl this URL to extract the dynamic OG tags generated from your parameters
                  </div>
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
                  How your content will appear when shared (first image)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 space-y-3">
                  {images.length > 0 && getImageUrl(images[0]) && (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageUrl(images[0]) || ''}
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
                      {metaTags.find(tag => tag.name === 'og:site_name')?.value || 'No site name'}
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

            {/* HTML OG Tags Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🏷️</span>
                  HTML OG Tags Preview
                </CardTitle>
                <CardDescription>
                  Raw HTML meta tags that will be generated for your page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
{`<!-- Basic Meta Tags -->
<meta property="og:title" content="${title || 'Test Page Title'}" />
<meta property="og:description" content="${description || 'Test page description for OG tag generation'}" />
${metaTags.map(tag => `<meta property="${tag.name}" content="${tag.value}" />`).join('\n')}

<!-- Image Meta Tags -->
${images.map((image, index) => {
  const imageUrl = getImageUrl(image, true)
  return imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ''
}).filter(Boolean).join('\n')}

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title || 'Test Page Title'}" />
<meta name="twitter:description" content="${description || 'Test page description for OG tag generation'}" />
${images.length > 0 && getImageUrl(images[0], true) ? `<meta name="twitter:image" content="${getImageUrl(images[0], true)}" />` : ''}`}
                  </pre>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={async () => {
                      const metaHtml = `<!-- Basic Meta Tags -->
<meta property="og:title" content="${title || 'Test Page Title'}" />
<meta property="og:description" content="${description || 'Test page description for OG tag generation'}" />
${metaTags.map(tag => `<meta property="${tag.name}" content="${tag.value}" />`).join('\n')}

<!-- Image Meta Tags -->
${images.map((image, index) => {
  const imageUrl = getImageUrl(image, true)
  return imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ''
}).filter(Boolean).join('\n')}

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title || 'Test Page Title'}" />
<meta name="twitter:description" content="${description || 'Test page description for OG tag generation'}" />
${images.length > 0 && getImageUrl(images[0], true) ? `<meta name="twitter:image" content="${getImageUrl(images[0], true)}" />` : ''}`

                      await navigator.clipboard.writeText(metaHtml)
                      toast.success('Meta tags HTML copied to clipboard!')
                    }}
                    size="sm"
                    variant="outline"
                  >
                    📋 Copy HTML
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Images Preview */}
            {images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>🖼️</span>
                    Images Preview ({images.length})
                  </CardTitle>
                  <CardDescription>
                    All configured images with their URLs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {images.map((image, index) => (
                      <div key={image.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            Image {index + 1} - {image.type === 'external' ? '🔗 External' : '📷 Generated'}
                          </Badge>
                          {image.delay > 0 && (
                            <Badge variant="secondary">
                              ⏱️ {image.delay}s delay
                            </Badge>
                          )}
                        </div>
                        {getImageUrl(image) && (
                          <div className="space-y-2">
                            <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                              <img
                                src={getImageUrl(image) || ''}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                  if (nextElement) {
                                    nextElement.style.display = 'flex'
                                  }
                                }}
                              />
                              <div className="hidden w-full h-full bg-gray-200 dark:bg-gray-700 items-center justify-center text-gray-500 text-xs">
                                Loading...
                              </div>
                            </div>
                            <div className="text-xs font-mono text-gray-500 break-all">
                              {getImageUrl(image, true)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
