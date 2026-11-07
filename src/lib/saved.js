import { useEffect, useState } from 'react'

const KEY = 'lokalens_saved'
let cache = null
const read = () => {
  if (cache) return cache
  try { cache = JSON.parse(localStorage.getItem(KEY) || '[]') } catch { cache = [] }
  return cache
}
const listeners = new Set()

export function toggleSaved(id) {
  const cur = read()
  cache = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
  try { localStorage.setItem(KEY, JSON.stringify(cache)) } catch {}
  listeners.forEach((fn) => fn(cache))
}

export function useSaved() {
  const [ids, setIds] = useState(read)
  useEffect(() => {
    listeners.add(setIds)
    return () => listeners.delete(setIds)
  }, [])
  return ids
}
