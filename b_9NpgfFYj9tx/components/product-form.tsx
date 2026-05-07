'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProductoInput } from '@/types/producto'
import { createClient } from '@/lib/supabase/client'
import { convertGoogleDriveUrl } from '@/lib/whatsapp'
import { DEFAULT_SELLER } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export function ProductForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Omit<ProductoInput, 'vendedor' | 'telefono'>>({
    nombre: '',
    descripcion: '',
    precio: 0,
    cantidad: 1,
    imagen_url: '',
  })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' || name === 'cantidad' ? Number(value) || 0 : value,
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    // Validations
    if (!formData.nombre.trim()) {
      setError('El nombre del producto es obligatorio')
      setLoading(false)
      return
    }
    
    if (formData.precio <= 0) {
      setError('El precio debe ser mayor a 0')
      setLoading(false)
      return
    }
    
    try {
      const supabase = createClient()
      
      // Prepare data with hardcoded seller info
      const dataToInsert = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        precio: formData.precio,
        cantidad: formData.cantidad,
        imagen_url: formData.imagen_url ? convertGoogleDriveUrl(formData.imagen_url) : null,
        vendedor: DEFAULT_SELLER.vendedor,
        telefono: DEFAULT_SELLER.telefono,
      }
      
      const { error: insertError } = await supabase
        .from('productos')
        .insert(dataToInsert)
      
      if (insertError) throw insertError
      
      setSuccess(true)
      setFormData({
        nombre: '',
        descripcion: '',
        precio: 0,
        cantidad: 1,
        imagen_url: '',
      })
      
      // Refresh the page to show new product
      router.refresh()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Producto</CardTitle>
        <CardDescription>
          Completa el formulario para agregar un nuevo producto al marketplace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Producto agregado correctamente</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del producto *</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Smartphone Samsung Galaxy"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="precio">Precio *</Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio || ''}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripcion</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe tu producto..."
              rows={3}
            />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad disponible *</Label>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                min="0"
                value={formData.cantidad}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imagen_url">URL de imagen</Label>
              <Input
                id="imagen_url"
                name="imagen_url"
                type="url"
                value={formData.imagen_url}
                onChange={handleChange}
                placeholder="https://... o link de Google Drive"
              />
            </div>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Agregar Producto'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
