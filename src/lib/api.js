// One data layer, two backends.
// DEMO_MODE: localStorage store seeded with sample data.
// Supabase mode: Postgres + Storage + anonymous auth + edge function "ai".
import { supabase, DEMO_MODE } from './supabase.js'
import { SEED_MERCHANTS, SEED_HIGHLIGHTS } from '../data/seed.js'
import { mockProfile, mockHighlight } from './mockAi.js'
import { planTrip, validatePlan } from './planner.js'
import { uid } from './utils.js'

/* ---------------- demo store ---------------- */
const KEY = 'lokalens_db_v1'
const memory = {} // fallback when storage is blocked
const DEMO_REVIEWS = [
  { id: 'demo-review-1', merchant_id: 'a1000000-0000-4000-8000-000000000007', visitor_name: 'Pelawat contoh', rating: 5, comment: 'Hasil labu sayong yang cantik dan penerangan proses yang menarik.', created_at: '2026-01-03T00:00:00.000Z', is_sample: true },
  { id: 'demo-review-2', merchant_id: 'a1000000-0000-4000-8000-000000000007', visitor_name: 'Pelawat contoh', rating: 5, comment: 'Pengalaman melihat kraftangan tempatan secara dekat.', created_at: '2026-01-02T00:00:00.000Z', is_sample: true },
  { id: 'demo-review-3', merchant_id: 'a1000000-0000-4000-8000-000000000007', visitor_name: 'Pelawat contoh', rating: 4, comment: 'Cenderamata warisan yang unik.', created_at: '2026-01-01T00:00:00.000Z', is_sample: true },
  { id: 'demo-review-4', merchant_id: 'a1000000-0000-4000-8000-000000000009', visitor_name: 'Pelawat contoh', rating: 5, comment: 'Laksa sedap dengan rasa resipi keluarga.', created_at: '2026-01-03T00:00:00.000Z', is_sample: true },
  { id: 'demo-review-5', merchant_id: 'a1000000-0000-4000-8000-000000000009', visitor_name: 'Pelawat contoh', rating: 5, comment: 'Singgah makan yang berbaloi di Kuala Kangsar.', created_at: '2026-01-02T00:00:00.000Z', is_sample: true },
  { id: 'demo-review-6', merchant_id: 'a1000000-0000-4000-8000-000000000009', visitor_name: 'Pelawat contoh', rating: 4, comment: 'Makanan tempatan yang menyelerakan.', created_at: '2026-01-01T00:00:00.000Z', is_sample: true },
]

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const db = JSON.parse(raw)
      if (!Array.isArray(db.reviews)) db.reviews = DEMO_REVIEWS
      return db
    }
  } catch { if (memory.db) return memory.db }
  const db = { merchants: SEED_MERCHANTS, events: [], highlights: SEED_HIGHLIGHTS, reviews: DEMO_REVIEWS, myMerchantId: null }
  save(db)
  return db
}
function save(db) {
  memory.db = db
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* in-memory only */ }
}
export function resetDemo() {
  try { localStorage.removeItem(KEY) } catch {}
  delete memory.db
}

const fileToDataUrl = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.onerror = rej
    r.readAsDataURL(file)
  })

// Shrink photos before storing (keeps demo storage and uploads small).
async function compress(file, max = 1000) {
  const url = await fileToDataUrl(file)
  const img = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = url })
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = img.width * scale; c.height = img.height * scale
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return new Promise((res) => c.toBlob((b) => res(b), 'image/jpeg', 0.8))
}

/* ---------------- auth ---------------- */
async function ensureUser() {
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.user
  const { data: d2, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return d2.user
}

/* ---------------- merchants ---------------- */
export async function listMerchants() {
  if (DEMO_MODE) {
    const db = load()
    return db.merchants.filter((m) => m.is_published).map((m) => withReviewStats(m, db.reviews))
  }
  const { data, error } = await supabase.from('merchants').select('*').eq('is_published', true).order('created_at')
  if (error) throw error
  return data
}

export async function getMerchant(id) {
  if (DEMO_MODE) {
    const db = load()
    const merchant = db.merchants.find((m) => m.id === id)
    return merchant ? withReviewStats(merchant, db.reviews) : null
  }
  const { data, error } = await supabase.from('merchants').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function myMerchant() {
  if (DEMO_MODE) {
    const db = load()
    const merchant = db.merchants.find((m) => m.id === db.myMerchantId)
    return merchant ? withReviewStats(merchant, db.reviews) : null
  }
  const { data: s } = await supabase.auth.getSession()
  if (!s.session) return null
  const { data } = await supabase.from('merchants').select('*').eq('owner_id', s.session.user.id).maybeSingle()
  return data
}

export async function createMerchant(fields, files = []) {
  if (DEMO_MODE) {
    const photos = []
    for (const f of files) photos.push(await fileToDataUrl(await compress(f, 700)))
    const db = load()
    const m = { ...fields, id: uid(), photos, is_sample: false, is_published: true, created_at: new Date().toISOString() }
    db.merchants.push(m)
    db.myMerchantId = m.id
    save(db)
    return m
  }
  const user = await ensureUser()
  const photos = []
  for (const f of files) {
    const path = `${user.id}/${uid()}.jpg`
    const { error } = await supabase.storage.from('photos').upload(path, await compress(f), { contentType: 'image/jpeg' })
    if (error) throw error
    photos.push(supabase.storage.from('photos').getPublicUrl(path).data.publicUrl)
  }
  const { data, error } = await supabase
    .from('merchants')
    .insert({ ...fields, photos, owner_id: user.id, is_sample: false, is_published: true })
    .select()
    .single()
  if (error) throw error
  return data
}

function withReviewStats(merchant, reviews) {
  const merchantReviews = reviews.filter((review) => review.merchant_id === merchant.id)
  const average = merchantReviews.length
    ? merchantReviews.reduce((sum, review) => sum + Number(review.rating), 0) / merchantReviews.length
    : 0
  return { ...merchant, avg_rating: average, review_count: merchantReviews.length }
}

export async function listReviews(merchantId) {
  if (DEMO_MODE) {
    return load().reviews
      .filter((review) => review.merchant_id === merchantId)
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, 5)
  }
  const { data, error } = await supabase.from('reviews')
    .select('id, merchant_id, visitor_name, rating, comment, created_at')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(5)
  if (error) throw error
  return data || []
}

export async function submitReview({ merchantId, visitorName, rating, comment }) {
  const name = visitorName.trim()
  const text = comment.trim()
  if (name.length < 1 || name.length > 60) throw new Error('Name must be between 1 and 60 characters.')
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5.')
  if (text.length > 1000) throw new Error('Review must be 1000 characters or fewer.')

  if (DEMO_MODE) {
    const db = load()
    if (!db.merchants.some((merchant) => merchant.id === merchantId && merchant.is_published)) {
      throw new Error('This merchant is not available for reviews.')
    }
    db.reviews.push({
      id: uid(),
      merchant_id: merchantId,
      visitor_name: name,
      rating,
      comment: text || null,
      created_at: new Date().toISOString(),
    })
    save(db)
    return
  }
  const { error } = await supabase.from('reviews').insert({
    merchant_id: merchantId,
    visitor_name: name,
    rating,
    comment: text || null,
  })
  if (error) throw error
}

export async function listTopRatedMerchants() {
  if (DEMO_MODE) {
    const db = load()
    return db.merchants
      .filter((merchant) => merchant.is_published)
      .map((merchant) => withReviewStats(merchant, db.reviews))
      .filter((merchant) => merchant.avg_rating >= 4 && merchant.review_count >= 3)
      .sort((a, b) => b.avg_rating - a.avg_rating || b.review_count - a.review_count)
      .slice(0, 6)
  }
  const { data, error } = await supabase.from('merchants')
    .select('id, name, district, town, category, description, products, tags, open_time, close_time, open_days, lat, lng, phone, emoji, photos, is_sample, is_published, avg_rating, review_count')
    .eq('is_published', true)
    .gte('avg_rating', 4)
    .gte('review_count', 3)
    .order('avg_rating', { ascending: false })
    .order('review_count', { ascending: false })
    .limit(6)
  if (error) throw error
  return data || []
}

/* ---------------- analytics ---------------- */
const seenKey = (id) => `lokalens_seen_${id}`

export async function logEvent(merchantId, type) {
  // Count one view per merchant per browser session.
  if (type === 'view') {
    try {
      if (sessionStorage.getItem(seenKey(merchantId))) return
      sessionStorage.setItem(seenKey(merchantId), '1')
    } catch {}
  }
  if (DEMO_MODE) {
    const db = load()
    db.events.push({ merchant_id: merchantId, type, created_at: new Date().toISOString() })
    save(db)
    return
  }
  const { error } = await supabase.from('events').insert({ merchant_id: merchantId, type })
  if (error) throw error
}

export async function getStats(merchantId) {
  if (DEMO_MODE) {
    const now = Date.now(), wk = 7 * 864e5
    const ev = load().events.filter((e) => e.merchant_id === merchantId)
    const count = (type, from, to) =>
      ev.filter((e) => e.type === type && now - Date.parse(e.created_at) >= from && now - Date.parse(e.created_at) < to).length
    return {
      views_7d: count('view', 0, wk), wa_7d: count('whatsapp', 0, wk), nav_7d: count('navigate', 0, wk),
      views_prev: count('view', wk, 2 * wk), wa_prev: count('whatsapp', wk, 2 * wk),
      views_total: ev.filter((e) => e.type === 'view').length,
      wa_total: ev.filter((e) => e.type === 'whatsapp').length,
    }
  }
  const { data, error } = await supabase.rpc('merchant_stats', { mid: merchantId })
  if (error) throw error
  return data?.[0] || data
}

const DEMO_GOV_BASELINE = [
  { district: 'Kinta', town: 'Ipoh', profile_views: 264, whatsapp_clicks: 48, navigation_clicks: 67 },
  { district: 'Kinta', town: 'Batu Gajah', profile_views: 138, whatsapp_clicks: 29, navigation_clicks: 34 },
  { district: 'Kinta', town: 'Tambun', profile_views: 182, whatsapp_clicks: 32, navigation_clicks: 51 },
  { district: 'Kinta', town: 'Gopeng', profile_views: 96, whatsapp_clicks: 21, navigation_clicks: 28 },
  { district: 'Kuala Kangsar', town: 'Kuala Kangsar', profile_views: 211, whatsapp_clicks: 43, navigation_clicks: 58 },
  { district: 'Kuala Kangsar', town: 'Kampung Sayong', profile_views: 127, whatsapp_clicks: 26, navigation_clicks: 39 },
]

export async function getGovAnalytics() {
  if (DEMO_MODE) {
    const db = load()
    const liveCounts = new Map()
    for (const event of db.events) {
      if (Date.now() - Date.parse(event.created_at) > 30 * 864e5) continue
      const merchant = db.merchants.find((m) => m.id === event.merchant_id)
      if (!merchant?.is_published) continue
      const key = `${merchant.district}\u0000${merchant.town || 'Unknown'}`
      const count = liveCounts.get(key) || { profile_views: 0, whatsapp_clicks: 0, navigation_clicks: 0 }
      if (event.type === 'view') count.profile_views += 1
      if (event.type === 'whatsapp') count.whatsapp_clicks += 1
      if (event.type === 'navigate') count.navigation_clicks += 1
      liveCounts.set(key, count)
    }
    return {
      source: 'demo',
      rows: DEMO_GOV_BASELINE.map((row) => {
        const live = liveCounts.get(`${row.district}\u0000${row.town}`)
        return live ? {
          ...row,
          profile_views: row.profile_views + live.profile_views,
          whatsapp_clicks: row.whatsapp_clicks + live.whatsapp_clicks,
          navigation_clicks: row.navigation_clicks + live.navigation_clicks,
        } : row
      }),
    }
  }
  const { data, error } = await supabase.rpc('gov_analytics')
  if (error) throw error
  return { source: 'supabase', rows: data || [] }
}

/* ---------------- highlights ---------------- */
export async function listHighlights() {
  if (DEMO_MODE) return load().highlights
  const { data, error } = await supabase.from('highlights').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/* ---------------- AI ---------------- */
async function invoke(body) {
  const { data, error } = await supabase.functions.invoke('ai', { body })
  if (error) {
    let msg = error.message
    try { const b = await error.context.json(); if (b?.error) msg = b.error } catch {}
    throw new Error(msg)
  }
  if (data?.error) throw new Error(data.error)
  return data
}

export async function aiProfile({ notes, district, language = 'ms' }) {
  if (DEMO_MODE) {
    return mockProfile({ notes, district, language })
  }
  try {
    return { ...(await invoke({ action: 'profile', notes, district, language })), source: 'ai' }
  } catch (e) {
    console.warn('AI profile failed, using rules', e)
    return mockProfile({ notes, district, language })
  }
}

export async function aiTrip({ start, duration, vibe, prompt = '', language = 'ms' }) {
  const merchants = await listMerchants()
  const travelerPrompt = String(prompt).trim().slice(0, 300)
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1200))
    return { ...planTrip({ start, duration, vibe, prompt: travelerPrompt, merchants, language }), merchants }
  }
  try {
    const plan = validatePlan(
      await invoke({ action: 'trip', start, duration, vibe, prompt: travelerPrompt, language }),
      { start, duration, merchants },
    )
    if (plan) return { ...plan, source: 'ai', merchants }
  } catch (e) {
    console.warn('AI trip failed, using rules', e)
  }
  return { ...planTrip({ start, duration, vibe, prompt: travelerPrompt, merchants, language }), merchants }
}

// Step 1: AI summarises the admin's raw announcement. Nothing is saved.
export async function aiHighlight({ text, district, language = 'ms' }) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 900))
    return mockHighlight({ text, language })
  }
  try {
    return { ...(await invoke({ action: 'highlight', text, district, language })), source: 'ai' }
  } catch (e) {
    console.warn('AI highlight failed, using rules', e)
    return mockHighlight({ text, language })
  }
}

// Step 2: admin reviews and publishes. Passcode is checked on the server.
export async function publishHighlight({ district, title, summary, passcode }) {
  if (DEMO_MODE) {
    const db = load()
    db.highlights.unshift({ id: uid(), district, title, summary, is_sample: true, created_at: new Date().toISOString() })
    save(db)
    return
  }
  await invoke({ action: 'publish_highlight', district, title, summary, passcode })
}
