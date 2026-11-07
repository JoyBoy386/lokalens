import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMerchants } from '../lib/api.js'
import { useSaved } from '../lib/saved.js'
import { Header, MerchantCard } from '../components/ui.jsx'
import { useLanguage } from '../lib/i18n.jsx'

export default function Saved() {
  const { t } = useLanguage()
  const ids = useSaved()
  const [items, setItems] = useState([])
  useEffect(() => { listMerchants().then(setItems) }, [])
  const list = items.filter((m) => ids.includes(m.id))

  return (
    <div>
      <Header title={t('Disimpan')} />
      <div className="space-y-3 px-4">
        {list.length === 0 && (
          <div className="py-16 text-center text-stone-500">
            <p className="text-4xl">🤍</p>
            <p className="mt-2">{t('Belum ada kedai disimpan.')}</p>
            <Link to="/" className="mt-3 inline-block font-bold text-brand-700">{t('Teroka sekarang')}</Link>
          </div>
        )}
        {list.map((m) => <MerchantCard key={m.id} m={m} />)}
      </div>
    </div>
  )
}
