import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { aiProfile, createMerchant } from '../lib/api.js'
import { CATEGORIES, DISTRICTS, VIBES } from '../data/seed.js'
import { normalizePhone } from '../lib/utils.js'
import { ActionBar, Btn, Header, Pills } from '../components/ui.jsx'
import { translateCategory, useLanguage } from '../lib/i18n.jsx'

const EMOJI = {
  Makanan: '🍛', 'Minuman & Kopi': '☕', 'Kuih & Pastri': '🍮',
  Kraftangan: '🏺', 'Produk Tani': '🌾', Pengalaman: '🌿',
}

const field = 'w-full rounded-xl bg-white px-3 py-3 text-base text-stone-900 ring-1 ring-stone-300 outline-none focus:ring-2 focus:ring-brand-600'
const label = 'mb-1 block text-sm font-bold text-stone-900'

export default function Onboard() {
  const { language, t } = useLanguage()
  const nav = useNavigate()
  const [step, setStep] = useState('notes') // notes | contact | publishing
  const [notes, setNotes] = useState('')
  const [district, setDistrict] = useState('Kinta')
  const [town, setTown] = useState('')
  const [draft, setDraft] = useState(null)
  const [source, setSource] = useState(null)
  const [phone, setPhone] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [files, setFiles] = useState([])
  const [address, setAddress] = useState('')
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' })
  const [locationSource, setLocationSource] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [err, setErr] = useState(null)
  const fileRef = useRef()

  const set = (k) => (e) => setDraft({ ...draft, [k]: e.target ? e.target.value : e })

  const generate = async () => {
    setErr(null)
    setGenerating(true)
    try {
      const detectedTown = notes.match(/\b(kuala kangsar|batu gajah|ipoh|tambun)\b/i)?.[1]
      const townName = detectedTown
        ? detectedTown.replace(/\b\w/g, (letter) => letter.toUpperCase())
        : town
      const profileDistrict = /kuala kangsar/i.test(detectedTown || '') ? 'Kuala Kangsar'
        : /batu gajah|ipoh|tambun/i.test(detectedTown || '') ? 'Kinta'
          : district
      if (detectedTown) setTown(townName)
      if (profileDistrict !== district) setDistrict(profileDistrict)
      const r = await aiProfile({ notes, district: profileDistrict, language })
      setSource(r.source)
      setDraft({
        name: r.name || '',
        category: CATEGORIES.includes(r.category) ? r.category : 'Makanan',
        description: r.description || '',
        products: (r.products || []).join(', '),
        tags: [...new Set([...(r.tags?.length ? r.tags : ['foodie']), ...(r.category === 'Kraftangan' ? ['culture'] : [])])],
        open_time: r.open_time || '',
        close_time: r.close_time || '',
        open_days: r.open_days || t('Setiap hari'),
      })
      setEditingNotes(false)
    } catch (reason) {
      setErr(reason.message || String(reason))
    } finally {
      setGenerating(false)
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return setErr(t('Pelayar ini tidak menyokong GPS. Masukkan alamat kedai.'))
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoordinates({ lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) })
        setAddress('')
        setLocationSource('gps')
        setErr(null)
      },
      (e) => setErr(e.code === e.PERMISSION_DENIED
        ? t('Akses lokasi ditolak. Masukkan alamat kedai secara manual.')
        : t('Lokasi GPS tidak tersedia. Masukkan alamat kedai secara manual.')),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const updateAddress = (e) => {
    setAddress(e.target.value)
    setCoordinates({ lat: '', lng: '' })
    setLocationSource(e.target.value.trim() ? 'address' : null)
    setErr(null)
  }

  const phoneOk = normalizePhone(phone).length >= 11

  const publish = async () => {
    setErr(null)
    const videoUrl = tiktokUrl.trim()
    if (videoUrl) {
      try {
        const parsed = new URL(videoUrl)
        const host = parsed.hostname.toLowerCase()
        if (parsed.protocol !== 'https:' || !(host === 'tiktok.com' || host.endsWith('.tiktok.com')) || !/\/video\/\d+/.test(parsed.pathname)) {
          throw new Error('invalid TikTok video URL')
        }
      } catch {
        setErr(t('Masukkan pautan video TikTok yang sah atau kosongkan ruangan ini.'))
        return
      }
    }
    const latText = coordinates.lat.trim()
    const lngText = coordinates.lng.trim()
    if (!address.trim() && (!latText || !lngText)) {
      setErr(t('Gunakan GPS atau masukkan alamat kedai.'))
      return
    }
    const lat = latText && lngText ? Number(latText) : null
    const lng = latText && lngText ? Number(lngText) : null
    setStep('publishing')
    try {
      await createMerchant(
        {
          name: draft.name.trim(),
          district,
          town: town.trim() || district,
          category: draft.category,
          description: draft.description.trim(),
          products: draft.products.split(',').map((s) => s.trim()).filter(Boolean),
          tags: draft.tags,
          open_time: draft.open_time || null,
          close_time: draft.close_time || null,
          open_days: draft.open_days.trim() || null,
          address: address.trim() || null,
          lat,
          lng,
          phone: normalizePhone(phone),
          tiktok_url: videoUrl || null,
          emoji: EMOJI[draft.category] || '🛍️',
        },
        files
      )
      nav('/peniaga', { replace: true })
    } catch (e) {
      setErr(e.message || t('Gagal terbit. Cuba lagi.'))
      setStep('contact')
    }
  }

  /* ---------- step 1: rough notes ---------- */
  if (step === 'notes') {
    return (
      <div>
        <Header back title={t('Daftar Kedai')} />
        <div className="space-y-5 px-4 pb-8">
          <div>
            <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">{t('Profil AI dalam satu langkah')}</p>
              {(!draft || editingNotes) ? (
                <>
                  <label className="mb-2 mt-2 block text-xl font-extrabold">{t('Apa yang anda jual?')}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    autoFocus
                    placeholder={t('Contoh: jual kraf pasu labu sayong kt kuala kangsar buka sabtu ahad')}
                    className="w-full rounded-2xl bg-white/10 px-4 py-3 text-base leading-relaxed text-white outline-none ring-1 ring-white/20 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-300"
                  />
                  <p className="mt-2 text-xs text-slate-300">{t('Tulis macam mesej WhatsApp. Tak perlu ayat cantik.')}</p>
                  <button onClick={generate} disabled={notes.trim().length < 8 || generating}
                    className="mt-4 w-full rounded-2xl bg-amber-300 px-4 py-4 text-base font-extrabold text-slate-950 shadow-md transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300">
                    ✨ {generating ? t('Sedang menjana profil…') : t('Jana Profil')}
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-slate-300">{t('Profil anda sudah dijana. Semak dan ubah sebelum diterbitkan.')}</p>
                  <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-slate-400">{notes}</p>
                  <button onClick={() => setEditingNotes(true)} className="mt-3 text-sm font-bold text-amber-300 underline">{t('Ubah nota asal')}</button>
                </>
              )}
            </div>
          </div>
          {err && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{err}</p>}
          {draft && (
            <>
            <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">{t('Profil AI sedia untuk disemak')}</p>
                <p className="mt-1 text-sm text-stone-500">{source === 'ai' ? t('Draf oleh AI. Semak setiap butiran.') : t('Draf automatik. Semak setiap butiran.')}</p>
              </div>
              <div>
                <label className={label}>{t('Nama kedai')}</label>
                <input value={draft.name} onChange={set('name')} className={field} />
              </div>
              <div>
                <label className={label}>{t('Kategori')}</label>
                <select value={draft.category} onChange={set('category')} className={field}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{translateCategory(c, language)}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>{t('Penerangan')}</label>
                <textarea value={draft.description} onChange={set('description')} rows={4} className={field} />
              </div>
              <div>
                <p className={label}>{t('Tag dicadangkan')}</p>
                <div className="flex flex-wrap gap-2">
                  {[draft.category === 'Kraftangan' ? t('Kraf tangan') : translateCategory(draft.category, language), ...(draft.tags.includes('culture') ? [t('Warisan')] : []), ...VIBES.filter((v) => draft.tags.includes(v.id)).map((v) => t(v.label))]
                    .filter((tag, index, tags) => tags.indexOf(tag) === index)
                    .map((tag) => <span key={tag} className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-900 ring-1 ring-amber-200">{tag}</span>)}
                </div>
              </div>
            </section>
            <section className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
              <div>
                <label className={label}>{t('Daerah')}</label>
                <Pills options={DISTRICTS.map((d) => ({ id: d, label: d }))} value={district} onChange={setDistrict} />
              </div>
              <div>
                <label className={label}>{t('Bandar atau kampung')}</label>
                <input value={town} onChange={(e) => setTown(e.target.value)} placeholder={t('Contoh: Batu Gajah')} className={field} />
              </div>
            </section>
            </>
          )}
        </div>
        {draft && (
          <div className="px-4 pb-8 pt-4">
            <Btn onClick={() => setStep('contact')} disabled={!draft.name.trim() || !draft.description.trim()}>
              {t('Teruskan ke butiran kedai')}
            </Btn>
          </div>
        )}
      </div>
    )
  }

  /* ---------- step 4: WhatsApp, photos, location ---------- */
  return (
    <div>
      <Header back title={t('Hubungan & Gambar')} />
      <div className="space-y-5 px-4">
        <div>
          <label className={label}>{t('Nombor WhatsApp')}</label>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="012-345 6789"
            className={`${field} text-lg`}
          />
          {phone && (
            <p className={`mt-1 text-xs ${phoneOk ? 'text-emerald-700' : 'text-stone-500'}`}>
              {phoneOk ? t('Butang WhatsApp akan buka wa.me/{phone}', { phone: normalizePhone(phone) }) : t('Masukkan nombor penuh')}
            </p>
          )}
        </div>

        <div>
          <label className={label}>{t('Gambar (sehingga 3)')}</label>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => setFiles([...e.target.files].slice(0, 3))} />
          <button onClick={() => fileRef.current.click()} className="w-full rounded-2xl border-2 border-dashed border-stone-300 bg-white py-6 font-semibold text-stone-600 active:bg-stone-100">
            📷 {files.length ? t('{count} gambar dipilih', { count: files.length }) : t('Pilih gambar')}
          </button>
          {files.length > 0 && (
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
              {files.map((f, i) => <img key={i} src={URL.createObjectURL(f)} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />)}
            </div>
          )}
        </div>

        <div>
          <label className={label}>{t('Pautan video TikTok (pilihan)')}</label>
          <input type="url" inputMode="url" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@kedai/video/1234567890" className={field} />
          <p className="mt-1 text-xs text-stone-500">{t('Gunakan pautan video TikTok penuh yang mengandungi /video/ID.')}</p>
        </div>

        <div>
          <label className={label}>{t('Lokasi kedai')}</label>
          <button type="button" onClick={useMyLocation} className="w-full rounded-2xl bg-white py-3.5 font-semibold text-stone-800 ring-1 ring-stone-300 active:bg-stone-100">
            📍 {t('Guna lokasi saya sekarang')}
          </button>
          <p className="mt-1 text-xs text-stone-500">{t('Tekan ini semasa anda berada di kedai, atau masukkan alamat di bawah.')}</p>
          <label className={`${label} mt-3`}>{t('Alamat kedai')}</label>
          <textarea value={address} onChange={updateAddress} rows={3}
            placeholder={t('Contoh alamat kedai')}
            className={field} />
          <p className="mt-1 text-xs text-stone-500">{t('Alamat akan dibuka sebagai carian di Google Maps.')}</p>
          {locationSource && (
            <p className="mt-1 text-xs text-emerald-700">
              {locationSource === 'gps' ? t('Lokasi kedai diisi daripada GPS telefon.') : t('Menggunakan alamat yang dimasukkan.')}
            </p>
          )}
        </div>

        {err && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{err}</p>}
      </div>
      <ActionBar aboveNav={false}>
        <Btn onClick={publish} disabled={!phoneOk || step === 'publishing'}>
          {step === 'publishing' ? t('Menerbit…') : t('🚀 Terbit')}
        </Btn>
      </ActionBar>
    </div>
  )
}
