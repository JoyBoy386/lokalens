import { useState } from 'react'
import { Link } from 'react-router-dom'
import { aiHighlight, publishHighlight } from '../lib/api.js'
import { DISTRICTS } from '../data/seed.js'
import { DEMO_MODE } from '../lib/supabase.js'
import { Btn, Pills, Skeleton } from '../components/ui.jsx'
import { useLanguage } from '../lib/i18n.jsx'
import GovDashboard from './GovDashboard.jsx'

const field = 'w-full rounded-xl bg-slate-950 px-3 py-3 text-sm text-white ring-1 ring-white/15 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-amber-300'

function AnnouncementTools() {
  const { language } = useLanguage()
  const [district, setDistrict] = useState('Kinta')
  const [text, setText] = useState('')
  const [passcode, setPasscode] = useState('')
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [published, setPublished] = useState(false)
  const english = language === 'en'

  const summarize = async () => {
    setError(null)
    setPublished(false)
    setBusy(true)
    try {
      setDraft(await aiHighlight({ text, district, language }))
    } catch (reason) {
      setError(reason.message || String(reason))
    } finally {
      setBusy(false)
    }
  }

  const publish = async () => {
    setError(null)
    setBusy(true)
    try {
      await publishHighlight({ district, title: draft.title, summary: draft.summary, passcode })
      setDraft(null)
      setText('')
      setPasscode('')
      setPublished(true)
    } catch (reason) {
      setError(reason.message || (english ? 'Could not publish the highlight.' : 'Sorotan tidak dapat diterbitkan.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-[10px] font-bold tracking-[0.18em] text-amber-300">{english ? 'CONTENT OPERATIONS' : 'PENGURUSAN KANDUNGAN'}</p>
        <h2 className="mt-1 text-xl font-extrabold text-white">{english ? 'District announcement' : 'Pengumuman daerah'}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {english ? 'Draft a visitor highlight from an announcement, review it, and publish.' : 'Draf sorotan pelawat daripada pengumuman, semak dan terbitkan.'}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{english ? 'District' : 'Daerah'}</p>
            <Pills options={DISTRICTS.map((name) => ({ id: name, label: name }))} value={district} onChange={setDistrict} />
          </div>
          <div>
            <label htmlFor="announcement" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              {english ? 'Announcement or promotion' : 'Teks pengumuman atau promosi'}
            </label>
            <textarea id="announcement" value={text} onChange={(event) => setText(event.target.value)} rows={6}
              className={field}
              placeholder={english ? 'Paste a press release, district council post, or event notice.' : 'Tampal kenyataan media, hantaran majlis daerah atau notis acara.'} />
          </div>
          {!draft && (
            <Btn onClick={summarize} disabled={busy || text.trim().length < 30}>
              {busy ? (english ? 'Summarizing…' : 'Sedang meringkaskan…') : (english ? '✨ Generate highlight draft' : '✨ Jana draf sorotan')}
            </Btn>
          )}
        </div>

        <div className="space-y-3">
          {busy && !draft && <Skeleton className="h-40" />}
          {draft && (
            <div className="space-y-3 rounded-xl border border-amber-300/20 bg-slate-950 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                {english ? 'Review generated draft' : 'Semak draf yang dijana'}
              </p>
              <input aria-label={english ? 'Highlight title' : 'Tajuk sorotan'} value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={field} />
              <textarea aria-label={english ? 'Highlight summary' : 'Ringkasan sorotan'} value={draft.summary}
                onChange={(event) => setDraft({ ...draft, summary: event.target.value })} rows={4} className={field} />
              {!DEMO_MODE && (
                <input type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)}
                  placeholder={english ? 'Administrator passcode' : 'Kod pentadbir'} className={field} />
              )}
              <div className="flex gap-2">
                <button onClick={() => setDraft(null)} disabled={busy}
                  className="flex-1 rounded-xl bg-white/10 px-3 py-3 text-sm font-bold text-white disabled:opacity-50">
                  {english ? 'Discard' : 'Buang'}
                </button>
                <button onClick={publish} disabled={busy || !draft.title.trim() || !draft.summary.trim() || (!DEMO_MODE && !passcode)}
                  className="flex-1 rounded-xl bg-amber-300 px-3 py-3 text-sm font-extrabold text-slate-950 disabled:opacity-50">
                  {busy ? (english ? 'Publishing…' : 'Menerbit…') : (english ? 'Publish highlight' : 'Terbitkan sorotan')}
                </button>
              </div>
            </div>
          )}
          {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-950/60 p-3 text-sm text-rose-200">{error}</p>}
          {published && <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-950/40 p-3 text-sm text-emerald-200">
            {english ? 'Highlight published successfully.' : 'Sorotan berjaya diterbitkan.'}
          </p>}
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-white">{english ? '← Back to LOKALENS' : '← Kembali ke LOKALENS'}</Link>
      </div>
    </section>
  )
}

export default function Admin() {
  return <GovDashboard><AnnouncementTools /></GovDashboard>
}
