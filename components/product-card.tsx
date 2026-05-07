'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Producto } from '@/types/producto'
import { generateWhatsAppLink, convertGoogleDriveUrl } from '@/lib/whatsapp'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Package } from 'lucide-react'

interface ProductCardProps {
  producto: Producto
}

export function ProductCard({ producto }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  
  const handleWhatsAppClick = () => {
    const link = generateWhatsAppLink(producto)
    window.open(link, '_blank')
  }
  
  const isOutOfStock = producto.cantidad === 0
  
  return (
    <Card className="group flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {producto.imagen_url && !imageError ? (
          <Image
            src={convertGoogleDriveUrl(producto.imagen_url)}
            alt={producto.nombre}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Badge variant="secondary" className="text-sm">
              Agotado
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold leading-tight text-foreground">
            {producto.nombre}
          </h3>
        </div>
        
        <p className="text-2xl font-bold text-primary">
          ${producto.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
        
        {producto.descripcion && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {producto.descripcion}
          </p>
        )}
        
        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span>Vendedor: {producto.vendedor}</span>
          {!isOutOfStock && (
            <>
              <span>•</span>
              <span>{producto.cantidad} disponibles</span>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleWhatsAppClick}
          disabled={isOutOfStock}
          className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A]"
        >
          <MessageCircle className="h-4 w-4" />
          Contactar por WhatsApp
        </Button>
      </CardFooter>
    </Card>
  )
}
