'use client'

import { useState, useRef } from 'react'
import { useLocale } from '@/lib/i18n/locale-provider'
import { createClient } from '@/lib/supabase/client'
import { Upload, Download, AlertCircle, CheckCircle, Loader2, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import * as XLSX from 'xlsx'

const supabase = createClient()

interface ImportRow {
  sku: string
  name_th: string
  name_en: string
  description_th?: string
  description_en?: string
  price: number
  compare_price?: number
  stock?: number
  category_slug?: string
  make_name?: string
  model_name?: string
  year_start?: number
  year_end?: number
  engine?: string
  image_urls?: string
}

interface ImportResult {
  success: number
  errors: string[]
  skipped: number
}

export default function AdminImportPage() {
  const { locale } = useLocale()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [lookupData, setLookupData] = useState<{ [key: string]: any }>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const detectDelimiter = (text: string): string => {
    const firstLine = text.split('\n')[0]
    const commaCount = (firstLine.match(/,/g) || []).length
    const tabCount = (firstLine.match(/\t/g) || []).length
    return tabCount > commaCount ? '\t' : ','
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)

    const ext = f.name.split('.').pop()?.toLowerCase()
    let rows: ImportRow[] = []

    if (ext === 'csv') {
      const text = await f.text()
      const delim = detectDelimiter(text)
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { alert('Empty file'); return }
      const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ''))
      rows = lines.slice(1).map(line => {
        const vals = line.split(delim).map(v => v.trim().replace(/^"|"$/g, ''))
        const row: any = {}
        headers.forEach((h, i) => {
          const val = vals[i]
          if (h === 'price' || h === 'compare_price' || h === 'stock' || h === 'year_start' || h === 'year_end') {
            row[h] = val ? Number(val) : undefined
          } else {
            row[h] = val || ''
          }
        })
        return row as ImportRow
      })
    } else {
      // Excel file
      const data = await f.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(sheet) as ImportRow[]
    }

    // Load lookup data
    const [makes, cats] = await Promise.all([
      supabase.from('makes').select('id, name_en, name_th'),
      supabase.from('categories').select('id, name_en, slug'),
      supabase.from('models').select('id, name, make_id'),
    ])

    setPreview(rows.slice(0, 20))
    setResult(null)

    // Store for actual import
    setLookupData({ rows, makes: makes.data || [], cats: cats.data || [] })
  }

  const downloadTemplate = () => {
    const headers = [
      'sku', 'name_th', 'name_en', 'description_th', 'description_en',
      'price', 'compare_price', 'stock', 'category_slug',
      'make_name', 'model_name', 'year_start', 'year_end', 'engine', 'image_urls'
    ]

    const exampleRow = {
      sku: 'BRK-001',
      name_th: 'ผ้าเบรกหน้า FORD RANGER',
      name_en: 'Front Brake Pads FORD RANGER',
      description_th: 'ผ้าเบรกคุณภาพสูง สำหรับ FORD RANGER',
      description_en: 'High quality brake pads for FORD RANGER',
      price: 1200,
      compare_price: 1500,
      stock: 50,
      category_slug: 'brakes',
      make_name: 'FORD',
      model_name: 'RANGER',
      year_start: 2015,
      year_end: 2022,
      engine: '2.2L',
      image_urls: ''
    }

    const ws = XLSX.utils.json_to_sheet([exampleRow], { header: headers })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')

    // Add second sheet with instructions
    const instructions: (string | undefined)[][] = [
      ['FIELD', 'REQUIRED', 'DESCRIPTION'],
      ['sku', 'YES', 'รหัสสินค้า / Product SKU (unique)'],
      ['name_th', 'YES', 'ชื่อสินค้าภาษาไทย'],
      ['name_en', 'YES', 'ชื่อสินค้าภาษาอังกฤษ'],
      ['description_th', '', 'รายละเอียดภาษาไทย'],
      ['description_en', '', 'รายละเอียดภาษาอังกฤษ'],
      ['price', 'YES', 'ราคาขาย (ตัวเลขเท่านั้น)'],
      ['compare_price', '', 'ราคาเปรียบเทียบ/ราคาเดิม'],
      ['stock', '', 'จำนวนสต็อก (default: 0)'],
      ['category_slug', '', 'slug ของหมวดหมู่ (brakes, engine ฯลฯ)'],
      ['make_name', '', 'ยี่ห้อรถ (TOYOTA, HONDA, ฯลฯ)'],
      ['model_name', '', 'รุ่นรถ (RANGER, CIVIC, ฯลฯ)'],
      ['year_start', '', 'ปีเริ่มต้นที่ใช้ได้'],
      ['year_end', '', 'ปีสิ้นสุด (เว้นว่างถ้ายังผลิต)'],
      ['engine', '', 'เครื่องยนต์ (2.2L, 1.5L Turbo, ฯลฯ)'],
      ['image_urls', '', 'URL รูปภาพ (คั่นด้วย | ถ้ามีหลายรูป)'],
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(instructions)
    ws2['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 60 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Instructions')

    XLSX.writeFile(wb, 'ccrauto-import-template.xlsx')
  }

  const runImport = async () => {
    if (!lookupData.rows) return
    setImporting(true)
    setResult(null)

    const rows = lookupData.rows as ImportRow[]
    const makes = lookupData.makes as any[]
    const cats = lookupData.cats as any[]
    const results: ImportResult = { success: 0, errors: [], skipped: 0 }
    const batchSize = 50

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      const productInserts: any[] = []
      const fitmentInserts: any[] = []

      for (const row of batch) {
        if (!row.sku || !row.name_th || !row.name_en || !row.price) {
          results.skipped++
          continue
        }

        // Resolve category
        let catId = null
        if (row.category_slug) {
          const cat = cats.find((c: any) =>
            c.slug?.toLowerCase() === row.category_slug?.toLowerCase()
          )
          if (cat) catId = cat.id
        }

        // Parse image URLs
        const images = row.image_urls ? row.image_urls.split('|').map(u => u.trim()).filter(Boolean) : []

        productInserts.push({
          sku: row.sku,
          name_th: row.name_th,
          name_en: row.name_en,
          description_th: row.description_th || '',
          description_en: row.description_en || '',
          price: Number(row.price),
          compare_price: row.compare_price ? Number(row.compare_price) : null,
          stock: row.stock || 0,
          category_id: catId,
          images,
          is_active: true,
        })

        // Fitment
        if (row.make_name) {
          const make = makes.find((m: any) =>
            m.name_en?.toUpperCase() === row.make_name?.toUpperCase()
          )
          if (make) {
            fitmentInserts.push({
              sku: row.sku,
              make_id: make.id,
              model_name: row.model_name || '',
              year_start: row.year_start || 2000,
              year_end: row.year_end || null,
              engine: row.engine || null,
            })
          }
        }
      }

      if (productInserts.length > 0) {
        // Upsert products in batch
        const { error } = await supabase.from('products').upsert(productInserts, {
          onConflict: 'sku',
          ignoreDuplicates: false,
        })

        if (error) {
          results.errors.push(`Batch ${i / batchSize + 1}: ${error.message}`)
        } else {
          results.success += productInserts.length
        }

        // Handle fitments - get product IDs
        if (fitmentInserts.length > 0) {
          const skus = [...new Set(fitmentInserts.map(f => f.sku))]
          const { data: prods } = await supabase
            .from('products')
            .select('id, sku')
            .in('sku', skus)

          const prodMap = new Map(prods?.map(p => [p.sku, p.id]) || [])

          const finalFitments = fitmentInserts
            .filter(f => prodMap.has(f.sku))
            .map(f => ({
              product_id: prodMap.get(f.sku),
              make_id: f.make_id,
              model_id: f.model_name, // Will be resolved later or left as model_name for matching
              year_start: f.year_start,
              year_end: f.year_end,
              engine: f.engine,
            }))

          // Try to resolve model_id
          for (const fit of finalFitments) {
            if (typeof fit.model_id === 'string' && fit.model_id) {
              const { data: model } = await supabase
                .from('models')
                .select('id')
                .eq('make_id', fit.make_id)
                .eq('name', fit.model_id)
                .maybeSingle()
              fit.model_id = model?.id || fit.make_id // fallback to make_id
            }
          }

          const { error: fitError } = await supabase
            .from('product_fitments')
            .insert(finalFitments.map(({ ...f }) => f))

          if (fitError) {
            results.errors.push(`Fitment error: ${fitError.message}`)
          }
        }
      }
    }

    setResult(results)
    setImporting(false)
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {locale === 'th' ? 'นำเข้าข้อมูลจาก Excel/CSV' : 'Import from Excel/CSV'}
        </h2>
        <div className="flex gap-3">
          <Link
            href="/th/admin/products"
            className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            {locale === 'th' ? 'กลับ' : 'Back'}
          </Link>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            <Download size={16} />
            {locale === 'th' ? 'ดาวน์โหลด Template' : 'Download Template'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <p className="font-medium mb-1">
          {locale === 'th'
            ? 'วิธีใช้งาน:'
            : 'How to use:'}
        </p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>{locale === 'th' ? 'ดาวน์โหลดไฟล์ Template ด้านบน' : 'Download the template above'}</li>
          <li>{locale === 'th' ? 'กรอกข้อมูลสินค้าของคุณลงในไฟล์' : 'Fill in your product data'}</li>
          <li>{locale === 'th' ? 'อัปโหลดไฟล์ (รองรับ .xlsx, .xls, .csv)' : 'Upload the file (.xlsx, .xls, .csv)'}</li>
          <li>{locale === 'th' ? 'ตรวจสอบตัวอย่าง แล้วกด "นำเข้า"' : 'Review preview and click "Import"'}</li>
        </ol>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border p-8 text-center mb-6">
        <input
          type="file"
          ref={fileRef}
          accept=".xlsx,.xls,.csv"
          onChange={handleFile}
          className="hidden"
        />
        {!file ? (
          <div>
            <FileSpreadsheet size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-3">
              {locale === 'th' ? 'ลากไฟล์มาวางหรือคลิกเพื่อเลือก' : 'Drag & drop or click to select'}
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {locale === 'th' ? 'เลือกไฟล์' : 'Select File'}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle size={20} className="text-green-500" />
              <span className="font-medium text-gray-700">{file.name}</span>
              <span className="text-gray-400 text-sm">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              onClick={() => { setFile(null); setPreview([]); setResult(null); setLookupData({}) }}
              className="text-sm text-red-500 hover:underline"
            >
              {locale === 'th' ? 'เปลี่ยนไฟล์' : 'Change file'}
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">
            {locale === 'th' ? `ตัวอย่างข้อมูล (${preview.length} แถวแรก จาก ${(lookupData.rows as ImportRow[]).length} แถว)` : `Preview (${preview.length} rows of ${(lookupData.rows as ImportRow[]).length})`}
          </h3>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-2 text-left">SKU</th>
                  <th className="p-2 text-left">{locale === 'th' ? 'ชื่อไทย' : 'Name (TH)'}</th>
                  <th className="p-2 text-left">{locale === 'th' ? 'ชื่ออังกฤษ' : 'Name (EN)'}</th>
                  <th className="p-2 text-right">{locale === 'th' ? 'ราคา' : 'Price'}</th>
                  <th className="p-2 text-left">{locale === 'th' ? 'หมวด' : 'Category'}</th>
                  <th className="p-2 text-left">{locale === 'th' ? 'ยี่ห้อ' : 'Make'}</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-mono text-xs">{row.sku}</td>
                    <td className="p-2 truncate max-w-[150px]">{row.name_th}</td>
                    <td className="p-2 truncate max-w-[150px]">{row.name_en}</td>
                    <td className="p-2 text-right">฿{row.price?.toLocaleString()}</td>
                    <td className="p-2 text-xs">{row.category_slug}</td>
                    <td className="p-2 text-xs">{row.make_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!result && (
            <button
              onClick={runImport}
              disabled={importing}
              className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {locale === 'th' ? 'กำลังนำเข้า...' : 'Importing...'}
                </>
              ) : (
                <>
                  <Upload size={18} />
                  {locale === 'th'
                    ? `นำเข้าทั้งหมด ${(lookupData.rows as ImportRow[]).length} รายการ`
                    : `Import All ${(lookupData.rows as ImportRow[]).length} Items`}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-xl p-4 border ${
          result.errors.length === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {result.errors.length === 0 ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <AlertCircle size={20} className="text-yellow-600" />
            )}
            <span className="font-semibold">
              {locale === 'th' ? 'ผลลัพธ์' : 'Result'}
            </span>
          </div>
          <p className="text-sm">
            ✅ {locale === 'th' ? 'นำเข้าสำเร็จ' : 'Imported'}: {result.success} | 
            ⏭️ {locale === 'th' ? 'ข้าม' : 'Skipped'}: {result.skipped}
          </p>
          {result.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-red-600">
                {locale === 'th' ? 'ข้อผิดพลาด:' : 'Errors:'}
              </p>
              <ul className="text-xs text-red-500 list-disc ml-4">
                {result.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}
          <Link
            href="/th/admin/products"
            className="inline-block mt-3 text-sm text-blue-600 hover:underline"
          >
            {locale === 'th' ? 'ไปหน้าสินค้า →' : 'Go to Products →'}
          </Link>
        </div>
      )}
    </div>
  )
}
