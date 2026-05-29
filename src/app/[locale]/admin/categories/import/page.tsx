'use client'

import { useState, useRef } from 'react'
import { useLocale } from '@/lib/i18n/locale-provider'
import { createClient } from '@/lib/supabase/client'
import { Upload, Download, AlertCircle, CheckCircle, Loader2, FileSpreadsheet } from 'lucide-react'
import Link from 'next/link'
import * as XLSX from 'xlsx'

const supabase = createClient()

interface CategoryRow {
  name_th: string
  name_en: string
  slug: string
}

interface ImportResult {
  success: number
  errors: string[]
  skipped: number
  errorRows: CategoryRow[]
}

export default function CategoryImportPage() {
  const { locale } = useLocale()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CategoryRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [allRows, setAllRows] = useState<CategoryRow[]>([])
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
    let rows: CategoryRow[] = []

    if (ext === 'csv') {
      const text = await f.text()
      const delim = detectDelimiter(text)
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { alert('Empty file'); return }
      const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ''))
      rows = lines.slice(1).map(line => {
        const vals = line.split(delim).map(v => v.trim().replace(/^"|"$/g, ''))
        const row: any = {}
        headers.forEach((h, i) => { row[h] = vals[i] || '' })
        return row as CategoryRow
      })
    } else {
      const data = await f.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(sheet) as CategoryRow[]
    }

    setPreview(rows.slice(0, 20))
    setAllRows(rows)
  }

  const downloadTemplate = () => {
    const headers = ['name_th', 'name_en', 'slug']
    const exampleRows = [
      { name_th: 'ระบบเบรก', name_en: 'Brakes', slug: 'brakes' },
      { name_th: 'เครื่องยนต์', name_en: 'Engine', slug: 'engine' },
      { name_th: 'ระบบช่วงล่าง', name_en: 'Suspension', slug: 'suspension' },
      { name_th: 'กรองอากาศ', name_en: 'Air Filters', slug: 'air-filters' },
      { name_th: 'น้ำมันเครื่อง', name_en: 'Engine Oil', slug: 'engine-oil' },
      { name_th: 'ไส้กรอง', name_en: 'Filters', slug: 'filters' },
      { name_th: 'ไฟหน้า-ไฟท้าย', name_en: 'Lights', slug: 'lights' },
      { name_th: 'อะไหล่ช่วงล่าง', name_en: 'Chassis Parts', slug: 'chassis' },
    ]
    const ws = XLSX.utils.json_to_sheet(exampleRows, { header: headers })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Categories')

    const instructions: (string | undefined)[][] = [
      ['FIELD', 'REQUIRED', 'DESCRIPTION'],
      ['name_th', '', 'ชื่อหมวดหมู่ภาษาไทย'],
      ['name_en', 'YES', 'Category name in English'],
      ['slug', 'YES', 'URL slug (lowercase, no spaces, use hyphens)'],
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(instructions)
    ws2['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 55 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Instructions')

    XLSX.writeFile(wb, 'ccrauto-categories-template.xlsx')
  }

  const runImport = async () => {
    if (!allRows.length) return
    setImporting(true)
    setResult(null)

    const results: ImportResult = { success: 0, errors: [], skipped: 0, errorRows: [] }

    for (const row of allRows) {
      if (!row.name_en || !row.slug) {
        results.skipped++
        continue
      }

      const catData = {
        name_th: row.name_th || row.name_en,
        name_en: row.name_en,
        slug: row.slug.toLowerCase().replace(/\s+/g, '-'),
      }

      // Upsert by slug
      const { error } = await supabase
        .from('categories')
        .upsert(catData, { onConflict: 'slug', ignoreDuplicates: false })

      if (error) {
        results.errors.push(`${row.name_en}: ${error.message}`)
        results.errorRows.push(row)
      } else {
        results.success++
      }
    }

    setResult(results)
    setImporting(false)
  }

  const downloadErrors = () => {
    if (!result || result.errorRows.length === 0) return
    const ws = XLSX.utils.json_to_sheet(result.errorRows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Errors')
    XLSX.writeFile(wb, 'ccrauto-categories-import-errors.xlsx')
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {locale === 'th' ? 'นำเข้าหมวดหมู่จาก Excel/CSV' : 'Import Categories from Excel/CSV'}
        </h2>
        <div className="flex gap-3">
          <Link
            href={`/${locale}/admin/vehicles`}
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
          <li>{locale === 'th' ? 'กรอกชื่อและ slug ของหมวดหมู่' : 'Fill in category names and slugs'}</li>
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
              onClick={() => { setFile(null); setPreview([]); setResult(null); setAllRows([]) }}
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
              ? `ตัวอย่างข้อมูล (${preview.length} แถวแรก จาก ${allRows.length} แถว)`
              : `Preview (${preview.length} rows of ${allRows.length})`}
          </h3>
          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-2 text-left">{locale === 'th' ? 'ชื่อไทย' : 'TH Name'}</th>
                  <th className="p-2 text-left">English</th>
                  <th className="p-2 text-left">Slug</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{row.name_th}</td>
                    <td className="p-2 font-medium">{row.name_en}</td>
                    <td className="p-2 text-gray-500 font-mono text-xs">/{row.slug}</td>
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
                    ? `นำเข้าทั้งหมด ${allRows.length} รายการ`
                    : `Import All ${allRows.length} Items`}
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
            href={`/${locale}/admin/vehicles`}
            className="inline-block mt-3 text-sm text-blue-600 hover:underline"
          >
            {locale === 'th' ? 'ไปหน้าหมวดหมู่ →' : 'Go to Categories →'}
          </Link>
        </div>
      )}
    </div>
  )
}
