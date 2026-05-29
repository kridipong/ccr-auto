'use client'

import { useState, useRef } from 'react'
import { useLocale } from '@/lib/i18n/locale-provider'
import { createClient } from '@/lib/supabase/client'
import { Upload, Download, AlertCircle, CheckCircle, Loader2, FileSpreadsheet, X, Plus, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import * as XLSX from 'xlsx'

const supabase = createClient()

interface ImportRow {
  sku: string
  parent_sku?: string
  variant_label?: string
  name_th: string
  name_en: string
  description_th?: string
  description_en?: string
  price: number
  compare_price?: number
  stock?: number
  category_slug?: string
  brand_slug?: string
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
  errorRows: ImportRow[]
}

interface BatchModelItem {
  key: string          // `${makeId}:${modelName}`
  makeId: string
  makeName: string
  modelName: string    // editable
  originalName: string
  included: boolean
  yearStart?: number
  yearEnd?: number
  resolvedModelId?: string    // if user picks an existing model
  resolvedModelName?: string
  searching?: boolean         // show existing-model dropdown
}

export default function AdminImportPage() {
  const { locale } = useLocale()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [lookupData, setLookupData] = useState<{ [key: string]: any }>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  // --- Batch model review ---
  const [batchModels, setBatchModels] = useState<BatchModelItem[]>([])
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const batchResolveRef = useRef<((createdModels: BatchModelItem[]) => void) | null>(null)
  const [existingModels, setExistingModels] = useState<Record<number, any[]>>({})

  const detectDelimiter = (text: string): string => {
    const firstLine = text.split('\n')[0]
    const commaCount = (firstLine.match(/,/g) || []).length
    const tabCount = (firstLine.match(/\t/g) || []).length
    return tabCount > commaCount ? '\t' : ','
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) processFile(f)
  }

  const processFile = async (f: File) => {
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
      const data = await f.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(sheet) as ImportRow[]
    }

    // Load lookup data
    const [makes, cats, mods, brands] = await Promise.all([
      supabase.from('makes').select('id, name_en, name_th'),
      supabase.from('categories').select('id, name_en, slug'),
      supabase.from('models').select('id, name, make_id'),
      supabase.from('brands').select('id, name_en, slug'),
    ])

    setPreview(rows.slice(0, 20))
    setResult(null)

    setLookupData({
      rows,
      makes: makes.data || [],
      cats: cats.data || [],
      brands: brands.data || [],
      models: mods.data || [],
    })
  }

  const downloadTemplate = () => {
    const headers = [
      'sku', 'name_th', 'name_en', 'description_th', 'description_en',
      'price', 'compare_price', 'stock', 'category_slug', 'brand_slug',
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
      brand_slug: 'bosch',
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
      ['brand_slug', '', 'slug ของแบรนด์ (bosch, denso ฯลฯ)'],
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

  // Helper: does a model exist (case-insensitive) in local lookup?
  const modelExists = (makeId: string, modelName: string, modelLookup: any[]): boolean => {
    if (!modelName) return true // no model → nothing to check
    const nameUp = modelName.toUpperCase()
    return modelLookup.some((m: any) =>
      m.make_id === makeId && m.name?.toUpperCase() === nameUp
    )
  }

  // Helper: fuzzy make lookup
  const findMake = (name: string, makes: any[]): any | null => {
    if (!name) return null
    const nameUp = name.toUpperCase()
    let m = makes.find((mk: any) => mk.name_en?.toUpperCase() === nameUp)
    if (!m) {
      m = makes.find((mk: any) =>
        mk.name_en?.toUpperCase().includes(nameUp) ||
        nameUp.includes(mk.name_en?.toUpperCase())
      )
    }
    return m || null
  }

  const runImport = async () => {
    if (!lookupData.rows) return
    setImporting(true)
    setResult(null)

    const rows = lookupData.rows as ImportRow[]
    const makes = lookupData.makes as any[]
    const cats = lookupData.cats as any[]
    const brands = lookupData.brands as any[]
    const modelLookup: any[] = JSON.parse(JSON.stringify(lookupData.models || []))
    const results: ImportResult = { success: 0, errors: [], skipped: 0, errorRows: [] }

    // ── PHASE 1: Pre-scan for unmatched models ──
    let modelNameMap = new Map<string, string>() // original → edited name mapping

    const unmatched = new Map<string, { makeId: string; makeName: string; modelName: string; yearStart?: number; yearEnd?: number }>()

    for (const row of rows) {
      if (!row.make_name || !row.model_name) continue
      const make = findMake(row.make_name, makes)
      if (!make) continue
      if (!modelExists(make.id, row.model_name, modelLookup)) {
        const key = `${make.id}:${row.model_name.toUpperCase()}`
        if (!unmatched.has(key)) {
          unmatched.set(key, {
            makeId: make.id,
            makeName: make.name_en,
            modelName: row.model_name,
            yearStart: row.year_start,
            yearEnd: row.year_end,
          })
        }
      }
    }

    // If unmatched models found → show batch review dialog
    if (unmatched.size > 0) {
      const items: BatchModelItem[] = Array.from(unmatched.values()).map(v => ({
        key: `${v.makeId}:${v.modelName}`,
        makeId: v.makeId,
        makeName: v.makeName,
        modelName: v.modelName,
        originalName: v.modelName,
        included: true,
        yearStart: v.yearStart,
        yearEnd: v.yearEnd,
      }))

      const createdModels = await new Promise<BatchModelItem[]>((resolve) => {
        batchResolveRef.current = resolve
        setBatchModels(items)
        setShowBatchDialog(true)
      })

      // Build mapping: original name → edited/resolved name
      modelNameMap = new Map<string, string>()
      for (const m of createdModels) {
        if (!m.included) continue
        // If resolved to existing model, map original → resolved name
        if (m.resolvedModelId) {
          modelNameMap.set(m.originalName.toUpperCase(), m.resolvedModelName || m.modelName)
        } else if (m.modelName !== m.originalName) {
          modelNameMap.set(m.originalName.toUpperCase(), m.modelName)
        }
      }

      // User confirmed — batch-create all included models (skip resolved-to-existing)
      let toCreate = createdModels.filter(m => m.included && !m.resolvedModelId)
      // Deduplicate: if two rows were edited to the same name, create only one model
      const deduped = new Map<string, typeof toCreate[0]>()
      for (const m of toCreate) {
        const key = `${m.makeId}:${m.modelName.toUpperCase()}`
        if (!deduped.has(key)) deduped.set(key, m)
      }
      toCreate = Array.from(deduped.values())
      if (toCreate.length > 0) {
        const inserts = toCreate.map(m => ({ make_id: m.makeId, name: m.modelName, year_start: m.yearStart || 2000 }))
        const { data: newModels, error: createErr } = await supabase
          .from('models')
          .insert(inserts)
          .select('id, name, make_id')

        if (createErr) {
          results.errors.push(`Model creation error: ${createErr.message}`)
        } else if (newModels) {
          for (const nm of newModels) {
            modelLookup.push(nm)
          }
          results.errors.push(`✅ Created ${newModels.length} new model(s)`)
        }
      }

      // Note which were skipped
      const skipped = createdModels.filter(m => !m.included)
      if (skipped.length > 0) {
        results.errors.push(`⏭️ Skipped ${skipped.length} model(s): ${skipped.map(s => s.originalName).join(', ')}`)
      }
    }

    // ── PHASE 2: Run the import (no interruptions) ──
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      const missingFields: string[] = []
      if (!row.sku) missingFields.push('sku')
      if (!row.name_th) missingFields.push('name_th')
      if (!row.name_en) missingFields.push('name_en')
      if (row.price == null || isNaN(Number(row.price))) missingFields.push('price')
      if (missingFields.length > 0) {
        results.skipped++
        results.errorRows.push(row)
        results.errors.push(`Row ${i + 1} (SKU: ${row.sku || '?'}): Missing: ${missingFields.join(', ')}`)
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

      // Resolve brand
      let brandId = null
      if (row.brand_slug) {
        const brand = brands.find((b: any) =>
          b.slug?.toLowerCase() === row.brand_slug?.toLowerCase()
        )
        if (brand) brandId = brand.id
      }

      const images = row.image_urls
        ? row.image_urls.split('|').map(u => u.trim()).filter(Boolean)
        : []

      // Upsert product (include variant_label if present)
      const productData: any = {
        sku: row.sku,
        name_th: row.name_th,
        name_en: row.name_en,
        description_th: row.description_th || '',
        description_en: row.description_en || '',
        price: Number(row.price),
        compare_price: row.compare_price ? Number(row.compare_price) : null,
        stock: row.stock || 0,
        category_id: catId,
        brand_id: brandId,
        images,
        is_active: true,
      }
      if (row.variant_label) productData.variant_label = row.variant_label

      const { error: prodErr } = await supabase.from('products').upsert(productData, { onConflict: 'sku', ignoreDuplicates: false })

      if (prodErr) {
        results.errors.push(`${row.sku}: ${prodErr.message}`)
        results.errorRows.push(row)
        continue
      }

      // Fitment
      if (row.make_name) {
        const make = findMake(row.make_name, makes)

        if (!make) {
          results.errors.push(`${row.sku}: Make "${row.make_name}" not found`)
          results.errorRows.push(row)
          continue
        }

        // Resolve model from lookup (all should be present now)
        let modelId: string | null = null
        if (row.model_name) {
          // Check if name was edited in batch dialog
          const nameUp = row.model_name.toUpperCase()
          const effectiveName = modelNameMap.get(nameUp) || row.model_name
          const effectiveUp = effectiveName.toUpperCase()
          const found = modelLookup.find((m: any) =>
            m.make_id === make.id && m.name?.toUpperCase() === effectiveUp
          )
          modelId = found?.id || null
        }
        if (!modelId) {
          results.errors.push(`${row.sku}: Model "${row.model_name}" not found for fitment (skipped fitment)`)
          // Still count product as imported, just skip the fitment
        } else {

        // Get product ID
        const { data: prod } = await supabase
          .from('products')
          .select('id')
          .eq('sku', row.sku)
          .single()

        if (prod) {
          const { error: fitErr } = await supabase
            .from('product_fitments')
            .insert({
              product_id: prod.id,
              make_id: make.id,
              model_id: modelId,
              year_start: row.year_start || 2000,
              year_end: row.year_end || null,
              engine: row.engine || null,
            })

          if (fitErr) {
            results.errors.push(`${row.sku}: Fitment error: ${fitErr.message}`)
          }
        }
        } // close else (modelId found)
      }

      results.success++
    }

    // ── PHASE 3: Resolve parent-child links ──
    const parentRows = rows.filter(r => r.parent_sku)
    if (parentRows.length > 0) {
      const parentSkus = [...new Set(parentRows.map(r => r.parent_sku!))]
      const { data: parents } = await supabase
        .from('products')
        .select('id, sku')
        .in('sku', parentSkus)
      const parentMap = new Map((parents || []).map((p: any) => [p.sku, p.id]))

      for (const row of parentRows) {
        const parentId = parentMap.get(row.parent_sku!)
        if (parentId && row.sku) {
          await supabase
            .from('products')
            .update({ parent_product_id: parentId })
            .eq('sku', row.sku)
        }
      }
    }

    setResult(results)
    setImporting(false)
  }

  const handleBatchConfirm = () => {
    setShowBatchDialog(false)
    batchResolveRef.current?.(batchModels)
  }

  const handleBatchCancel = () => {
    // Skip all — mark all as not included
    const skipped = batchModels.map(m => ({ ...m, included: false }))
    setBatchModels(skipped)
    setShowBatchDialog(false)
    batchResolveRef.current?.(skipped)
  }

  const toggleBatchModel = (idx: number) => {
    setBatchModels(prev => prev.map((m, i) => i === idx ? { ...m, included: !m.included } : m))
  }

  const editBatchModelName = (idx: number, newName: string) => {
    setBatchModels(prev => prev.map((m, i) => i === idx ? { ...m, modelName: newName } : m))
  }

  const searchExistingModels = async (idx: number, makeId: string) => {
    // Toggle searching off if already open
    setBatchModels(prev => {
      const wasSearching = prev[idx]?.searching
      return prev.map((m, i) => i === idx ? { ...m, searching: !wasSearching } : { ...m, searching: false })
    })
    if (!existingModels[idx]) {
      const { data } = await supabase
        .from('models')
        .select('id, name, make_id, year_start, year_end')
        .eq('make_id', makeId)
        .order('name')
        .limit(50)
      setExistingModels(prev => ({ ...prev, [idx]: data || [] }))
    }
  }

  const selectExistingModel = (idx: number, modelId: string, modelName: string) => {
    setBatchModels(prev => prev.map((m, i) => i === idx ? {
      ...m,
      resolvedModelId: modelId,
      resolvedModelName: modelName,
      modelName: modelName,
      searching: false,
      included: true,
    } : m))
  }

  const clearExistingModel = (idx: number) => {
    setBatchModels(prev => prev.map((m, i) => i === idx ? {
      ...m,
      resolvedModelId: undefined,
      resolvedModelName: undefined,
      modelName: m.originalName,
    } : m))
  }

  const downloadErrors = () => {
    if (!result || result.errorRows.length === 0) return
    const ws = XLSX.utils.json_to_sheet(result.errorRows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Errors')
    XLSX.writeFile(wb, 'ccrauto-products-import-errors.xlsx')
  }

  const includedCount = batchModels.filter(m => m.included).length

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
          {locale === 'th' ? 'วิธีใช้งาน:' : 'How to use:'}
        </p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>{locale === 'th' ? 'ดาวน์โหลดไฟล์ Template ด้านบน' : 'Download the template above'}</li>
          <li>{locale === 'th' ? 'กรอกข้อมูลสินค้าของคุณลงในไฟล์' : 'Fill in your product data'}</li>
          <li>{locale === 'th' ? 'อัปโหลดไฟล์ (รองรับ .xlsx, .xls, .csv)' : 'Upload the file (.xlsx, .xls, .csv)'}</li>
          <li>{locale === 'th' ? 'ตรวจสอบตัวอย่าง แล้วกด "นำเข้า"' : 'Review preview and click "Import"'}</li>
        </ol>
      </div>

      {/* Upload */}
      <div
        className={`bg-white rounded-xl border p-8 text-center mb-6 transition-colors ${
          dragActive ? 'border-blue-400 bg-blue-50 border-2 border-dashed' : ''
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onDragEnd={() => setDragActive(false)}
      >
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
            {locale === 'th'
              ? `ตัวอย่างข้อมูล (${preview.length} แถวแรก จาก ${(lookupData.rows as ImportRow[])?.length || preview.length} แถว)`
              : `Preview (${preview.length} rows of ${(lookupData.rows as ImportRow[])?.length || preview.length})`}
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
                  <th className="p-2 text-left">{locale === 'th' ? 'รุ่น' : 'Model'}</th>
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
                    <td className="p-2 text-xs">{row.model_name}</td>
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
                    ? `นำเข้าทั้งหมด ${(lookupData.rows as ImportRow[])?.length || 0} รายการ`
                    : `Import All ${(lookupData.rows as ImportRow[])?.length || 0} Items`}
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
                {locale === 'th' ? 'ข้อผิดพลาด/บันทึก:' : 'Errors/Logs:'}
              </p>
              <ul className="text-xs text-red-500 list-disc ml-4">
                {result.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
              <button
                onClick={downloadErrors}
                className="mt-3 flex items-center gap-1.5 text-xs px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Download size={14} />
                {locale === 'th' ? 'ดาวน์โหลดแถวที่ผิดพลาดเป็น Excel' : 'Download Error Rows as Excel'}
              </button>
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

      {/* ── Batch Model Review Dialog ── */}
      {showBatchDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {locale === 'th' ? 'รุ่นรถที่ยังไม่มีในระบบ' : 'Models Not In System'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {locale === 'th'
                    ? `พบ ${batchModels.length} รุ่นที่ต้องเพิ่มก่อนนำเข้า — ตรวจสอบและแก้ไขชื่อได้เลย`
                    : `Found ${batchModels.length} models to add — review and edit names below`}
                </p>
              </div>
              <button onClick={handleBatchCancel} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Model list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {batchModels.map((m, idx) => (
                <div
                  key={m.key}
                  className={`rounded-xl border transition-all ${
                    m.resolvedModelId
                      ? 'bg-green-50 border-green-200'
                      : m.included
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  {/* Main row */}
                  <div className="flex items-center gap-3 p-3">
                    {/* Toggle (hidden if resolved) */}
                    {!m.resolvedModelId ? (
                      <button
                        onClick={() => toggleBatchModel(idx)}
                        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          m.included
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                        title={m.included ? 'Click to skip' : 'Click to include'}
                      >
                        {m.included ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                    ) : (
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white">
                        <CheckCircle size={15} />
                      </div>
                    )}

                    {/* Make (read-only label) */}
                    <span className="shrink-0 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 uppercase min-w-[70px] text-center">
                      {m.makeName}
                    </span>

                    {/* Model name input OR resolved display */}
                    {m.resolvedModelId ? (
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <span className="text-sm line-through text-gray-400 truncate">{m.originalName}</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-sm font-semibold text-green-700 truncate">{m.resolvedModelName}</span>
                        <span className="shrink-0 text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded">existing</span>
                        <button
                          onClick={() => clearExistingModel(idx)}
                          className="ml-auto shrink-0 text-xs text-gray-400 hover:text-red-500 underline"
                        >
                          undo
                        </button>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={m.modelName}
                        onChange={(e) => editBatchModelName(idx, e.target.value)}
                        disabled={!m.included}
                        className={`flex-1 px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-colors ${
                          m.included
                            ? 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-gray-800 bg-white'
                            : 'border-gray-200 text-gray-400 bg-gray-100'
                        }`}
                      />
                    )}

                    {/* Year range badge */}
                    {(m.yearStart || m.yearEnd) && (
                      <span className="shrink-0 text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {m.yearStart || '...'}–{m.yearEnd || '...'}
                      </span>
                    )}

                    {/* Changed indicator */}
                    {!m.resolvedModelId && m.modelName !== m.originalName && (
                      <span className="text-[10px] text-orange-500 shrink-0">
                        ✏️ edited
                      </span>
                    )}

                    {/* Search existing button */}
                    {!m.resolvedModelId && m.included && (
                      <button
                        onClick={() => searchExistingModels(idx, m.makeId)}
                        className={`shrink-0 text-[11px] px-2 py-1 rounded-lg transition-colors ${
                          m.searching
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                        title="Search for existing model"
                      >
                        🔍 Search
                      </button>
                    )}
                  </div>

                  {/* Existing model dropdown */}
                  {m.searching && existingModels[idx] && (
                    <div className="px-3 pb-3 border-t border-gray-100 pt-2">
                      <div className="flex flex-wrap gap-1">
                        {existingModels[idx].length === 0 ? (
                          <span className="text-xs text-gray-400">No models found for {m.makeName}</span>
                        ) : (
                          existingModels[idx].map((em: any) => (
                            <button
                              key={em.id}
                              onClick={() => selectExistingModel(idx, em.id, em.name)}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors text-left"
                            >
                              <span className="font-medium text-gray-700">{em.name}</span>
                              {(em.year_start || em.year_end) && (
                                <span className="text-gray-400 ml-1">
                                  ({em.year_start || '...'}–{em.year_end || '...'})
                                </span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                      <button
                        onClick={() => searchExistingModels(idx, m.makeId)}
                        className="mt-1 text-[10px] text-gray-400 hover:text-gray-600"
                      >
                        close
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const allOn = batchModels.every(m => m.included)
                    setBatchModels(prev => prev.map(m => ({ ...m, included: !allOn })))
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  {batchModels.every(m => m.included)
                    ? (locale === 'th' ? 'ยกเลิกทั้งหมด' : 'Deselect All')
                    : (locale === 'th' ? 'เลือกทั้งหมด' : 'Select All')}
                </button>
                <span className="text-sm text-gray-400">
                  {includedCount}/{batchModels.length} {locale === 'th' ? 'รายการ' : 'selected'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBatchCancel}
                  className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium"
                >
                  {locale === 'th' ? 'ข้ามทั้งหมด' : 'Skip All'}
                </button>
                <button
                  onClick={handleBatchConfirm}
                  disabled={includedCount === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                  {locale === 'th'
                    ? `เพิ่ม ${includedCount} รุ่น & นำเข้า`
                    : `Add ${includedCount} Models & Import`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
