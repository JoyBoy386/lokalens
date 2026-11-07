import { useState } from 'react'
import { Link } from 'react-router-dom'
import { aiTrip } from '../lib/api.js'
import { DURATIONS } from '../lib/planner.js'
import { STARTS, VIBES } from '../data/seed.js'
import { fmtMin, waLink, mapsLink } from '../lib/utils.js'
import { ActionBar, Btn, Cover, Header, Pills, Skeleton, SampleBadge } from '../components/ui.jsx'
import { localizeMerchant, translateCategory, useLanguage } from '../lib/i18n.jsx'
import TrackedExternalLink from '../components/TrackedExternalLink.jsx'

const DUR_OPTS = Object.entries(DURATIONS).map(([id, d]) => ({ id, label: d.label }))
const START_OPTS = Object.keys(STARTS).map((s) => ({ id: s, label: s }))

export default function TripPlanner() {
  const { language, t } = useLanguage()
  const [start, setStart] = useState('Ipoh')
  const [duration, setDuration] = useState('half')
  const [vibe, setVibe] = useState('foodie')
  const [prompt, setPrompt] = useState('')
  const [state, setState] = useState('form') // form | loading | result
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')

  const run = async () => {
    setError('')
    setState('loading')
    try {
      setPlan(await aiTrip({ start, duration, vibe, prompt, language }))
      setState('result')
      window.scrollTo(0, 0)
    } catch (reason) {
      setError(reason.message || t('Laluan tidak dapat dijana. Cuba lagi.'))
      setState('form')
    }
  }

  if (state === 'loading') {
    return (
      <div className="space-y-3 p-4">
        <p className="pt-6 text-center font-bold text-brand-700">{t('✨ Menyusun laluan anda…')}</p>
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}
      </div>
    )
  }

  if (state === 'result' && plan) {
    const byId = Object.fromEntries(plan.merchants.map((m) => [m.id, m]))
    return (
      <div>
        <Header title={t('Laluan Anda')} right={<button onClick={() => setState('form')} className="text-sm font-bold text-brand-700">{t('Ubah')}</button>} />
        <div className="px-4">
          <p className="text-sm text-stone-600">{plan.summary}</p>
          {prompt.trim() && (
            <p className="mt-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-900">
              <span className="font-bold">{t('Permintaan anda:')}</span> {prompt}
            </p>
          )}
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
            {plan.source === 'ai' ? t('Dijana oleh AI daripada senarai LOKALENS') : t('Disusun ikut jarak dan waktu buka')}
          </p>
        </div>

        <ol className="relative mt-4 space-y-4 px-4">
          {plan.stops.map((s, i) => {
            const merchant = byId[s.merchant_id]
            if (!merchant) return null
            const m = localizeMerchant(merchant, language)
            const waText = language === 'en'
              ? `Hello ${m.name}, I found your shop on LOKALENS Perak. May I ask about your products?`
              : undefined
            return (
              <li key={s.merchant_id} className="relative pl-8">
                <span className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{i + 1}</span>
                {i < plan.stops.length - 1 && <span className="absolute left-[11px] top-8 h-[calc(100%+4px)] w-0.5 bg-brand-100" />}
                <p className="text-sm font-extrabold text-brand-700">
                  {fmtMin(s.time_min)}
                  {s.travel_min ? <span className="font-medium text-stone-400"> · {s.travel_min} {t('min perjalanan')}</span> : null}
                </p>
                <div className="mt-1 overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200">
                  <Link to={`/m/${m.id}`} className="flex gap-3 p-2">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"><Cover m={m} className="h-20" /></div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-stone-900">{m.name}</p>
                      <p className="text-xs text-stone-500">{translateCategory(m.category, language)} · {m.town}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-stone-700">{s.reason}</p>
                      {m.is_sample && <div className="mt-1"><SampleBadge /></div>}
                    </div>
                  </Link>
                  <div className="grid grid-cols-2 border-t border-stone-100 text-sm font-bold">
                    <TrackedExternalLink href={mapsLink(m)} merchantId={m.id} type="navigate" className="py-2.5 text-center text-stone-700 active:bg-stone-100">{t('📍 Navigasi')}</TrackedExternalLink>
                    <TrackedExternalLink href={waLink(m, waText)} merchantId={m.id} type="whatsapp"
                      className="border-l border-stone-100 py-2.5 text-center text-[#128C7E] active:bg-stone-100">💬 WhatsApp</TrackedExternalLink>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
        {plan.stops.length === 0 && <p className="p-6 text-center text-stone-500">{t('Tiada hentian sesuai. Tukar tempoh atau gaya.')}</p>}
      </div>
    )
  }

  return (
    <div>
      <Header title="✨ AI Trip Planner" />
      <div className="space-y-6 px-4">
        <section>
          <h2 className="mb-2 font-bold text-stone-900">{t('Mula dari mana?')}</h2>
          <Pills options={START_OPTS} value={start} onChange={setStart} />
        </section>
        <section>
          <h2 className="mb-2 font-bold text-stone-900">{t('Berapa lama masa anda?')}</h2>
          <Pills options={DUR_OPTS.map((option) => ({ ...option, label: t(option.label) }))} value={duration} onChange={setDuration} />
        </section>
        <section>
          <h2 className="mb-2 font-bold text-stone-900">{t('Gaya perjalanan?')}</h2>
          <Pills options={VIBES.map((option) => ({ ...option, label: t(option.label) }))} value={vibe} onChange={setVibe} />
        </section>
        <section>
          <label htmlFor="trip-prompt" className="mb-2 block font-bold text-stone-900">
            {t('Apa yang anda mahu buat?')}
          </label>
          <p className="mb-2 text-sm text-stone-600">{t('Beritahu AI pilihan atau keperluan khas anda. Pilihan ini tidak wajib.')}</p>
          <textarea
            id="trip-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value.slice(0, 300))}
            rows={3}
            maxLength={300}
            placeholder={t('Contoh prompt perjalanan')}
            className="w-full rounded-xl bg-white px-3 py-3 text-base text-stone-900 ring-1 ring-stone-300 outline-none placeholder:text-stone-400 focus:ring-2 focus:ring-brand-600"
          />
          <p className="mt-1 text-right text-xs text-stone-500">{prompt.length}/300</p>
        </section>
        <p className="text-xs text-stone-500">{t('Laluan hanya guna peniaga berdaftar di LOKALENS. Semak waktu buka sebelum bertolak.')}</p>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      </div>
      <ActionBar>
        <Btn onClick={run}>{t('Jana Laluan')}</Btn>
      </ActionBar>
    </div>
  )
}
