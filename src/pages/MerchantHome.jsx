import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStats, myMerchant, resetDemo } from '../lib/api.js'
import { DEMO_MODE } from '../lib/supabase.js'
import { ActionBar, Btn, Cover, Skeleton } from '../components/ui.jsx'
import { useLanguage } from '../lib/i18n.jsx'

function Trend({ now, prev }) {
  const { t } = useLanguage()
  if (!now && !prev) return null
  if (now > prev) return <span className="text-sm font-bold text-emerald-400">▲ {now - prev} {t('dari minggu lepas')}</span>
  if (now === prev) return <span className="text-sm text-stone-400">{t('Sama seperti minggu lepas')}</span>
  return <span className="text-sm text-stone-400">{t('Minggu lepas: {count}', { count: prev })}</span>
}

function Dashboard({ m }) {
  const { t } = useLanguage()
  const [s, setS] = useState(null)
  const [askReset, setAskReset] = useState(false)
  useEffect(() => {
    getStats(m.id).then(setS)
    const t = setInterval(() => getStats(m.id).then(setS), 5000) // live refresh for the demo
    return () => clearInterval(t)
  }, [m.id])

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 overflow-hidden rounded-2xl"><Cover m={m} className="h-14" /></div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-stone-500">{t('Kedai anda')}</p>
          <h1 className="truncate text-xl font-extrabold text-stone-900">{m.name}</h1>
        </div>
      </div>

      {!s ? <Skeleton className="h-64" /> : (
        <div className="space-y-3 rounded-3xl bg-stone-900 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{t('7 hari lepas')}</p>
          <div>
            <p className="text-5xl font-extrabold">👀 {s.views_7d}</p>
            <p className="mt-1 text-stone-300">{t('orang melihat profil anda minggu ini')}</p>
            <Trend now={s.views_7d} prev={s.views_prev} />
          </div>
          <div className="h-px bg-stone-700" />
          <div>
            <p className="text-5xl font-extrabold">💬 {s.wa_7d}</p>
            <p className="mt-1 text-stone-300">{t('klik ke WhatsApp')}</p>
            <Trend now={s.wa_7d} prev={s.wa_prev} />
          </div>
          <div className="h-px bg-stone-700" />
          <p className="text-sm text-stone-300">📍 {s.nav_7d ?? 0} {t('klik navigasi')}</p>
        </div>
      )}

      <p className="text-sm text-stone-600">
        {s && s.views_7d === 0
          ? t('Kongsi pautan profil anda di WhatsApp status untuk mula dapat pelawat.')
          : t('Setiap paparan dan klik direkod secara automatik.')}
      </p>

      {DEMO_MODE && (
        <button
          onClick={() => {
            if (!askReset) return setAskReset(true)
            resetDemo(); location.hash = '#/'; location.reload()
          }}
          className={`text-xs underline ${askReset ? 'font-bold text-rose-600' : 'text-stone-400'}`}
        >
          {askReset ? t('Tekan sekali lagi untuk padam semua data demo') : t('Set semula data demo')}
        </button>
      )}

      <ActionBar>
        <Link to={`/m/${m.id}`} className="flex-1"><Btn variant="ghost" className="w-full">{t('Lihat profil awam')}</Btn></Link>
      </ActionBar>
    </div>
  )
}

export default function MerchantHome() {
  const { t } = useLanguage()
  const [m, setM] = useState(undefined)
  const nav = useNavigate()
  useEffect(() => { myMerchant().then(setM).catch(() => setM(null)) }, [])

  if (m === undefined) return <div className="p-4"><Skeleton className="h-72" /></div>
  if (m) return <Dashboard m={m} />

  return (
    <div className="flex min-h-[80dvh] flex-col justify-center px-6 text-center">
      <p className="text-6xl">🏪</p>
      <h1 className="mt-4 text-3xl font-extrabold leading-tight text-stone-900">{t('Kedai anda online dalam 3 minit')}</h1>
      <p className="mt-3 text-stone-600">{t('Tulis nota ringkas. AI sediakan profil. Anda semak dan terbit.')}</p>
      <ol className="mx-auto mt-6 space-y-2 text-left text-sm text-stone-700">
        <li>1. {t('Tulis apa yang anda jual')}</li>
        <li>2. {t('Semak draf profil AI')}</li>
        <li>3. {t('Tambah gambar dan nombor WhatsApp')}</li>
      </ol>
      <ActionBar>
        <Btn onClick={() => nav('/peniaga/daftar')} className="py-5 text-lg">{t('Mula Berniaga Online')}</Btn>
      </ActionBar>
    </div>
  )
}
