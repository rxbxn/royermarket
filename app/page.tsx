import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { ProductCatalog } from '@/components/product-catalog'
import { Producto } from '@/types/producto'

export const revalidate = 0

async function getProductos(): Promise<Producto[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching productos:', error)
    return []
  }
  
  return data || []
}

export default async function HomePage() {
  const productos = await getProductos()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Catalogo de Productos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explora nuestra seleccion y contacta directamente por WhatsApp
          </p>
        </div>
        
        <ProductCatalog initialProducts={productos} />
      </main>
      
      <footer className="border-t bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Star Response Marketplace</p>
        </div>
      </footer>
    </div>
  )
}
