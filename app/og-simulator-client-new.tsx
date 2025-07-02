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

export default function OGSimulatorClientNew() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [siteName, setSiteName] = useState('')
  const [delay, setDelay] = useState([0])
  const [images, setImages] = useState<ImageConfig[]>([])

  // Initialize from URL params
  useEffect(() => {
    setTitle(searchParams.get('title') || 'Test Page Title')
    setDescription(searchParams.get('description') || 'Test page description for OG tag generation')
    setSiteName(searchParams.get('site_name') || 'Test Site')
    setDelay([parseInt(searchParams.get('delay') || '0')])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            OG Tag Simulator (New Multi-Image Version)
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Generate test URLs with dynamic OG tags and multiple images
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
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setTitle('Amazing Product Launch - Revolutionary Tech for Everyone')
                      setDescription('Discover our groundbreaking new product that will transform the way you work, play, and connect. Join thousands of satisfied customers who have already experienced the future.')
                      setSiteName('TechCorp')
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
                      setSiteName('')
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
          </div>
        </div>
      </div>
    </div>
  )
}
