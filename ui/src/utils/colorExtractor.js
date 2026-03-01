/**
 * Extracts the dominant color from an image URL using a downsampled canvas.
 * Returns a promise resolving to an { r, g, b } object.
 */
export const extractDominantColor = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const size = 10
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, size, size)

        const data = ctx.getImageData(0, 0, size, size).data
        let r = 0,
          g = 0,
          b = 0,
          count = 0

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3]
          if (alpha < 128) continue
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          count++
        }

        if (count === 0) {
          resolve(null)
          return
        }

        resolve({
          r: Math.round(r / count),
          g: Math.round(g / count),
          b: Math.round(b / count),
        })
      } catch (e) {
        resolve(null)
      }
    }

    img.onerror = () => resolve(null)
    img.src = imageUrl
  })
}

export const colorToGradient = (color, opacity = 0.3) => {
  if (!color) return 'none'
  const { r, g, b } = color
  return `linear-gradient(to bottom, rgba(${r},${g},${b},${opacity}) 0%, transparent 100%)`
}
