// Common typo / synonym dictionary for Thai auto parts search
// Supports: brand typos, Thai↔English, common misspellings

export const SEARCH_SYNONYMS: Record<string, string[]> = {
  // --- Brands ---
  'honda': ['honda', 'hond', 'hoda', 'honna', 'ฮอนด้า', 'ฮอนดา'],
  'toyota': ['toyota', 'toyot', 'totoya', 'tyota', 'โตโยต้า', 'โตโยต้า'],
  'isuzu': ['isuzu', 'isuz', 'isusu', 'อีซูซุ', 'อีซุซุ'],
  'nissan': ['nissan', 'nissna', 'nissun', 'นิสสัน'],
  'mitsubishi': ['mitsubishi', 'mitsubish', 'mitshubishi', 'มิตรซูบิชิ', 'มิตซูบิชิ'],
  'mazda': ['mazda', 'mazd', 'มาสด้า', 'มาสดา'],
  'ford': ['ford', 'ford', 'ฟอร์ด'],
  'bosch': ['bosch', 'bosch', 'bosh', 'บอช'],
  'denso': ['denso', 'denso', 'dnso', 'เดนโซ่'],

  // --- Parts / Categories ---
  'brake': ['brake', 'break', 'เบรก', 'เบรค', 'ผ้าเบรก'],
  'filter': ['filter', 'filtre', 'กรอง', 'ไส้กรอง', 'กรองอากาศ'],
  'oil': ['oil', 'oil', 'น้ำมัน', 'น้ำมันเครื่อง'],
  'wiper': ['wiper', 'wiper', 'wipper', 'ปัดน้ำฝน', 'ที่ปัดน้ำฝน', 'ใบปัด'],
  'suspension': ['suspension', 'suspenssion', 'ช่วงล่าง', 'โช๊ค', 'โช้ค'],
  'engine': ['engine', 'engin', 'enigne', 'เครื่องยนต์', 'เครื่อง'],
  'light': ['light', 'lght', 'ไฟ', 'ไฟหน้า', 'ไฟท้าย', 'โคมไฟ'],
  'battery': ['battery', 'battey', 'batery', 'แบต', 'แบตเตอรี่', 'แบตเตอร์รี่'],
  'clutch': ['clutch', 'cluth', 'cltch', 'คลัทช์', 'คลัตซ์'],
  'radiator': ['radiator', 'raditor', 'radaitor', 'หม้อน้ำ'],
  'bumper': ['bumper', 'bummper', 'bumpper', 'กันชน'],
  'mirror': ['mirror', 'miror', 'mirr', 'กระจกข้าง', 'กระจกมองข้าง'],

  // --- Models ---
  'civic': ['civic', 'civik', 'ซีวิค', 'ซีวิก'],
  'city': ['city', 'ctiy', 'ซิตี้'],
  'accord': ['accord', 'acord', 'accord', 'แอคคอร์ด'],
  'jazz': ['jazz', 'jaz', 'jasz', 'แจ๊ส'],
  'ranger': ['ranger', 'ranger', 'เรนเจอร์'],
  'hilux': ['hilux', 'hilux', 'hilx', 'hi-lux', 'ไฮลักซ์'],
  'fortuner': ['fortuner', 'fortunner', 'ฟอจูนเนอร์'],
  'dmax': ['dmax', 'd-max', 'ดีแมก', 'ดีแม็ก'],
  'mu-x': ['mu-x', 'mux', 'mu x', 'มิวเอ็กซ์'],
  'vios': ['vios', 'vios', 'วีออส'],
  'yaris': ['yaris', 'yarris', 'ยาริส'],
  'altis': ['altis', 'alti', 'อัลติส'],
  'camry': ['camry', 'camary', 'camri', 'แคมรี่'],
}

/**
 * Expand a search term into all synonym variants.
 * If no synonyms found, returns the term as-is.
 */
export function expandSearchTerms(raw: string): string[] {
  const terms = raw.trim().split(/\s+/).filter(Boolean)
  return terms.flatMap(term => {
    const lower = term.toLowerCase()
    for (const [, synonyms] of Object.entries(SEARCH_SYNONYMS)) {
      if (synonyms.some(s => s.toLowerCase() === lower)) {
        return [...new Set(synonyms.map(s => s.toLowerCase()))]
      }
    }
    return [lower]
  })
}

/**
 * Build Supabase .or() condition string from expanded search terms.
 * @deprecated Use applySearch() instead for proper multi-term AND semantics.
 */
export function buildSearchOr(searchText: string): string {
  const terms = expandSearchTerms(searchText)
  return terms.map(term =>
    `name_th.ilike.%${term}%,name_en.ilike.%${term}%,sku.ilike.%${term}%,description_th.ilike.%${term}%,description_en.ilike.%${term}%`
  ).join(',')
}

/**
 * Apply multi-term search to a Supabase query with AND semantics.
 * Each original search term becomes its own .or() group (expanded with synonyms),
 * and chained .or() calls act as AND filters between groups.
 *
 * "ใบปัด city" → matches (wiper synonyms) AND (city synonyms)
 */
export function applySearch(query: any, searchText: string): any {
  const rawTerms = searchText.trim().split(/\s+/).filter(Boolean)
  for (const raw of rawTerms) {
    const lower = raw.toLowerCase()
    // Find matching synonym group, or use the term as-is
    let synonyms: string[] = [lower]
    for (const [, syns] of Object.entries(SEARCH_SYNONYMS)) {
      if (syns.some(s => s.toLowerCase() === lower)) {
        synonyms = syns
        break
      }
    }
    // Build OR conditions within this term group
    const conditions = synonyms.map(s =>
      `name_th.ilike.%${s}%,name_en.ilike.%${s}%,sku.ilike.%${s}%,description_th.ilike.%${s}%,description_en.ilike.%${s}%`
    ).join(',')
    query = query.or(conditions)
  }
  return query
}
