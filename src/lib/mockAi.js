// Rule-based stand-in for the AI. Runs with no API key so the demo never breaks.
import { CATEGORIES } from '../data/seed.js'

const CAT_RULES = [
  ['Minuman & Kopi', /kopi|teh|air|jus|minuman|coffee/i],
  ['Kuih & Pastri', /kuih|kek|roti|pastri|tau fu fa|biskut|cake/i],
  ['Kraftangan', /labu|batik|tekat|anyam|kraf|tenun|ukir|sulam|craft/i],
  ['Produk Tani', /kebun|buah|sayur|madu|limau|durian|tani|ladang/i],
  ['Pengalaman', /trek|tour|pandu|kayak|kelas|bengkel|homestay|lawatan/i],
  ['Makanan', /nasi|mee|laksa|goreng|sate|ayam|ikan|makan|sup|rendang/i],
]

const TAGS = {
  Makanan: ['foodie'], 'Minuman & Kopi': ['foodie', 'chill'], 'Kuih & Pastri': ['foodie'],
  Kraftangan: ['culture'], 'Produk Tani': ['nature', 'foodie'], Pengalaman: ['nature'],
}

const HOURS = [
  [/pagi|morning|sarapan/i, '07:00', '12:00'],
  [/tengah hari|lunch/i, '11:00', '15:00'],
  [/petang|evening/i, '15:00', '19:00'],
  [/malam|night/i, '18:00', '23:00'],
]

const cap = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase())

export function mockProfile({ notes, district, language = 'ms' }) {
  const text = notes.trim()
  const category = (CAT_RULES.find(([, re]) => re.test(text)) || ['Makanan'])[0]
  const hours = HOURS.find(([re]) => re.test(text))

  // Product = words before the first filler word.
  const head = text
    .replace(/^(jual|menjual|selling)\s+/i, '')
    .split(/\b(sedap|depan|di|buka|dekat|tepi|murah|best|open|in|near|at|every|kt|kat)\b/i)[0]
    .trim()
  const product = cap(head.split(/\s+/).slice(0, 3).join(' ') || 'Produk tempatan')
  const placeMatch = text.match(/\b(?:depan|di|dekat|tepi|in|near|at|kt|kat)\s+(kuala kangsar|batu gajah|ipoh|tambun)\b/i)
  const place = placeMatch?.[1].replace(/\b\w/g, (letter) => letter.toUpperCase())
  const where = place ? `di ${place}` : null
  const locationEn = place ? `in ${place}` : null
  const weekday = /\bsabtu\b|\bsaturday\b/i.test(text)
  const sunday = /\bahad\b|\bsunday\b/i.test(text)
  const openDays = weekday && sunday
    ? (language === 'en' ? 'Saturday and Sunday' : 'Sabtu dan Ahad')
    : weekday
      ? (language === 'en' ? 'Saturday' : 'Sabtu')
      : sunday
        ? (language === 'en' ? 'Sunday' : 'Ahad')
        : null
  const periodEn = hours && (
    /pagi|morning/i.test(hours[0].source) ? 'morning' :
    /tengah hari|lunch/i.test(hours[0].source) ? 'midday' :
    /petang|evening/i.test(hours[0].source) ? 'afternoon' : 'evening'
  )
  const periodMs = hours && (
    /pagi|morning/i.test(hours[0].source) ? 'pagi' :
    /tengah hari|lunch/i.test(hours[0].source) ? 'tengah hari' :
    /petang|evening/i.test(hours[0].source) ? 'petang' : 'malam'
  )

  const desc = language === 'en'
    ? [
      `${product} is made locally ${locationEn || `in ${district}`}.`,
      openDays ? `Open on ${openDays}.` : hours ? `Open in the ${periodEn}.` : null,
      'Contact the merchant on WhatsApp for orders or enquiries.',
    ].filter(Boolean).join(' ')
    : [
      `${product} buatan tempatan${where ? ` ${where}` : ` di daerah ${district}`}.`,
      openDays ? `Buka pada ${openDays}.` : hours ? `Buka waktu ${periodMs}.` : null,
      'Hubungi melalui WhatsApp untuk tempahan atau pertanyaan.',
    ].filter(Boolean).join(' ')

  return {
    name: product,
    category: CATEGORIES.includes(category) ? category : 'Makanan',
    description: desc,
    products: [product],
    tags: TAGS[category] || ['foodie'],
    open_time: hours ? hours[1] : null,
    close_time: hours ? hours[2] : null,
    open_days: openDays,
    source: 'rules',
  }
}

export function mockHighlight({ text }) {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s/).filter(Boolean)
  const title = (sentences[0] || text).split(/\s+/).slice(0, 6).join(' ').replace(/[.!?]$/, '')
  return {
    title,
    summary: sentences.slice(0, 2).join(' ').slice(0, 180),
    source: 'rules',
  }
}
