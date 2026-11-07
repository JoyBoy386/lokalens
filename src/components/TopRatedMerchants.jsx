import { useEffect, useState } from 'react'
import { listTopRatedMerchants } from '../lib/api.js'
import { useLanguage } from '../lib/i18n.jsx'
import { MerchantCard } from './ui.jsx'

export default function TopRatedMerchants() {
  const { t } = useLanguage()
  const [merchants, setMerchants] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listTopRatedMerchants()
      .then(setMerchants)
      .catch((reason) => setError(reason.message || String(reason)))
  }, [])

  if (error) return <p role="alert" className="mx-4 mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{t('Peniaga popular tidak dapat dimuat')}: {error}</p>
  if (!merchants?.length) return null

  return (
    <section className="mt-5">
      <div className="px-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800">{t('Dinilai 4 bintang ke atas · sekurang-kurangnya 3 ulasan')}</p>
        <h2 className="mt-1 text-lg font-extrabold text-stone-900">🏆 {t('Peniaga popular')}</h2>
      </div>
      <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-1">
        {merchants.map((merchant) => (
          <div className="w-72 shrink-0 snap-start" key={merchant.id}>
            <MerchantCard m={merchant} />
          </div>
        ))}
      </div>
    </section>
  )
}
