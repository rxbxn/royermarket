import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAuthenticated } from '@/lib/auth'
import { AdminDashboard } from '@/components/admin-dashboard'
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

export default async function AdminPage() {
  const authenticated = await isAuthenticated()
  
  if (!authenticated) {
    redirect('/admin/login')
  }
  
  const productos = await getProductos()
  
  return <AdminDashboard initialProducts={productos} />
}
