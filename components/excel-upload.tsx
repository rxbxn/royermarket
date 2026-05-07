'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/client'
import { convertGoogleDriveUrl } from '@/lib/whatsapp'
import { DEFAULT_SELLER } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react'

interface ExcelRow {
  nombre?: string
  descripcion?: string
  precio?: number | string
  cantidad?: number | string
  imagen_url?: string
  vendedor?: string
  telefono?: string | number
}

interface ProcessResult {
  success: number
  errors: string[]
}

export function ExcelUpload() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const downloadTemplate = () => {
    const template = [
      {
        nombre: 'Producto Ejemplo',
        descripcion: 'Descripcion del producto',
        precio: 199.99,
        cantidad: 10,
        imagen_url: 'https://ejemplo.com/imagen.jpg',
      },
    ]
    
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Productos')
    XLSX.writeFile(wb, 'plantilla_productos.xlsx')
  }
  
  const processFile = async (file: File) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setProgress(0)
    
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet)
      
      if (rows.length === 0) {
        throw new Error('El archivo esta vacio')
      }
      
      const supabase = createClient()
      const errors: string[] = []
      let successCount = 0
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 2 // Excel rows start at 1, plus header
        
        setProgress(Math.round(((i + 1) / rows.length) * 100))
        
        // Validate required fields
        if (!row.nombre) {
          errors.push(`Fila ${rowNum}: Falta el nombre del producto`)
          continue
        }
        
        if (!row.precio || isNaN(Number(row.precio)) || Number(row.precio) <= 0) {
          errors.push(`Fila ${rowNum}: Precio invalido`)
          continue
        }
        
        // Prepare data with hardcoded seller info
        const producto = {
          nombre: String(row.nombre).trim(),
          descripcion: row.descripcion ? String(row.descripcion).trim() : null,
          precio: Number(row.precio),
          cantidad: row.cantidad ? Math.max(0, Math.floor(Number(row.cantidad))) : 0,
          imagen_url: row.imagen_url ? convertGoogleDriveUrl(String(row.imagen_url).trim()) : null,
          vendedor: DEFAULT_SELLER.vendedor,
          telefono: DEFAULT_SELLER.telefono,
        }
        
        const { error: insertError } = await supabase
          .from('productos')
          .insert(producto)
        
        if (insertError) {
          errors.push(`Fila ${rowNum}: ${insertError.message}`)
        } else {
          successCount++
        }
      }
      
      setResult({ success: successCount, errors })
      
      if (successCount > 0) {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo')
    } finally {
      setLoading(false)
      setProgress(100)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ]
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
        setError('Tipo de archivo no valido. Use archivos .xlsx o .csv')
        return
      }
      
      processFile(file)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Carga Masiva
        </CardTitle>
        <CardDescription>
          Sube un archivo Excel (.xlsx) o CSV con multiples productos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" onClick={downloadTemplate} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Descargar Plantilla Excel
        </Button>
        
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="excel-upload"
            disabled={loading}
          />
          <label
            htmlFor="excel-upload"
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
              loading ? 'cursor-not-allowed opacity-50' : 'hover:border-primary hover:bg-muted/50'
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {loading ? 'Procesando...' : 'Click para seleccionar archivo o arrastra aqui'}
            </span>
            <span className="text-xs text-muted-foreground">
              Formatos: .xlsx, .csv
            </span>
          </label>
        </div>
        
        {loading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-center text-sm text-muted-foreground">
              Procesando... {progress}%
            </p>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <div className="space-y-2">
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {result.success} producto(s) importado(s) correctamente
              </AlertDescription>
            </Alert>
            
            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">{result.errors.length} error(es):</p>
                  <ul className="mt-1 max-h-32 list-inside list-disc overflow-auto text-sm">
                    {result.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium">Estructura esperada del archivo:</p>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="p-1 text-left">nombre</th>
                  <th className="p-1 text-left">descripcion</th>
                  <th className="p-1 text-left">precio</th>
                  <th className="p-1 text-left">cantidad</th>
                  <th className="p-1 text-left">imagen_url</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-muted-foreground">
                  <td className="p-1">Texto *</td>
                  <td className="p-1">Texto</td>
                  <td className="p-1">Numero *</td>
                  <td className="p-1">Numero</td>
                  <td className="p-1">URL</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">* Campos obligatorios</p>
        </div>
      </CardContent>
    </Card>
  )
}
