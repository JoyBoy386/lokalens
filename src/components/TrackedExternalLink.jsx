import { useState } from 'react'
import { logEvent } from '../lib/api.js'
import { useLanguage } from '../lib/i18n.jsx'

export default function TrackedExternalLink({ href, merchantId, type, className, children }) {
  const { language } = useLanguage()
  const [error, setError] = useState(null)

  const followLink = async (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      logEvent(merchantId, type).catch((reason) => console.error(`Failed to log ${type} event`, reason))
      return
    }

    event.preventDefault()
    setError(null)
    const destination = window.open('about:blank', '_blank')
    try {
      await logEvent(merchantId, type)
      if (destination) {
        destination.opener = null
        destination.location.href = href
      } else {
        window.location.assign(href)
      }
    } catch (reason) {
      destination?.close()
      console.error(`Failed to log ${type} event`, reason)
      const action = type === 'whatsapp' ? 'contact click' : 'directions click'
      setError(language === 'en'
        ? `Could not record this ${action}: ${reason.message || reason}`
        : `Klik ${type === 'whatsapp' ? 'hubungan' : 'navigasi'} ini tidak dapat direkodkan: ${reason.message || reason}`)
    }
  }

  return (
    <>
      <a href={href} target="_blank" rel="noreferrer" onClick={followLink} className={className}>{children}</a>
      {error && <span role="alert" className="block basis-full text-xs text-rose-700">{error}</span>}
    </>
  )
}
