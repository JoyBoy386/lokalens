import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMerchants, listHighlights } from '../lib/api.js'
import { CATEGORIES, DISTRICTS } from '../data/seed.js'
import { MerchantCard, Skeleton, SampleBadge } from '../components/ui.jsx'
import { localizeHighlight, localizeMerchant, translateCategory, useLanguage } from '../lib/i18n.jsx'
import SpilloverExplorer from '../components/SpilloverExplorer.jsx'
import TopRatedMerchants from '../components/TopRatedMerchants.jsx'

export default function Explore() {
  const { language, t } = useLanguage()
  const [items, setItems] = useState(null)
  const [highlights, setHighlights] = useState([])
  const [district, setDistrict] = useState('all')
  const [cat, setCat] = useState(null)
  const [q, setQ] = useState('')
  const [err, setErr] = useState(null)

  useEffect(() => {
    listMerchants().then(setItems).catch((e) => setErr(e.message))
    listHighlights().then(setHighlights).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (!items) return null
    const s = q.trim().toLowerCase()
    return items.filter((original) => {
      const m = localizeMerchant(original, language)
      return (district === 'all' || m.district === district) &&
      (!cat || original.category === cat) &&
      (!s || [m.name, m.description, m.town, ...(m.products || [])].join(' ').toLowerCase().includes(s))
    })
  }, [items, district, cat, q, language])

  const hl = highlights.filter((h) => district === 'all' || h.district === district)

  return (
    <div>
      <div className="bg-brand-700 px-4 pb-5 pt-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-100">LOKALENS Perak</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight">{t('Teroka daerah. Jumpa peniaga tempatan.')}</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('Cari laksa, labu sayong, kopi…')}
          className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-base text-stone-900 outline-none placeholder:text-stone-400"
        />
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-2xl bg-brand-900/40 p-1">
          {['all', ...DISTRICTS].map((d) => (
            <button
              key={d}
              onClick={() => setDistrict(d)}
              className={`rounded-xl py-2 text-sm font-bold ${district === d ? 'bg-white text-brand-900' : 'text-white'}`}
            >
              {d === 'all' ? t('Semua') : d}
            </button>
          ))}
        </div>
      </div>

      <TopRatedMerchants />

      {hl.length > 0 && (
        <section className="mt-4">
          <div className="flex items-center justify-between px-4">
            <h2 className="font-extrabold text-stone-900">{t('Sorotan Daerah')}</h2>
            <span className="text-[11px] text-stone-500">{t('Ringkasan AI')}</span>
          </div>
          <div className="no-scrollbar mt-2 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
            {hl.map((original) => {
              const h = localizeHighlight(original, language)
              return (
              <div key={h.id} className="w-64 shrink-0 snap-start rounded-2xl bg-gold-400/20 p-3 ring-1 ring-gold-400/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase text-amber-800">{h.district}</span>
                  {h.is_sample && <SampleBadge />}
                </div>
                <p className="mt-1 font-bold leading-snug text-stone-900">{h.title}</p>
                <p className="mt-1 text-sm text-stone-700">{h.summary}</p>
              </div>
            )})}
          </div>
        </section>
      )}

      {items && <SpilloverExplorer merchants={items} />}

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(cat === c ? null : c)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 ${cat === c ? 'bg-stone-900 text-white ring-stone-900' : 'bg-white text-stone-700 ring-stone-300'}`}
          >
            {translateCategory(c, language)}
          </button>
        ))}
      </div>

      <section className="mt-4 space-y-3 px-4">
        {err && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{t('Gagal memuat data: {error}', { error: err })}</p>}
        {!filtered && !err && [0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)}
        {filtered?.length === 0 && (
          <p className="py-10 text-center text-stone-500">{t('Tiada padanan. Cuba kategori atau daerah lain.')}</p>
        )}
        {filtered?.map((m) => <MerchantCard key={m.id} m={m} />)}
        {filtered && (
          <Link to="/trip" className="block rounded-2xl bg-stone-900 p-4 text-white">
            <p className="font-bold">{t('✨ Tak pasti nak ke mana?')}</p>
            <p className="text-sm text-stone-300">{t('Jana laluan sehari dengan AI Trip Planner.')}</p>
          </Link>
        )}
      </section>
    </div>
  )
}
