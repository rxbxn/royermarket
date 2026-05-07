'use client'

import { Producto } from '@/types/producto'
import { ProductCard } from './product-card'

interface ProductGridProps {
  productos: Producto[]
}

export function ProductGrid({ productos }: ProductGridProps) {
  if (productos.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No hay productos disponibles
        </p>
        <p className="text-sm text-muted-foreground">
          Los productos aparecerán aquí una vez que se agreguen
        </p>
      </div>
    )
  }
  
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  )
}
