import { useEffect, useState } from 'react'
import { listReviews, submitReview } from '../lib/api.js'
import { useLanguage } from '../lib/i18n.jsx'

const field = 'w-full rounded-xl bg-white px-3 py-3 text-sm text-stone-900 ring-1 ring-stone-300 outline-none focus:ring-2 focus:ring-brand-600'

function Stars({ rating }) {
  return (
    <span className="text-amber-500" aria-label={`${rating} / 5`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function ReviewSection({ merchantId, average = 0, count = 0 }) {
  const { t } = useLanguage()
  const [reviews, setReviews] = useState([])
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const refresh = async () => {
    try {
      setReviews(await listReviews(merchantId))
      setError(null)
    } catch (reason) {
      setError(reason.message || String(reason))
    }
  }

  useEffect(() => { refresh() }, [merchantId])

  const sendReview = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setSuccess(false)
    try {
      await submitReview({ merchantId, visitorName: name, rating, comment })
      setName('')
      setRating(5)
      setComment('')
      setSuccess(true)
      await refresh()
    } catch (reason) {
      setError(reason.message || String(reason))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-stone-900">{t('Ulasan pengunjung')}</h3>
          {count > 0
            ? <p className="mt-1 text-sm text-stone-600"><span className="font-bold text-amber-700">{Number(average).toFixed(1)} ★</span> · {t('{count} ulasan', { count })}</p>
            : <p className="mt-1 text-sm text-stone-500">{t('Belum ada ulasan')}</p>}
        </div>
        <button type="button" onClick={() => setShowForm((open) => !open)}
          className="shrink-0 rounded-xl bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950">
          {showForm ? t('Tutup') : t('Tulis ulasan')}
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{t('Ulasan tidak dapat dimuat atau dihantar')}: {error}</p>}
      {success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{t('Terima kasih atas ulasan anda.')}</p>}

      {reviews.length > 0 && (
        <div className="space-y-2">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl bg-stone-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-stone-900">{review.visitor_name}</p>
                <Stars rating={review.rating} />
              </div>
              {review.comment && <p className="mt-1 text-sm leading-relaxed text-stone-700">{review.comment}</p>}
              {review.is_sample && <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800">{t('Ulasan contoh')}</p>}
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={sendReview} className="space-y-3 border-t border-stone-200 pt-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-stone-800">{t('Nama anda')}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={60}
              className={field} autoComplete="name" />
          </label>
          <fieldset>
            <legend className="text-sm font-semibold text-stone-800">{t('Penilaian')}</legend>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}
                  aria-label={t('Beri {count} bintang', { count: star })} aria-pressed={star === rating}
                  className={`text-3xl ${star <= rating ? 'text-amber-500' : 'text-stone-300'}`}>★</button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-stone-800">{t('Ulasan anda (pilihan)')}</span>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} maxLength={1000}
              className={field} />
          </label>
          <button type="submit" disabled={busy || !name.trim()}
            className="w-full rounded-xl bg-brand-700 px-4 py-3 font-bold text-white disabled:opacity-50">
            {busy ? t('Sedang menghantar…') : t('Hantar ulasan')}
          </button>
        </form>
      )}
    </section>
  )
}
