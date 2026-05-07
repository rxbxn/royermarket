'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface SearchFiltersProps {
  onSearch: (query: string) => void
  onSort: (sort: string) => void
  onPriceFilter: (min: number | null, max: number | null) => void
}

export function SearchFilters({ onSearch, onSort, onPriceFilter }: SearchFiltersProps) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  
  const handleSearch = (value: string) => {
    setQuery(value)
    onSearch(value)
  }
  
  const handlePriceFilter = () => {
    onPriceFilter(
      minPrice ? Number(minPrice) : null,
      maxPrice ? Number(maxPrice) : null
    )
  }
  
  const clearFilters = () => {
    setQuery('')
    setMinPrice('')
    setMaxPrice('')
    onSearch('')
    onPriceFilter(null, null)
    onSort('newest')
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select defaultValue="newest" onValueChange={onSort}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mas recientes</SelectItem>
              <SelectItem value="oldest">Mas antiguos</SelectItem>
              <SelectItem value="price_asc">Precio: menor</SelectItem>
              <SelectItem value="price_desc">Precio: mayor</SelectItem>
              <SelectItem value="name_asc">Nombre: A-Z</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary text-primary-foreground' : ''}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Precio minimo</label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-32"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Precio maximo</label>
            <Input
              type="number"
              min="0"
              placeholder="Sin limite"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-32"
            />
          </div>
          
          <Button onClick={handlePriceFilter}>
            Aplicar
          </Button>
          
          <Button variant="ghost" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      )}
    </div>
  )
}
