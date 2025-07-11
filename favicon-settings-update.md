# Favicon Settings Update for OG Simulator

## Overview
I've successfully added favicon settings to the OG Simulator, allowing users to specify which OG tags each image should be used for, including favicon options. This replaces the previous hardcoded behavior where the first image automatically became both `og:image` and `twitter:image`.

## What's New

### 1. **Multiselect OG Tags for Each Image**
Each image now has a **"OG Tags"** section with checkboxes for:
- `og:image` - Open Graph image
- `twitter:image` - Twitter card image 
- `favicon` - Standard favicon
- `icon` - Generic icon (same as favicon)
- `apple-touch-icon` - Apple touch icon for iOS devices
- `none` - No tags (image won't appear in any meta tags)

### 2. **Smart Defaults**
- **First image**: Automatically defaults to `og:image` and `twitter:image`
- **Subsequent images**: Default to no tags (empty array)
- **New images**: Default to no tags

### 3. **Dynamic HTML Generation**
The HTML preview now generates different meta tags based on the selected options:

```html
<!-- For og:image -->
<meta property="og:image" content="[image-url]" />

<!-- For twitter:image -->
<meta name="twitter:image" content="[image-url]" />

<!-- For favicon -->
<link rel="icon" type="image/png" href="[image-url]" />

<!-- For icon -->
<link rel="icon" type="image/png" href="[image-url]" />

<!-- For apple-touch-icon -->
<link rel="apple-touch-icon" href="[image-url]" />
```

### 4. **Updated Preview Logic**
- **Social Media Preview**: Now shows the first image with `og:image` or `twitter:image` tags instead of always showing the first image
- **Image Cards**: Display badge counts showing how many tags are selected
- **Tag Indicators**: Visual badges showing which tags are assigned to each image

## How to Use

### Adding a Favicon
1. **Add a new image** (or use an existing one)
2. **Configure the image** (generate or external URL)
3. **Set appropriate dimensions** for favicon (e.g., 32x32, 16x16, 48x48)
4. **Check the "favicon" checkbox** in the OG Tags section
5. **Optionally add other icon types** like `apple-touch-icon`

### Example Configuration
```
Image 1: og:image, twitter:image (1200x630)
Image 2: favicon, icon (32x32)
Image 3: apple-touch-icon (180x180)
Image 4: none (unused image)
```

## Technical Implementation

### Interface Changes
```typescript
interface ImageConfig {
  id: string
  type: 'generate' | 'external'
  url?: string
  width?: string
  height?: string
  size?: string
  delay: number
  tags: string[]  // NEW: Array of tag names
}
```

### Key Features
- **Multiple tags per image**: One image can serve multiple purposes
- **Flexible assignment**: Any image can be assigned any combination of tags
- **Backward compatibility**: Existing URLs continue to work with smart defaults
- **Live preview**: Changes immediately reflect in the HTML preview

## Benefits

1. **🎯 Precise Control**: Specify exactly which OG tags each image should be used for
2. **📱 Mobile Optimized**: Support for Apple touch icons and different favicon sizes
3. **🔄 Flexible**: One image can serve multiple purposes or be unused
4. **👁️ Visual Feedback**: Clear indication of which tags are assigned to each image
5. **🌐 SEO Friendly**: Proper favicon implementation improves site appearance in browsers

## Uses the Existing Infrastructure
- **Same image generation API**: `/api/generate-image` with width/height parameters
- **Same image proxy API**: `/api/image-proxy` for external images with delays
- **No new routes needed**: Everything works with existing endpoints

## Real-World Example

A typical configuration might look like:
```
Image 1: og:image, twitter:image (1200x630 - social sharing)
Image 2: favicon, icon (32x32 - browser favicon)
Image 3: apple-touch-icon (180x180 - iOS home screen)
Image 4: none (backup image, not used in meta tags)
```

This gives you complete control over how your images appear across different platforms and contexts while using the same dynamic image generation system.