// Rule-based day-trip planner.
// Used in demo mode and as the safety net when the AI reply fails validation.
import { STARTS } from '../data/seed.js'
import { km, isOpenAt } from './utils.js'

export const DURATIONS = {
  '2h': { label: '2 Jam', stops: 2, minutes: 120, startAt: 10 * 60 },
  half: { label: 'Separuh Hari', stops: 3, minutes: 300, startAt: 9 * 60 },
  full: { label: 'Sehari Penuh', stops: 5, minutes: 540, startAt: 8 * 60 + 30 },
}

const STAY = { Makanan: 40, 'Minuman & Kopi': 40, 'Kuih & Pastri': 30, Kraftangan: 60, 'Produk Tani': 45, Pengalaman: 120 }

const REASON = {
  foodie: 'Rasa tempatan untuk senarai makan anda.',
  culture: 'Lihat kraf warisan dari tangan pembuatnya.',
  nature: 'Udara segar dan pemandangan alam.',
  chill: 'Tempat santai untuk berehat seketika.',
}
const REASON_EN = {
  foodie: 'Try local flavours for your food list.',
  culture: 'Discover traditional crafts made by local artisans.',
  nature: 'Enjoy fresh air and natural scenery.',
  chill: 'A relaxing place to take a break.',
}

export function planTrip({ start, duration, vibe, prompt = '', merchants, language = 'ms' }) {
  const origin = STARTS[start] || STARTS.Ipoh
  const d = DURATIONS[duration] || DURATIONS.half
  const preference = String(prompt).toLocaleLowerCase()
  // Day trips stay inside the starting district.
  let pool = merchants.filter((m) => m.district === origin.district && m.lat && m.lng)
  const score = (m) => {
    const merchantText = [
      m.name,
      m.category,
      m.description,
      ...(m.products || []),
      ...(m.tags || []),
    ].join(' ').toLocaleLowerCase()
    const promptMatches = preference
      ? preference.split(/[^\p{L}\p{N}]+/u)
        .filter((word) => word.length > 2 && merchantText.includes(word))
        .length
      : 0
    return (m.tags?.includes(vibe) ? 2 : 0) + Math.min(promptMatches, 5) * 1.5
  }

  const stops = []
  let cur = origin
  let t = d.startAt
  const end = d.startAt + d.minutes

  while (stops.length < d.stops && pool.length) {
    const options = pool
      .map((m) => {
        const dist = km(cur, m)
        const travel = Math.round((dist / 40) * 60) + 5
        return { m, dist, travel, arrive: t + travel, cost: dist - score(m) * 6 }
      })
      .filter((o) => isOpenAt(o.m, o.arrive))
      .sort((a, b) => a.cost - b.cost)

    const pick = options[0]
    if (!pick) break
    const stay = STAY[pick.m.category] || 45
    if (pick.arrive + stay > end + 30) break

    stops.push({
      merchant_id: pick.m.id,
      time_min: pick.arrive,
      travel_min: pick.travel,
      stay_min: stay,
      reason: pick.m.tags?.includes(vibe)
        ? (language === 'en' ? REASON_EN[vibe] : REASON[vibe])
        : (language === 'en' ? 'A stop along your route.' : 'Singgah sepanjang laluan anda.'),
    })
    t = pick.arrive + stay
    cur = pick.m
    pool = pool.filter((m) => m.id !== pick.m.id)
  }

  return {
    stops,
    summary: language === 'en'
      ? (stops.length
        ? `${stops.length} stops around ${start}, arranged by distance and opening hours.`
        : `No shops are open for this option around ${start}. Try another duration.`)
      : (stops.length
        ? `${stops.length} hentian di sekitar ${start}, disusun ikut jarak dan waktu buka.`
        : `Tiada kedai buka untuk pilihan ini di sekitar ${start}. Cuba tempoh lain.`),
    source: 'rules',
  }
}

// The AI picks and orders stops. Code computes the clock times,
// so the timeline never shows invented hours or travel times.
export function validatePlan(plan, { start, duration, merchants }) {
  const byId = Object.fromEntries(merchants.map((m) => [m.id, m]))
  const seen = new Set()
  const picks = (plan?.stops || []).filter((s) => byId[s.merchant_id] && !seen.has(s.merchant_id) && seen.add(s.merchant_id))
  if (!picks.length) return null

  const origin = STARTS[start] || STARTS.Ipoh
  const d = DURATIONS[duration] || DURATIONS.half
  let cur = origin
  let t = d.startAt
  const stops = []
  for (const p of picks.slice(0, d.stops)) {
    const m = byId[p.merchant_id]
    const travel = Math.round((km(cur, m) / 40) * 60) + 5
    const arrive = t + travel
    if (!isOpenAt(m, arrive)) continue // AI ignored opening hours: drop the stop
    const stay = STAY[m.category] || 45
    stops.push({ merchant_id: m.id, time_min: arrive, travel_min: travel, stay_min: stay, reason: String(p.reason || '').slice(0, 160) })
    t = arrive + stay
    cur = m
  }
  return stops.length ? { summary: plan.summary || '', stops } : null
}
