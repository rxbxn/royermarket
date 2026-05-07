'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Producto } from '@/types/producto'
import { generateWhatsAppLink, convertGoogleDriveUrl } from '@/lib/whatsapp'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { MessageCircle, Package } from 'lucide-react'

interface ProductCardProps {
  producto: Producto
}

const SANDALIA_TALLAS = Array.from({ length: 18 }, (_, i) => (28 + i).toString())

export function ProductCard({ producto }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')

  const isOutOfStock = producto.cantidad === 0
  const canContact = !isOutOfStock && Boolean(selectedSize)

  const handleWhatsAppClick = () => {
    if (!canContact) return

    const link = generateWhatsAppLink(producto, selectedSize)
    window.open(link, '_blank')
  }
  
  return (
    <Card className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-white text-slate-950 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.2)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)] dark:bg-slate-950 dark:text-white">
      <div className="relative aspect-square overflow-hidden bg-muted transition-all duration-300 group-hover:scale-[1.01]">
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
          <p className="line-clamp-2 text-sm text-slate-700 dark:text-slate-300">
            {producto.descripcion}
          </p>
        )}
        
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Vendedor: {producto.vendedor}</span>
            {!isOutOfStock && (
              <>
                <span>•</span>
                <span>{producto.cantidad} disponibles</span>
              </>
            )}
          </div>

          <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Label htmlFor={`size-select-${producto.id}`} className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">
              Selecciona tu talla
            </Label>
            <Select
              value={selectedSize}
              onValueChange={setSelectedSize}
            >
              <SelectTrigger id={`size-select-${producto.id}`} className="w-full rounded-2xl border border-slate-300 bg-white text-slate-900 shadow-sm transition duration-200 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" size="sm">
                <SelectValue placeholder="Talla" />
              </SelectTrigger>
              <SelectContent>
                {SANDALIA_TALLAS.map((talla) => (
                  <SelectItem key={talla} value={talla}>
                    {talla}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedSize && (
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Selecciona una talla para contactar por WhatsApp
              </p>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleWhatsAppClick}
          disabled={!canContact}
          className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A]"
        >
          <MessageCircle className="h-4 w-4" />
          Contactar por WhatsApp
        </Button>
      </CardFooter>
    </Card>
  )
}
