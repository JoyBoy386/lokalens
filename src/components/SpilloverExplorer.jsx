import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LANDMARKS, SPILLOVER_DEMO } from '../data/spillover.js'
import { DEMO_MODE } from '../lib/supabase.js'
import { km, mapsLink } from '../lib/utils.js'
import { translateCategory, useLanguage } from '../lib/i18n.jsx'
import { SampleBadge } from './ui.jsx'

const travelMinutes = (from, to) => Math.round((km(from, to) / 35) * 60) + 4
const MARKER_POSITIONS = [
  { left: '18%', top: '25%' },
  { left: '78%', top: '26%' },
  { left: '24%', top: '75%' },
  { left: '75%', top: '73%' },
]

export default function SpilloverExplorer({ merchants = [] }) {
  const { language } = useLanguage()
  const [landmarkId, setLandmarkId] = useState(LANDMARKS[0].id)
  const [showNearby, setShowNearby] = useState(false)
  const landmark = LANDMARKS.find((item) => item.id === landmarkId) || LANDMARKS[0]
  const nearby = useMemo(() => {
    const real = merchants
      .filter((merchant) => merchant.lat != null && merchant.lng != null
        && Number.isFinite(Number(merchant.lat)) && Number.isFinite(Number(merchant.lng)))
      .map((merchant) => ({ ...merchant, travel_min: travelMinutes(landmark, merchant), demo_only: false }))
      .filter((merchant) => merchant.travel_min <= 15)
      .sort((a, b) => a.travel_min - b.travel_min)
    if (!DEMO_MODE) return real.slice(0, 4)

    const demo = (SPILLOVER_DEMO[landmark.id] || []).map((merchant) => ({
      ...merchant,
      is_sample: true,
      description: language === 'en' ? merchant.description_en : merchant.description,
      travel_min: travelMinutes(landmark, merchant),
      demo_only: true,
    })).filter((merchant) => merchant.travel_min <= 15)
    const combined = [...real, ...demo.filter((sample) => !real.some((merchant) => merchant.name === sample.name))]
    return combined.slice(0, Math.min(4, Math.max(3, real.length)))
  }, [landmark, language, merchants])

  const copy = language === 'en'
    ? {
      title: 'The Icon + 1 spillover', subtitle: 'Turn a landmark visit into a local discovery.',
      nearby: 'Discover Nearby Locals', hide: 'Hide nearby locals', radius: 'ABOUT 15 MINUTES AWAY',
      from: 'Start with a Perak icon', empty: 'No listed local businesses within about 15 minutes yet.',
      minutes: 'min away', demo: 'DEMO EXAMPLE',
    }
    : {
      title: 'Limpahan Ikon + 1', subtitle: 'Jadikan lawatan mercu tanda peluang mengenali peniaga tempatan.',
      nearby: 'Terokai Peniaga Berdekatan', hide: 'Sembunyikan peniaga berdekatan', radius: 'KIRA-KIRA 15 MINIT',
      from: 'Pilih ikon Perak', empty: 'Belum ada peniaga tersenarai dalam jarak kira-kira 15 minit.',
      minutes: 'minit', demo: 'CONTOH DEMO',
    }

  return (
    <section className="mx-4 mt-5 overflow-hidden rounded-3xl bg-slate-950 text-white shadow-sm">
      <div className="p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">{copy.title}</p>
        <h2 className="mt-1 text-lg font-extrabold">{copy.subtitle}</h2>
        <p className="mt-3 text-xs font-semibold text-slate-300">{copy.from}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {LANDMARKS.map((item) => (
            <button key={item.id} onClick={() => setLandmarkId(item.id)} aria-pressed={landmarkId === item.id}
              className={`rounded-xl px-3 py-2 text-left text-sm font-bold ring-1 transition ${landmarkId === item.id ? 'bg-amber-300 text-slate-950 ring-amber-300' : 'bg-white/5 text-white ring-white/15'}`}>
              <span className="mr-1.5">{item.emoji}</span>{item.name}
            </button>
          ))}
        </div>

        <div className="relative mt-3 h-40 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#1e293b,#334155_50%,#1e293b)]"
          aria-label={`${landmark.name} nearby businesses`}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-200/50" />
          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/35" />
          {showNearby && nearby.map((merchant, index) => (
            <span key={merchant.id} className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow-lg ring-2 ring-amber-300"
              style={MARKER_POSITIONS[index]} title={merchant.name}>
              {merchant.emoji || '🏪'}
            </span>
          ))}
          <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-300 text-2xl shadow-lg ring-4 ring-slate-950/60">
            {landmark.emoji}
          </span>
          <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/75 px-2.5 py-1 text-[9px] font-bold tracking-widest text-amber-200">{copy.radius}</span>
          {showNearby && <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-semibold">{nearby.length} {language === 'en' ? 'locals' : 'peniaga'}</span>}
        </div>

        <button onClick={() => setShowNearby((visible) => !visible)}
          className="mt-3 w-full rounded-2xl bg-amber-300 px-4 py-3.5 text-sm font-extrabold text-slate-950 transition hover:bg-amber-200">
          {showNearby ? copy.hide : `＋ ${copy.nearby}`}
        </button>

        {showNearby && (
          <div className="mt-3 space-y-2">
            {nearby.length === 0 && <p className="rounded-xl bg-white/5 p-3 text-sm text-slate-300">{copy.empty}</p>}
            {nearby.map((merchant, index) => {
              const details = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">{merchant.emoji || '🏪'}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{merchant.name}</span>
                    <span className="mt-0.5 block text-xs text-slate-300">{translateCategory(merchant.category, language)} · {merchant.town}</span>
                    <span className="mt-1 block text-xs text-slate-400">{merchant.description}</span>
                  </span>
                  <span className="shrink-0 text-right text-xs font-bold text-amber-200">~{merchant.travel_min} {copy.minutes}</span>
                </>
              )
              const className = 'flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3'
              return (
                <div key={merchant.id} className="relative">
                  {merchant.demo_only && <span className="absolute right-2 top-1 z-10 rounded-full bg-amber-300 px-2 py-0.5 text-[8px] font-extrabold text-slate-950">{copy.demo}</span>}
                  {merchant.demo_only
                    ? <a href={mapsLink(merchant)} target="_blank" rel="noreferrer" className={className}>{details}</a>
                    : <Link to={`/m/${merchant.id}`} className={className}>{details}</Link>}
                  {!merchant.demo_only && merchant.is_sample && <div className="absolute bottom-2 right-3"><SampleBadge /></div>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
