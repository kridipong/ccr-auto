'use client'

import { useState } from 'react'
import { useLocale } from '@/lib/i18n/locale-provider'
import { Upload, Download, FileSpreadsheet, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import * as XLSX from 'xlsx'

// Known brand keywords to extract from product names
const BRAND_KEYWORDS: Record<string, string> = {
  'tokico': 'tokico', 'denso': 'denso', 'bosch': 'bosch', 'ngk': 'ngk',
  'aishin': 'aishin', 'kyb': 'kyb', 'gs': 'gs', 'yuasa': 'yuasa',
  '3m': '3m', 'valvoline': 'valvoline', 'castrol': 'castrol',
  'shell': 'shell', 'mobil': 'mobil', 'ptt': 'ptt', 'esso': 'esso',
  'bendix': 'bendix', 'akebono': 'akebono', 'trw': 'trw',
  'sakura': 'sakura', 'vic': 'vic', 'fuso': 'fuso',
  'hino': 'hino', 'sanden': 'sanden', 'exedy': 'exedy',
}

// Known make keywords
const MAKE_KEYWORDS: Record<string, string> = {
  'toyota': 'TOYOTA', 'honda': 'HONDA', 'nissan': 'NISSAN',
  'mitsubishi': 'MITSUBISHI', 'isuzu': 'ISUZU', 'mazda': 'MAZDA',
  'ford': 'FORD', 'suzuki': 'SUZUKI', 'chevrolet': 'CHEVROLET',
  'bmw': 'BMW', 'benz': 'MERCEDES', 'mercedes': 'MERCEDES',
  'hyundai': 'HYUNDAI', 'kia': 'KIA', 'mg': 'MG',
}

interface MergedRow {
  parentSku: string
  sku: string
  variantLabel: string
  name_th: string
  name_en: string
  price: number
  stock: number
  imageUrls: string
  extractedBrand: string
  extractedMake: string
  extractedModel: string
  yearStart: string
  yearEnd: string
}

export default function LazadaConverterPage() {
  const { locale } = useLocale()
  const [priceFile, setPriceFile] = useState<File | null>(null)
  const [basicFile, setBasicFile] = useState<File | null>(null)
  const [converted, setConverted] = useState<MergedRow[] | null>(null)
  const [stats, setStats] = useState<{ products: number; variants: number; single: number } | null>(null)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugLog, setDebugLog] = useState<string[]>([])
  const [priceDrag, setPriceDrag] = useState(false)
  const [basicDrag, setBasicDrag] = useState(false)

  const log = (msg: string) => {
    console.log('[LazadaConverter]', msg)
    setDebugLog(prev => [...prev.slice(-9), new Date().toLocaleTimeString() + ' ' + msg])
  }

  const extractBrand = (name: string): string => {
    const lower = name.toLowerCase()
    for (const [key, slug] of Object.entries(BRAND_KEYWORDS)) {
      if (lower.includes(key)) return slug
    }
    return ''
  }

  const extractMake = (name: string): string => {
    const upper = name.toUpperCase()
    for (const [key, makeName] of Object.entries(MAKE_KEYWORDS)) {
      if (upper.includes(key.toUpperCase())) return makeName
    }
    return ''
  }

  const extractModel = (name: string, make: string): string => {
    // Try to find model after the make name in product name
    const upper = name.toUpperCase()
    const patterns = [
      // TOYOTA VIGO
      new RegExp(make.toUpperCase() + '\\s+([A-Z0-9]+[A-Z0-9#]*)', 'i'),
      // Fortuner
      /(Fortuner|Vigo|Hilux|Camry|Altis|Vios|Yaris|Civic|City|Accord|Jazz|CRV|HRV|D-MAX|MU-X|Revo|Tiger|Innova|Cross|CHR|Prius|Avanza|Commuter)[A-Za-z0-9#]*/i,
    ]
    for (const p of patterns) {
      const m = upper.match(p)
      if (m) return m[0]
    }
    return ''
  }

  const cleanSellerSku = (sku: string): string => {
    // Remove * and /, replace spaces/special chars
    return sku.replace(/[*/]/g, '').replace(/\s+/g, '-').replace(/[+,]/g, '-').substring(0, 50)
  }

  const extractYearRange = (name: string): { start: string; end: string } => {
    // Normalize separators: em-dash, en-dash, hyphen, "to", "ถึง", "~"
    const normalized = name
      .replace(/[\u2013\u2014–—]/g, '-')
      .replace(/\s*(?:to|ถึง)\s*/gi, '-')
      .replace(/\s*~\s*/g, '-')

    // Pattern 1: "2015-2020" or "ปี 2015-2020" or "ปี15-20"
    let m = normalized.match(/(?:ปี\s*)?(\d{4})\s*-\s*(\d{4})/i)
    if (m) return { start: m[1], end: m[2] }

    // Pattern 2: "15-20" (2-digit years) — convert to 4-digit
    m = normalized.match(/(?:ปี\s*)?(\d{2})\s*-\s*(\d{2})(?:\s*\(?TH\)?)?/i)
    if (m) {
      const s = parseInt(m[1]), e = parseInt(m[2])
      return {
        start: String(s < 50 ? 2000 + s : 1900 + s),
        end: String(e < 50 ? 2000 + e : 1900 + e),
      }
    }

    // Pattern 3: "2015-UP", "2015+", "2015 onwards"
    m = normalized.match(/(\d{4})\s*[-+]\s*(?:UP|up|onwards|ขึ้นไป)/i)
    if (m) return { start: m[1], end: '' }

    // Pattern 4: "2015-" (just start year with dash but no end)
    m = normalized.match(/(\d{4})\s*-\s*$/i)
    if (m) return { start: m[1], end: '' }

    // Pattern 5: Single standalone year "ปี 2015" or "Y2015" (near model/make context)
    m = normalized.match(/(?:ปี\s*|Y(?:ear)?\s*)(\d{4})/i)
    if (m) return { start: m[1], end: m[1] }

    return { start: '', end: '' }
  }

  const handleConvert = async () => {
    if (!priceFile || !basicFile) return
    setConverting(true)
    setError(null)
    setConverted(null)
    setStats(null)
    log('Starting conversion...')

    try {

    // --- Helper: build column index map from header row ---
    const buildColMap = (headerRow: any[]): Record<string, number> => {
      const map: Record<string, number> = {}
      headerRow.forEach((h: any, i: number) => {
        if (!h) return
        const key = String(h).trim()
        const lower = key.toLowerCase()
        
        // Map exact lowercase key to index
        map[lower] = i
        
        // Aliases for common fields (standardize to lowercase keys)
        if (lower === 'product id') map['product id'] = i
        if (lower === 'product name') map['name'] = i
        if (lower.startsWith('product name in en')) map['nameen'] = i
        if (lower === 'quantity') map['stock'] = i
        if (lower === 'จำนวน') map['stock'] = i
        if (lower === 'price' || lower === 'ราคา') map['price'] = i
        if (lower === 'specialprice') map['specialprice'] = i
        if (lower === 'sellersku' || lower === 'seller sku') map['sellersku'] = i
        if (lower === 'shop sku' && map['sellersku'] === undefined) map['sellersku'] = i
        if (lower === 'ร้าน sku' && map['sellersku'] === undefined) map['sellersku'] = i
        if (lower === 'variation' || lower === 'ตัวเลือก' || lower === 'รูปแบบ' || lower.includes('variation')) map['variation'] = i
        if (lower.startsWith('product images')) {
          const num = lower.match(/(\d+)/)
          if (num) map[`image${num[1]}`] = i
        }
        if (lower.startsWith('รูปภาพสินค้า')) {
          const num = lower.match(/(\d+)/)
          if (num) map[`image${num[1]}`] = i
        }
        if (lower === 'group no') map['group no'] = i
        // Thai headers (for older exports)
        if (lower === 'ชื่อสินค้า') map['name'] = i
        if (lower === 'ชื่อสินค้าใน en') map['nameen'] = i
        if (lower === 'คำอธิบายหลัก') map['description'] = i
        if (lower === 'คำอธิบายเป็นภาษาอังกฤษ') map['descriptionen'] = i
      })
      return map
    }

    // --- Helper: find first data row (skip instruction/header rows) ---
    const findDataStart = (rows: any[][]): number => {
      for (let i = 1; i < Math.min(rows.length, 10); i++) {
        const firstCell = String(rows[i][0] || '').trim()
        // Skip if empty, NaN, or contains instruction text
        if (!firstCell || firstCell === 'nan' || firstCell === 'NA' || firstCell === 'NaN') continue
        if (firstCell === 'Optional' || firstCell === 'Mandatory') continue
        if (firstCell.includes('บังคับ') || firstCell.includes('กรุณา') || 
            firstCell.includes('แนะนำ') || firstCell.includes('หมายเลขกลุ่ม') ||
            firstCell.includes('ระบบสร้าง') || firstCell.includes('ชื่อสินค้า')) continue
        // Skip if it looks like a full sentence instruction (> 60 chars)
        if (firstCell.length > 60) continue
        return i
      }
      return 2
    }

    // Parse price file
    const priceData = await priceFile.arrayBuffer()
    const pw = XLSX.read(priceData, { type: 'array' })
    const ps = pw.Sheets[pw.SheetNames[0]]
    const priceRows: any[][] = XLSX.utils.sheet_to_json(ps, { header: 1 })
    const pCols = buildColMap(priceRows[0] || [])
    const pStart = findDataStart(priceRows)
    const priceData2 = priceRows.slice(pStart).filter((r: any[]) => {
      const pid = r[pCols['product id'] ?? 0]
      return pid && String(pid).trim() && String(pid).trim() !== 'nan'
    })

    log(`Price headers: ${JSON.stringify((priceRows[0] || []).slice(0, 8))}`)
    log(`Price cols → pid:${pCols['product id']} sku:${pCols['sellersku']} price:${pCols['price']} stock:${pCols['stock']} var:${pCols['variation']}`)
    log(`Price rows: ${priceRows.length} total, start@${pStart}, ${priceData2.length} valid`)
    if (priceData2.length > 0) {
      log(`Price sample IDs: ${priceData2.slice(0, 3).map(r => String(r[pCols['product id'] ?? 0] || '').trim()).join(', ')}`)
    }

    // Parse basic file
    const basicData = await basicFile.arrayBuffer()
    const bw = XLSX.read(basicData, { type: 'array' })
    const bs = bw.Sheets[bw.SheetNames[0]]
    const basicRows: any[][] = XLSX.utils.sheet_to_json(bs, { header: 1 })
    const bCols = buildColMap(basicRows[0] || [])
    const bStart = findDataStart(basicRows)
    const basicData2 = basicRows.slice(bStart).filter((r: any[]) => {
      const pid = r[bCols['product id'] ?? 0]
      return pid && String(pid).trim() && String(pid).trim() !== 'nan'
    })

    log(`Basic headers: ${JSON.stringify((basicRows[0] || []).slice(0, 8))}`)
    log(`Basic cols → pid:${bCols['product id']} name:${bCols['name']} nameen:${bCols['nameen']}`)
    log(`Basic rows: ${basicRows.length} total, start@${bStart}, ${basicData2.length} valid`)
    if (basicData2.length > 0) {
      log(`Basic sample IDs: ${basicData2.slice(0, 3).map(r => String(r[bCols['product id'] ?? 0] || '').trim()).join(', ')}`)
    }

    // Build basic lookup by Product ID
    const pidIdx = bCols['product id'] ?? 0
    const nameIdx = bCols['name'] ?? 2
    const nameEnIdx = bCols['nameen'] ?? 3

    // Find image columns (product images1-8 or รูปภาพสินค้า1-8)
    const imgIndices: number[] = []
    for (let i = 1; i <= 8; i++) {
      const key = `image${i}`
      if (bCols[key] !== undefined) imgIndices.push(bCols[key])
    }

    const basicMap: Record<string, any> = {}
    for (const r of basicData2) {
      const pid = String(r[pidIdx] || '').trim()
      if (!pid) continue
      const images = imgIndices.map(idx => r[idx]).filter(Boolean)
      basicMap[pid] = {
        name: r[nameIdx] || '',
        nameEn: r[nameEnIdx] || '',
        images,
      }
    }

    // Group price rows by Product ID
    const pPidIdx = pCols['product id'] ?? 0
    const skuIdx = pCols['sellersku'] ?? pCols['shop sku'] ?? 6
    const priceIdx = pCols['price'] ?? 11
    const stockIdx = pCols['stock'] ?? 7
    const spIdx = pCols['specialprice'] ?? -1
    const varIdx = pCols['variation'] ?? -1  // variant label column

    const groups: Record<string, any[]> = {}
    for (const r of priceData2) {
      const pid = String(r[pPidIdx] || '').trim()
      if (!pid) continue
      if (!groups[pid]) groups[pid] = []
      groups[pid].push(r)
    }

    const merged: MergedRow[] = []
    let totalProducts = 0
    let totalVariants = 0
    let totalSingle = 0

    for (const [pid, variants] of Object.entries(groups)) {
      const basic = basicMap[pid]
      if (!basic) continue

      const productName = basic.name
      const brand = extractBrand(productName)
      const make = extractMake(productName)
      const model = extractModel(productName, make)
      const images = basic.images.join('|')
      const { start: yearStart, end: yearEnd } = extractYearRange(productName)

      const cleanName = productName.replace(/^โช้คอัพ\s+/, '').replace(/\s*\*\s*/g, ' ').trim()
      const parentSku = (brand ? brand.toUpperCase() + '-' : '') + 'LAZ-' + pid.substring(pid.length - 6)

      if (variants.length === 1) {
        totalSingle++
        const v = variants[0]
        merged.push({
          parentSku: '',
          sku: cleanSellerSku(String(v[skuIdx] || '')) || parentSku,
          variantLabel: '',
          name_th: cleanName.substring(0, 255),
          name_en: (basic.nameEn || '').substring(0, 255),
          price: parseFloat(v[priceIdx]) || 0,
          stock: parseInt(v[stockIdx]) || 0,
          imageUrls: images,
          extractedBrand: brand,
          extractedMake: make,
          extractedModel: model,
          yearStart,
          yearEnd,
        })
      } else {
        totalProducts++
        totalVariants += variants.length

        merged.push({
          parentSku: '',
          sku: parentSku,
          variantLabel: '',
          name_th: cleanName.substring(0, 255),
          name_en: (basic.nameEn || '').substring(0, 255),
          price: 0,
          stock: 0,
          imageUrls: images,
          extractedBrand: brand,
          extractedMake: make,
          extractedModel: model,
          yearStart,
          yearEnd,
        })

        for (const v of variants) {
          const sku = cleanSellerSku(String(v[skuIdx] || ''))
          const varLabel = String(varIdx >= 0 ? (v[varIdx] || '') : '').trim()
          merged.push({
            parentSku,
            sku: sku || (parentSku + '-' + (variants.indexOf(v) + 1)),
            variantLabel: varLabel,
            name_th: (varLabel ? productName + ' ' + varLabel : productName).substring(0, 255),
            name_en: '',  // will be auto-translated below with variant-specific name
            price: parseFloat(v[priceIdx]) || 0,
            stock: parseInt(v[stockIdx]) || 0,
            imageUrls: '',
            extractedBrand: '',
            extractedMake: '',
            extractedModel: '',
            yearStart: '',
            yearEnd: '',
          })
        }
      }
    }

    // Auto-translate missing English names via local API
    const needTranslation = merged.filter(r => !r.name_en && r.name_th)
    if (needTranslation.length > 0) {
      log(`Auto-translating ${needTranslation.length} missing English names...`)
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: needTranslation.map(r => r.name_th) }),
        })
        if (!res.ok) {
          log(`Translate API returned ${res.status} — names left as-is`)
        } else {
          const data = await res.json()
          if (data.translations) {
            let done = 0
            let failed = 0
            needTranslation.forEach((row, i) => {
              if (data.translations[i] && data.translations[i] !== row.name_th) {
                row.name_en = data.translations[i].substring(0, 255)
                done++
              } else if (data.translations[i] === '') {
                failed++
              }
            })
            log(`Translated ${done}/${needTranslation.length} names${failed > 0 ? ` (${failed} failed)` : ''}`)
          }
        }
      } catch (e) {
        log('Translation failed — names left as-is')
        console.error('Translate error:', e)
      }
    }

    setConverted(merged)
    setStats({ products: totalProducts, variants: totalVariants, single: totalSingle })
    log(`Done! ${totalProducts + totalSingle} products, ${totalVariants} variants`)
    log(`Price groups: ${Object.keys(groups).length}, Basic map: ${Object.keys(basicMap).length}, Matched: ${merged.length}`)
    if (merged.length === 0 && Object.keys(groups).length > 0 && Object.keys(basicMap).length > 0) {
      const pids = Object.keys(groups).slice(0, 3)
      const bids = Object.keys(basicMap).slice(0, 3)
      log(`⚠️ No matches! Price IDs: [${pids.join(', ')}], Basic IDs: [${bids.join(', ')}]`)
    }
    } catch (err: any) {
      setError(err?.message || 'Unknown error reading files. Make sure both are Lazada Excel exports.')
      console.error('Lazada converter error:', err)
      log('ERROR: ' + (err?.message || 'unknown'))
    } finally {
      setConverting(false)
    }
  }

  const downloadConverted = () => {
    if (!converted) return

    const rows = converted.map(r => ({
      sku: r.sku,
      parent_sku: r.parentSku,
      variant_label: r.variantLabel,
      name_th: r.name_th,
      name_en: r.name_en,
      description_th: '',
      description_en: '',
      price: r.price,
      compare_price: '',
      stock: r.stock,
      category_slug: '',
      brand_slug: r.extractedBrand,
      make_name: r.extractedMake,
      model_name: r.extractedModel,
      year_start: r.yearStart,
      year_end: r.yearEnd,
      engine: '',
      image_urls: r.imageUrls,
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, 'charoenyon-import.xlsx')
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    log('onChange fired! file=' + (file?.name || 'null'))
    setPriceFile(file)
    setError(null)
    setConverted(null)
  }

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    log('onChange fired! file=' + (file?.name || 'null'))
    setBasicFile(file)
    setError(null)
    setConverted(null)
  }

  const handlePriceDrop = (e: React.DragEvent) => {
    e.preventDefault(); setPriceDrag(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      log('DROP! file=' + file.name)
      setPriceFile(file); setError(null); setConverted(null)
    }
  }

  const handleBasicDrop = (e: React.DragEvent) => {
    e.preventDefault(); setBasicDrag(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      log('DROP! file=' + file.name)
      setBasicFile(file); setError(null); setConverted(null)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {locale === 'th' ? 'แปลงไฟล์ Lazada → เจริญยนต์' : 'Lazada → Charoenyon Converter'}
        </h2>
        <Link
          href="/th/admin/products/import"
          className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          {locale === 'th' ? 'กลับ' : 'Back'}
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <p className="font-medium mb-1">{locale === 'th' ? 'วิธีใช้:' : 'How to use:'}</p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>{locale === 'th'
            ? 'อัปโหลดไฟล์ Price/Stock และ Basic จาก Lazada'
            : 'Upload Lazada Price/Stock + Basic export files'}</li>
          <li>{locale === 'th'
            ? 'ระบบจะรวมข้อมูล ดึงแบรนด์/ยี่ห้อ/รุ่นโดยอัตโนมัติ'
            : 'System merges data, auto-extracts brand/make/model'}</li>
          <li>{locale === 'th'
            ? 'สินค้าที่มีหลายตัวเลือก (หน้า/หลัง) จะถูกจัดกลุ่มเป็น Parent-Child'
            : 'Multi-variant products get grouped as Parent-Child'}</li>
          <li>{locale === 'th'
            ? 'ดาวน์โหลดไฟล์ แล้วนำเข้าในหน้านำเข้าปกติ'
            : 'Download and import via the normal import page'}</li>
        </ol>
      </div>

      {/* Debug panel */}
      {debugLog.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-xs font-mono">
          <div className="font-semibold text-yellow-700 mb-1">🐛 Debug Log:</div>
          {debugLog.map((entry, i) => (
            <div key={i} className="text-yellow-800">{entry}</div>
          ))}
        </div>
      )}

      {/* File uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-6 text-center">
          <h3 className="font-semibold text-gray-700 mb-3">
            📊 {locale === 'th' ? 'ไฟล์ Price & Stock' : 'Price & Stock File'}
          </h3>
          {priceFile ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle size={16} /> <span className="truncate max-w-[180px]">{priceFile.name}</span>
              <button
                onClick={() => { setPriceFile(null); setError(null); setConverted(null); log('Cleared price file') }}
                className="text-xs text-red-500 hover:underline ml-2"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setPriceDrag(true) }}
              onDragLeave={() => setPriceDrag(false)}
              onDrop={handlePriceDrop}
              onDragEnd={() => setPriceDrag(false)}
              className={`cursor-pointer flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed transition-colors ${
                priceDrag ? 'border-blue-400 bg-blue-50' : 'border-transparent'
              }`}
            >
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <FileSpreadsheet size={40} className="text-gray-300" />
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 select-none">
                  {locale === 'th' ? 'เลือกไฟล์' : 'Select file'}
                </span>
                <span className="text-xs text-gray-400">
                  {locale === 'th' ? 'หรือลากไฟล์มาวางที่กล่องนี้' : 'or drag & drop here'}
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handlePriceChange}
                  className="sr-only"
                />
              </label>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border p-6 text-center">
          <h3 className="font-semibold text-gray-700 mb-3">
            📋 {locale === 'th' ? 'ไฟล์ Basic (รายละเอียด)' : 'Basic File (Details)'}
          </h3>
          {basicFile ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle size={16} /> <span className="truncate max-w-[180px]">{basicFile.name}</span>
              <button
                onClick={() => { setBasicFile(null); setError(null); setConverted(null); log('Cleared basic file') }}
                className="text-xs text-red-500 hover:underline ml-2"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setBasicDrag(true) }}
              onDragLeave={() => setBasicDrag(false)}
              onDrop={handleBasicDrop}
              onDragEnd={() => setBasicDrag(false)}
              className={`cursor-pointer flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed transition-colors ${
                basicDrag ? 'border-blue-400 bg-blue-50' : 'border-transparent'
              }`}
            >
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <FileSpreadsheet size={40} className="text-gray-300" />
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 select-none">
                  {locale === 'th' ? 'เลือกไฟล์' : 'Select file'}
                </span>
                <span className="text-xs text-gray-400">
                  {locale === 'th' ? 'หรือลากไฟล์มาวางที่กล่องนี้' : 'or drag & drop here'}
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleBasicChange}
                  className="sr-only"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Convert button */}
      {priceFile && basicFile && !converted && (
        <div>
          <button
            onClick={handleConvert}
            disabled={converting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2"
          >
            {converting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {locale === 'th' ? 'กำลังแปลง...' : 'Converting...'}
              </>
            ) : (
              <>
                <Upload size={18} />
                {locale === 'th' ? 'แปลงไฟล์' : 'Convert Files'}
              </>
            )}
          </button>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {converted && stats && (
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-green-600" />
            <span className="font-semibold text-gray-800">
              {locale === 'th' ? 'แปลงสำเร็จ!' : 'Conversion Complete!'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-700">{stats.products}</div>
              <div className="text-xs text-blue-600">{locale === 'th' ? 'สินค้าหลายตัวเลือก' : 'Multi-variant'}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-700">{stats.variants}</div>
              <div className="text-xs text-purple-600">{locale === 'th' ? 'ตัวเลือกรวม' : 'Total variants'}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-700">{stats.single}</div>
              <div className="text-xs text-green-600">{locale === 'th' ? 'สินค้าเดี่ยว' : 'Single items'}</div>
            </div>
          </div>

          {/* Preview table */}
          <div className="mb-4 max-h-64 overflow-y-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-2 text-left">SKU</th>
                  <th className="p-2 text-left">Parent</th>
                  <th className="p-2 text-left">Variant</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-center">Stock</th>
                  <th className="p-2 text-left">Brand</th>
                  <th className="p-2 text-left">Make</th>
                  <th className="p-2 text-left">Model</th>
                  <th className="p-2 text-center">Year</th>
                </tr>
              </thead>
              <tbody>
                {converted.slice(0, 50).map((r, i) => (
                  <tr key={i} className={`border-t ${r.parentSku ? 'bg-purple-50/30' : r.price === 0 ? 'bg-blue-50 font-medium' : ''}`}>
                    <td className="p-1.5 font-mono">{r.sku.substring(0, 20)}</td>
                    <td className="p-1.5 text-gray-400">{r.parentSku ? '✓' : ''}</td>
                    <td className="p-1.5">{r.variantLabel}</td>
                    <td className="p-1.5 truncate max-w-[150px]">{r.name_th}</td>
                    <td className="p-1.5 text-right">{r.price > 0 ? '฿' + r.price.toLocaleString() : '-'}</td>
                    <td className="p-1.5 text-center">{r.stock}</td>
                    <td className="p-1.5">{r.extractedBrand || '-'}</td>
                    <td className="p-1.5 font-semibold">{r.extractedMake || '-'}</td>
                    <td className="p-1.5">{r.extractedModel || '-'}</td>
                    <td className="p-1.5 text-center text-xs">{r.yearStart ? (r.yearStart + (r.yearEnd && r.yearEnd !== r.yearStart ? '-' + r.yearEnd : '')) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={downloadConverted}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Download size={18} />
            {locale === 'th' ? `ดาวน์โหลด ${converted.length} แถว เป็น Excel` : `Download ${converted.length} rows as Excel`}
          </button>

          <p className="text-xs text-gray-400 mt-3 text-center">
            {locale === 'th'
              ? 'Tip: แบรนด์และรุ่นที่ระบบดึงได้จะเป็นค่าประมาณ — ตรวจสอบใน dialog ก่อนนำเข้า'
              : 'Tip: Auto-extracted brand/model are estimates — review in the import dialog'}
          </p>
        </div>
      )}
    </div>
  )
}
