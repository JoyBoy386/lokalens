export const hhmm = (t) => (t ? String(t).slice(0, 5) : null)

export const toMin = (t) => {
  if (!t) return null
  const [h, m] = String(t).split(':').map(Number)
  return h * 60 + (m || 0)
}

export const fmtMin = (mins) => {
  const h = Math.floor(mins / 60) % 24
  const m = Math.round(mins % 60)
  const ap = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`
}

export function isOpenAt(m, mins) {
  const o = toMin(m.open_time), c = toMin(m.close_time)
  if (o == null || c == null) return true // unknown hours: do not block
  return mins >= o && mins <= c
}

export function isOpenNow(m) {
  const d = new Date()
  return isOpenAt(m, d.getHours() * 60 + d.getMinutes())
}

export function km(a, b) {
  const R = 6371, rad = (x) => (x * Math.PI) / 180
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng)
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

// "012-345 6789" -> "60123456789"
export function normalizePhone(raw) {
  let d = String(raw || '').replace(/\D/g, '')
  if (d.startsWith('0')) d = '6' + d
  if (!d.startsWith('60') && d.length >= 9) d = '60' + d
  return d
}

// Sample listings have no real number. They open WhatsApp's share picker
// so a demo tap never messages a stranger.
export const waLink = (m, text) => {
  const msg = encodeURIComponent(
    text || `Salam ${m.name}, saya jumpa kedai anda di LOKALENS Perak. Boleh saya tanya tentang produk anda?`
  )
  return m.is_sample || !m.phone ? `https://wa.me/?text=${msg}` : `https://wa.me/${m.phone}?text=${msg}`
}

export const mapsLink = (m) => {
  const query = m.address?.trim() || (m.lat != null && m.lng != null ? `${m.lat},${m.lng}` : `${m.town || ''}, ${m.district}`)
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + Math.random().toString(16).slice(2))
