'use client'

import { useState, useEffect, useMemo } from 'react'
import { Producto } from '@/types/producto'
import { createClient } from '@/lib/supabase/client'
import { ProductGrid } from '@/components/product-grid'
import { SearchFilters } from '@/components/search-filters'
import { Loader2 } from 'lucide-react'

export function ProductCatalog({ initialProducts }: { initialProducts: Producto[] }) {
  const [productos, setProductos] = useState<Producto[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  })
  
  // Update productos when initialProducts changes (after router.refresh())
  useEffect(() => {
    setProductos(initialProducts)
  }, [initialProducts])
  
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...productos]
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        p =>
          p.nombre.toLowerCase().includes(query) ||
          p.descripcion?.toLowerCase().includes(query) ||
          p.vendedor.toLowerCase().includes(query)
      )
    }
    
    // Price filter
    if (priceRange.min !== null) {
      result = result.filter(p => p.precio >= priceRange.min!)
    }
    if (priceRange.max !== null) {
      result = result.filter(p => p.precio <= priceRange.max!)
    }
    
    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'price_asc':
        result.sort((a, b) => a.precio - b.precio)
        break
      case 'price_desc':
        result.sort((a, b) => b.precio - a.precio)
        break
      case 'name_asc':
        result.sort((a, b) => a.nombre.localeCompare(b.nombre))
        break
    }
    
    return result
  }, [productos, searchQuery, sortBy, priceRange])
  
  return (
    <div className="space-y-6">
      <SearchFilters
        onSearch={setSearchQuery}
        onSort={setSortBy}
        onPriceFilter={(min, max) => setPriceRange({ min, max })}
      />
      
      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedProducts.length} producto(s) encontrado(s)
            </p>
          </div>
          <ProductGrid productos={filteredAndSortedProducts} />
        </>
      )}
    </div>
  )
}
