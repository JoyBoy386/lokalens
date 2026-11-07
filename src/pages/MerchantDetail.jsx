import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMerchant, logEvent } from '../lib/api.js'
import { toggleSaved, useSaved } from '../lib/saved.js'
import { waLink, mapsLink } from '../lib/utils.js'
import { ActionBar, Cover, Header, OpenBadge, SampleBadge, Skeleton } from '../components/ui.jsx'
import { localizeMerchant, translateCategory, useLanguage } from '../lib/i18n.jsx'
import TrackedExternalLink from '../components/TrackedExternalLink.jsx'
import ReviewSection from '../components/ReviewSection.jsx'

function getTikTokVideoId(url) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    if (parsed.protocol !== 'https:' || !(host === 'tiktok.com' || host.endsWith('.tiktok.com'))) return null
    return parsed.pathname.match(/\/video\/(\d+)/)?.[1] || null
  } catch {
    return null
  }
}

export default function MerchantDetail() {
  const { language, t } = useLanguage()
  const { id } = useParams()
  const [rawMerchant, setRawMerchant] = useState(undefined)
  const saved = useSaved()

  useEffect(() => {
    getMerchant(id).then((r) => {
      setRawMerchant(r)
      if (r) logEvent(r.id, 'view').catch((reason) => console.error('Failed to log profile view', reason))
    })
  }, [id])

  if (rawMerchant === undefined) return <div className="space-y-3 p-4"><Skeleton className="h-64" /><Skeleton className="h-24" /></div>
  if (rawMerchant === null) return <><Header back title={t('Tidak dijumpai')} /><p className="p-4 text-stone-500">{t('Profil ini tiada.')}</p></>

  const m = localizeMerchant(rawMerchant, language)
  const isSaved = saved.includes(m.id)
  const waText = language === 'en'
    ? `Hello ${m.name}, I found your shop on LOKALENS Perak. May I ask about your products?`
    : undefined

  return (
    <div>
      <Header
        back
        title={m.name}
        right={
          <button onClick={() => toggleSaved(m.id)} className="rounded-full p-2 text-2xl active:bg-stone-200" aria-label={t('Simpan')}>
            {isSaved ? '❤️' : '🤍'}
          </button>
        }
      />

      {m.photos?.length > 1 ? (
        <div className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-4">
          {m.photos.map((p, i) => (
            <img key={i} src={p} alt="" className="h-64 w-[85%] shrink-0 snap-center rounded-2xl object-cover" />
          ))}
        </div>
      ) : (
        <div className="px-4"><div className="overflow-hidden rounded-2xl"><Cover m={m} className="h-64" /></div></div>
      )}

      <div className="space-y-4 p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {m.is_sample && <SampleBadge />}
            <OpenBadge m={m} />
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-stone-900">{m.name}</h2>
          <p className="text-sm text-stone-500">{translateCategory(m.category, language)} · {m.town}, {m.district}</p>
          {m.address && <p className="mt-1 text-sm text-stone-600">📍 {m.address}</p>}
        </div>

        <p className="leading-relaxed text-stone-800">{m.description}</p>

        {getTikTokVideoId(m.tiktok_url) && (
          <section>
            <h3 className="mb-2 text-sm font-bold text-stone-900">{t('Video TikTok')}</h3>
            <div className="mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-2xl bg-stone-900">
              <iframe
                src={`https://www.tiktok.com/player/v1/${getTikTokVideoId(m.tiktok_url)}?music_info=1&description=1`}
                title={t('Video TikTok daripada {name}', { name: m.name })}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <a href={m.tiktok_url} target="_blank" rel="noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-brand-700 underline">
              {t('Tidak dapat memainkan video? Buka di TikTok')}
            </a>
          </section>
        )}

        {m.products?.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-stone-900">{t('Produk')}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {m.products.map((p) => (
                <span key={p} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-900 ring-1 ring-brand-100">{p}</span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-3 text-sm ring-1 ring-stone-200">
          <p><span className="font-semibold">{t('Hari buka:')}</span> {m.open_days || t('Hubungi peniaga')}</p>
          <p className="mt-1 text-stone-500">{t('Lokasi disahkan oleh peniaga')}</p>
        </div>

        <ReviewSection merchantId={m.id} average={m.avg_rating} count={m.review_count} />
      </div>

      <ActionBar aboveNav={false}>
        <TrackedExternalLink href={mapsLink(m)} merchantId={m.id} type="navigate"
          className="flex-1 rounded-2xl bg-white px-4 py-3.5 text-center text-base font-bold text-stone-900 shadow-sm ring-1 ring-stone-300 active:bg-stone-100">{t('📍 Navigasi')}</TrackedExternalLink>
        <TrackedExternalLink href={waLink(m, waText)} merchantId={m.id} type="whatsapp"
          className="flex-1 rounded-2xl bg-[#25D366] px-4 py-3.5 text-center text-base font-bold text-white shadow-sm active:brightness-90">💬 WhatsApp</TrackedExternalLink>
      </ActionBar>
    </div>
  )
}
