export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  cantidad: number
  imagen_url: string | null
  vendedor: string
  telefono: string
  created_at: string
}

export interface ProductoInput {
  nombre: string
  descripcion?: string
  precio: number
  cantidad: number
  imagen_url?: string
  vendedor: string
  telefono: string
}
