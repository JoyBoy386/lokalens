import { Link, NavLink, useNavigate } from 'react-router-dom'
import { DEMO_MODE } from '../lib/supabase.js'
import { isOpenNow, hhmm } from '../lib/utils.js'
import { localizeMerchant, translateCategory, useLanguage } from '../lib/i18n.jsx'

const CAT_BG = {
  Makanan: 'from-orange-300 to-rose-400',
  'Minuman & Kopi': 'from-amber-300 to-orange-500',
  'Kuih & Pastri': 'from-pink-200 to-fuchsia-400',
  Kraftangan: 'from-teal-300 to-cyan-600',
  'Produk Tani': 'from-lime-300 to-green-600',
  Pengalaman: 'from-emerald-300 to-teal-700',
}

export function Cover({ m, className = 'h-36' }) {
  if (m.photos?.length) {
    return <img src={m.photos[0]} alt={m.name} className={`w-full object-cover ${className}`} />
  }
  return (
    <div className={`w-full bg-gradient-to-br ${CAT_BG[m.category] || CAT_BG.Makanan} flex items-center justify-center ${className}`}>
      <span className="text-5xl drop-shadow">{m.emoji || '🛍️'}</span>
    </div>
  )
}

export function SampleBadge() {
  const { t } = useLanguage()
  return (
    <span className="rounded-full bg-stone-900/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
      {t('Data contoh')}
    </span>
  )
}

export function OpenBadge({ m }) {
  const { t } = useLanguage()
  const open = isOpenNow(m)
  if (!m.open_time) return null
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${open ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
      {open ? t('Buka') : t('Ditutup')} · {hhmm(m.open_time)}–{hhmm(m.close_time)}
    </span>
  )
}

export function MerchantCard({ m }) {
  const { language, t } = useLanguage()
  m = localizeMerchant(m, language)
  return (
    <Link to={`/m/${m.id}`} className="block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 active:scale-[0.99] transition">
      <div className="relative">
        <Cover m={m} />
        {m.is_sample && <div className="absolute left-2 top-2"><SampleBadge /></div>}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-tight text-stone-900">{m.name}</h3>
          <OpenBadge m={m} />
        </div>
        <p className="mt-0.5 text-xs text-stone-500">{translateCategory(m.category, language)} · {m.town}, {m.district}</p>
        <p className="mt-1.5 line-clamp-2 text-sm text-stone-700">{m.description}</p>
        {m.review_count > 0 && (
          <p className="mt-2 text-sm font-bold text-amber-800">
            ★ {Number(m.avg_rating).toFixed(1)} <span className="font-medium text-stone-500">· {t('{count} ulasan', { count: m.review_count })}</span>
          </p>
        )}
      </div>
    </Link>
  )
}

export function Header({ title, back, right }) {
  const { t } = useLanguage()
  const nav = useNavigate()
  return (
    <header className="sticky top-10 z-20 flex items-center gap-2 bg-stone-50/90 px-4 py-3 backdrop-blur">
      {back && (
        <button onClick={() => nav(-1)} className="-ml-2 rounded-full p-2 text-xl active:bg-stone-200" aria-label={t('Kembali')}>←</button>
      )}
      <h1 className="flex-1 truncate text-lg font-extrabold text-stone-900">{title}</h1>
      {right}
    </header>
  )
}

export function DemoBanner() {
  const { t } = useLanguage()
  if (!DEMO_MODE) return null
  return (
    <div className="bg-amber-100 px-4 py-1.5 text-center text-[11px] font-medium text-amber-900">
      {t('Mod demo: data disimpan dalam pelayar ini, AI guna peraturan tempatan')}
    </div>
  )
}

export function BottomNav() {
  const { t } = useLanguage()
  const tabs = [
    { to: '/', label: t('Teroka'), icon: '🧭', end: true },
    { to: '/trip', label: 'AI Trip', icon: '✨' },
    { to: '/saved', label: t('Simpan'), icon: '❤️' },
    { to: '/peniaga', label: t('Peniaga'), icon: '🏪' },
  ]
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 grid w-full max-w-md -translate-x-1/2 grid-cols-4 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${isActive ? 'text-brand-700' : 'text-stone-500'}`
          }
        >
          <span className="text-xl leading-none">{t.icon}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  return (
    <div className="flex items-center gap-1 rounded-full bg-white p-1 text-xs font-bold ring-1 ring-stone-300" aria-label="Language">
      <button onClick={() => setLanguage('en')} aria-pressed={language === 'en'}
        className={`rounded-full px-3 py-1 ${language === 'en' ? 'bg-brand-700 text-white' : 'text-stone-600'}`}>
        EN
      </button>
      <button onClick={() => setLanguage('ms')} aria-pressed={language === 'ms'}
        className={`rounded-full px-3 py-1 ${language === 'ms' ? 'bg-brand-700 text-white' : 'text-stone-600'}`}>
        BM
      </button>
    </div>
  )
}
// Thumb-zone action bar. Sits above the bottom nav when the nav is visible.
export function ActionBar({ children, aboveNav = true }) {
  return (
    <div className={`fixed left-1/2 z-20 w-full max-w-md -translate-x-1/2 bg-gradient-to-t from-stone-50 via-stone-50 to-transparent px-4 pb-3 pt-6 ${aboveNav ? 'bottom-[58px]' : 'bottom-0 pb-[max(12px,env(safe-area-inset-bottom))]'}`}>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

export function Btn({ children, variant = 'primary', className = '', ...p }) {
  const v = {
    primary: 'bg-brand-700 text-white active:bg-brand-900 disabled:bg-stone-300',
    wa: 'bg-[#25D366] text-white active:brightness-90',
    ghost: 'bg-white text-stone-900 ring-1 ring-stone-300 active:bg-stone-100',
    dark: 'bg-stone-900 text-white active:bg-black',
  }[variant]
  return (
    <button className={`flex-1 rounded-2xl px-4 py-3.5 text-base font-bold shadow-sm transition disabled:shadow-none ${v} ${className}`} {...p}>
      {children}
    </button>
  )
}

export function Pills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-4 py-2.5 text-sm font-semibold ring-1 transition ${
            value === o.id ? 'bg-brand-700 text-white ring-brand-700' : 'bg-white text-stone-700 ring-stone-300'
          }`}
        >
          {o.emoji ? `${o.emoji} ` : ''}{o.label}
        </button>
      ))}
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={`shimmer rounded-xl ${className}`} />
}
