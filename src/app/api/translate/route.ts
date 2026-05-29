import { NextRequest, NextResponse } from 'next/server'

// Try translate-google first, fall back to @vitalets/google-translate-api
async function translateText(text: string): Promise<string> {
  // Try 1: translate-google (lightweight, no config needed)
  try {
    const translate = await import('translate-google')
    const result = await translate.default(text.substring(0, 500), { from: 'th', to: 'en' })
    if (result && result !== text) return result
  } catch {
    // fall through
  }

  // Try 2: @vitalets/google-translate-api (more robust, different backend)
  try {
    const { translate } = await import('@vitalets/google-translate-api')
    const { text: result } = await translate(text.substring(0, 500), { from: 'th', to: 'en' })
    if (result && result !== text) return result
  } catch {
    // fall through
  }

  // All failed — return empty so caller knows it wasn't translated
  return ''
}

export async function POST(req: NextRequest) {
  try {
    const { texts } = await req.json()
    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts array required' }, { status: 400 })
    }

    const results: string[] = []
    for (const text of texts) {
      try {
        const translated = await translateText(text)
        results.push(translated || '') // empty string = translation failed
      } catch {
        results.push('') // failed
      }
    }

    return NextResponse.json({ translations: results })
  } catch (err: any) {
    console.error('Translate error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
