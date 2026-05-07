import { Producto } from '@/types/producto'

export function generateWhatsAppLink(producto: Producto, talla?: string): string {
  // Clean phone number - remove spaces, dashes, and ensure it starts with country code
  const cleanPhone = producto.telefono.replace(/[\s\-\(\)]/g, '')
  
  // Build message
  const lines = [
    'Hola, estoy interesado en el producto:',
    '',
    `*Referencia:* ${producto.id}`,
    `*Nombre:* ${producto.nombre}`,
    `*Precio:* $${producto.precio.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`,
  ]
  
  if (talla) {
    lines.push(`*Talla:* ${talla}`)
  }
  
  if (producto.descripcion) {
    lines.push(`*Descripción:* ${producto.descripcion}`)
  }
  
  if (producto.imagen_url) {
    lines.push(`*Imagen:* ${convertGoogleDriveUrl(producto.imagen_url)}`)
  }
  
  const message = lines.join('\n')
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function convertGoogleDriveUrl(url: string): string {
  // Convert Google Drive sharing links to direct access URLs
  // Input formats:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/open?id=FILE_ID
  // Output: https://lh3.googleusercontent.com/d/FILE_ID (more reliable for images)
  
  const driveRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  const openRegex = /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
  
  let fileId: string | null = null
  
  const match = url.match(driveRegex)
  if (match && match[1]) {
    fileId = match[1]
  }
  
  if (!fileId) {
    const openMatch = url.match(openRegex)
    if (openMatch && openMatch[1]) {
      fileId = openMatch[1]
    }
  }
  
  if (fileId) {
    // Use lh3.googleusercontent.com which is more reliable for embedding
    return `https://lh3.googleusercontent.com/d/${fileId}`
  }
  
  // If it's already a direct link or not a Google Drive link, return as is
  return url
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // If it doesn't start with + or country code, assume it's a Colombian number
  if (!cleaned.startsWith('+') && !cleaned.startsWith('57')) {
    return `57${cleaned}`
  }
  
  // Remove + if present
  return cleaned.replace('+', '')
}

export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[^\d]/g, '')
  // Phone should have at least 10 digits (without country code) or 12+ with country code
  return cleaned.length >= 10
}
