import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGovAnalytics } from '../lib/api.js'
import { useLanguage } from '../lib/i18n.jsx'

const number = (value) => new Intl.NumberFormat().format(value || 0)

export default function GovDashboard({ children }) {
  const { language } = useLanguage()
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const copy = language === 'en'
    ? {
      eyebrow: 'PERAK · TOURISM INTELLIGENCE', title: 'Local impact dashboard',
      subtitle: 'A 30-day view of visitor interest and merchant contact intent.',
      refresh: 'LIVE · REFRESHES EVERY 10 SECONDS', demo: 'DEMO DATA · ILLUSTRATIVE BASELINE + LIVE SESSION EVENTS',
      live: 'SUPABASE · LAST 30 DAYS', district: 'WhatsApp clicks by district',
      heatmap: 'Tourist interest heatmap', heatmapHint: 'Town-level profile views and contact intent',
      views: 'PROFILE VIEWS', whatsapp: 'WHATSAPP INTENT', navigation: 'DIRECTIONS',
      totalIntent: 'Total WhatsApp contacts', towns: 'Towns with activity',
      error: 'Could not load government analytics',
      empty: 'No published merchant activity yet.',
    }
    : {
      eyebrow: 'PERAK · INTELIJEN PELANCONGAN', title: 'Papan pemuka impak tempatan',
      subtitle: 'Paparan 30 hari minat pelawat dan niat menghubungi peniaga.',
      refresh: 'LANGSUNG · DIKEMAS KINI SETIAP 10 SAAT', demo: 'DATA DEMO · ASAS ILUSTRASI + AKTIVITI SESI INI',
      live: 'SUPABASE · 30 HARI TERAKHIR', district: 'Klik WhatsApp mengikut daerah',
      heatmap: 'Peta haba minat pelancong', heatmapHint: 'Paparan profil dan niat menghubungi mengikut bandar',
      views: 'PAPARAN PROFIL', whatsapp: 'NIAT WHATSAPP', navigation: 'NAVIGASI',
      totalIntent: 'Jumlah niat WhatsApp', towns: 'Bandar dengan aktiviti',
      error: 'Analitik kerajaan tidak dapat dimuat',
      empty: 'Belum ada aktiviti peniaga yang diterbitkan.',
    }

  useEffect(() => {
    let active = true
    const refresh = () => getGovAnalytics()
      .then((result) => {
        if (!active) return
        setReport(result)
        setError(null)
      })
      .catch((reason) => {
        if (active) setError(reason.message || String(reason))
      })
    refresh()
    const timer = setInterval(refresh, 10000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  const totals = useMemo(() => (report?.rows || []).reduce((result, row) => ({
    views: result.views + Number(row.profile_views || 0),
    whatsapp: result.whatsapp + Number(row.whatsapp_clicks || 0),
    navigation: result.navigation + Number(row.navigation_clicks || 0),
  }), { views: 0, whatsapp: 0, navigation: 0 }), [report])

  const districtRows = useMemo(() => {
    const values = new Map()
    for (const row of report?.rows || []) {
      const current = values.get(row.district) || { district: row.district, clicks: 0 }
      current.clicks += Number(row.whatsapp_clicks || 0)
      values.set(row.district, current)
    }
    return [...values.values()].sort((a, b) => b.clicks - a.clicks)
  }, [report])

  const towns = useMemo(() => [...(report?.rows || [])]
    .map((row) => ({ ...row, interest: Number(row.profile_views || 0) + Number(row.whatsapp_clicks || 0) }))
    .sort((a, b) => b.interest - a.interest), [report])
  const maxDistrictClicks = Math.max(1, ...districtRows.map((row) => row.clicks))
  const maxInterest = Math.max(1, ...towns.map((row) => row.interest))

  return (
    <div className="min-h-dvh bg-slate-950 text-white">
      <header className="border-b border-white/10 px-5 pb-6 pt-5 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-bold tracking-[0.2em] text-amber-300">{copy.eyebrow}</p>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-300">{copy.refresh}</span>
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">{copy.subtitle}</p>
          <p className="mt-4 text-[10px] font-bold tracking-[0.16em] text-slate-400">
            {report?.source === 'demo' ? copy.demo : copy.live}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-8">
        {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-950/60 p-4 text-sm text-rose-200">{copy.error}: {error}</p>}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: copy.totalIntent, value: totals.whatsapp, icon: '↗' },
            { label: copy.views, value: totals.views, icon: '◉' },
            { label: copy.towns, value: towns.length, icon: '⌖' },
          ].map((metric) => (
            <article key={metric.label} className="rounded-2xl border border-white/10 bg-slate-900 p-4">
              <div className="flex items-center justify-between text-slate-400">
                <p className="text-[10px] font-bold tracking-[0.15em]">{metric.label}</p>
                <span className="text-amber-300">{metric.icon}</span>
              </div>
              <p className="mt-3 text-3xl font-black tabular-nums">{number(metric.value)}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">{copy.district}</h2>
                <p className="mt-1 text-xs text-slate-400">{copy.whatsapp}</p>
              </div>
              <span className="text-xs font-bold text-amber-300">{number(totals.whatsapp)}</span>
            </div>
            {districtRows.length === 0 && <p className="mt-6 text-sm text-slate-400">{copy.empty}</p>}
            <div className="mt-6 space-y-5">
              {districtRows.map((row) => (
                <div key={row.district}>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{row.district}</span>
                    <span className="tabular-nums text-slate-400">{number(row.clicks)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-amber-300" style={{ width: `${Math.max(3, row.clicks / maxDistrictClicks * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-slate-900 p-5">
            <div>
              <h2 className="font-bold">{copy.heatmap}</h2>
              <p className="mt-1 text-xs text-slate-400">{copy.heatmapHint}</p>
            </div>
            {towns.length === 0 && <p className="mt-6 text-sm text-slate-400">{copy.empty}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {towns.map((row) => {
                const intensity = row.interest / maxInterest
                return (
                  <div key={`${row.district}-${row.town}`} className="rounded-xl border border-white/10 p-3"
                    style={{ backgroundColor: `rgba(245, 184, 61, ${0.08 + intensity * 0.32})` }}>
                    <p className="truncate text-sm font-bold">{row.town}</p>
                    <p className="mt-0.5 text-[10px] text-slate-300">{row.district}</p>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <span className="text-[9px] font-bold tracking-wider text-slate-300">{copy.views}</span>
                      <span className="text-lg font-black tabular-nums">{number(row.profile_views)}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-slate-300">
                      <span>{copy.whatsapp}</span><span className="tabular-nums">{number(row.whatsapp_clicks)}</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-950/50">
                      <div className="h-full rounded-full bg-amber-300" style={{ width: `${Math.max(3, intensity * 100)}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </article>
        </section>

        <section className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold">{copy.navigation}: {number(totals.navigation)}</h2>
            <p className="mt-1 text-xs text-slate-400">{copy.heatmapHint}</p>
          </div>
          <div className="flex gap-4 text-sm font-semibold">
            <Link to="/" className="text-slate-300 hover:text-white">LOKALENS ↗</Link>
          </div>
        </section>
        {children}
      </main>
    </div>
  )
}
