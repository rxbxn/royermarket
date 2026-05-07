'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Producto } from '@/types/producto'
import { ProductForm } from '@/components/product-form'
import { ExcelUpload } from '@/components/excel-upload'
import { AdminProductList } from '@/components/admin-product-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Store, LogOut } from 'lucide-react'

interface AdminDashboardProps {
  initialProducts: Producto[]
}

export function AdminDashboard({ initialProducts }: AdminDashboardProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Star Response</span>
            <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Admin
            </span>
          </Link>
          
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Panel de Administracion
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona tus productos: agrega, edita o elimina
          </p>
        </div>
        
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="list">Productos ({initialProducts.length})</TabsTrigger>
            <TabsTrigger value="add">Agregar</TabsTrigger>
            <TabsTrigger value="bulk">Carga Masiva</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4">
            <AdminProductList initialProducts={initialProducts} />
          </TabsContent>
          
          <TabsContent value="add" className="space-y-4">
            <ProductForm />
          </TabsContent>
          
          <TabsContent value="bulk" className="space-y-4">
            <ExcelUpload />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
