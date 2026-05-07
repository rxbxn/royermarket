'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Producto, ProductoInput } from '@/types/producto'
import { createClient } from '@/lib/supabase/client'
import { convertGoogleDriveUrl } from '@/lib/whatsapp'
import { DEFAULT_SELLER } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Package, Search, Pencil, Loader2, AlertCircle } from 'lucide-react'

interface AdminProductListProps {
  initialProducts: Producto[]
}

export function AdminProductList({ initialProducts }: AdminProductListProps) {
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  // Edit state
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [editForm, setEditForm] = useState<ProductoInput | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Estado para preview de imagen
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  useEffect(() => {
    setProductos(initialProducts)
  }, [initialProducts])
  
  const filteredProducts = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.vendedor.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const handleDelete = async (id: string) => {
    setDeleting(id)
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setProductos(prev => prev.filter(p => p.id !== id))
      router.refresh()
    } catch (err) {
      console.error('Error deleting product:', err)
    } finally {
      setDeleting(null)
    }
  }
  
  const openEditDialog = (producto: Producto) => {
    setEditingProduct(producto)
    setEditForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      cantidad: producto.cantidad,
      imagen_url: producto.imagen_url || '',
      vendedor: DEFAULT_SELLER.vendedor,
      telefono: DEFAULT_SELLER.telefono,
    })
    setEditError(null)
  }
  
  const closeEditDialog = () => {
    setEditingProduct(null)
    setEditForm(null)
    setEditError(null)
  }
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editForm) return
    const { name, value } = e.target
    setEditForm(prev => prev ? ({
      ...prev,
      [name]: name === 'precio' || name === 'cantidad' ? Number(value) || 0 : value,
    }) : null)
  }
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct || !editForm) return
    
    setEditLoading(true)
    setEditError(null)
    
    // Validations
    if (!editForm.nombre.trim()) {
      setEditError('El nombre del producto es obligatorio')
      setEditLoading(false)
      return
    }
    
    if (editForm.precio <= 0) {
      setEditError('El precio debe ser mayor a 0')
      setEditLoading(false)
      return
    }
    
    try {
      const supabase = createClient()
      
      const dataToUpdate = {
        nombre: editForm.nombre,
        descripcion: editForm.descripcion || null,
        precio: editForm.precio,
        cantidad: editForm.cantidad,
        imagen_url: editForm.imagen_url ? convertGoogleDriveUrl(editForm.imagen_url) : null,
        vendedor: DEFAULT_SELLER.vendedor,
        telefono: DEFAULT_SELLER.telefono,
      }
      
      const { error: updateError } = await supabase
        .from('productos')
        .update(dataToUpdate)
        .eq('id', editingProduct.id)
      
      if (updateError) throw updateError
      
      // Update local state
      setProductos(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...dataToUpdate }
          : p
      ))
      
      closeEditDialog()
      router.refresh()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al actualizar el producto')
    } finally {
      setEditLoading(false)
    }
  }
  
  if (productos.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            No hay productos registrados
          </p>
          <p className="text-sm text-muted-foreground">
            Agrega productos usando el formulario o la carga masiva
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o vendedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-muted cursor-pointer group" onClick={() => producto.imagen_url && setPreviewImage(convertGoogleDriveUrl(producto.imagen_url))}>
                        {producto.imagen_url ? (
                          <Image
                            src={convertGoogleDriveUrl(producto.imagen_url)}
                            alt={producto.nombre}
                            fill
                            className="object-cover group-hover:opacity-80"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                          {/* Modal de preview de imagen */}
                          <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                            <DialogContent className="max-w-xl flex flex-col items-center">
                              <DialogHeader>
                                <DialogTitle>Vista previa de imagen</DialogTitle>
                              </DialogHeader>
                              {previewImage && (
                                <div className="w-full flex justify-center">
                                  <Image
                                    src={previewImage}
                                    alt="Vista previa"
                                    width={400}
                                    height={400}
                                    className="rounded-lg object-contain bg-muted"
                                    style={{ maxHeight: 400, maxWidth: '100%' }}
                                  />
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                    <TableCell>
                      <div>
                        <p className="font-medium">{producto.nombre}</p>
                        {producto.descripcion && (
                          <p className="line-clamp-1 text-sm text-muted-foreground">
                            {producto.descripcion}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{producto.vendedor}</p>
                        <p className="text-sm text-muted-foreground">{producto.telefono}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${producto.precio.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={producto.cantidad === 0 ? 'text-destructive' : ''}>
                        {producto.cantidad}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(producto)}
                          className="text-primary hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              disabled={deleting === producto.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
                              <AlertDialogDescription>
                                Estas seguro de eliminar &quot;{producto.nombre}&quot;? Esta accion no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(producto.id)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Mostrando {filteredProducts.length} de {productos.length} producto(s)
          </p>
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica los datos del producto y guarda los cambios
            </DialogDescription>
          </DialogHeader>
          
          {editForm && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre del producto *</Label>
                <Input
                  id="edit-nombre"
                  name="nombre"
                  value={editForm.nombre}
                  onChange={handleEditChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-descripcion">Descripcion</Label>
                <Textarea
                  id="edit-descripcion"
                  name="descripcion"
                  value={editForm.descripcion}
                  onChange={handleEditChange}
                  rows={3}
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-precio">Precio *</Label>
                  <Input
                    id="edit-precio"
                    name="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.precio || ''}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-cantidad">Cantidad *</Label>
                  <Input
                    id="edit-cantidad"
                    name="cantidad"
                    type="number"
                    min="0"
                    value={editForm.cantidad}
                    onChange={handleEditChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-imagen_url">URL de imagen</Label>
                <Input
                  id="edit-imagen_url"
                  name="imagen_url"
                  type="url"
                  value={editForm.imagen_url}
                  onChange={handleEditChange}
                  placeholder="https://... o link de Google Drive"
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeEditDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
