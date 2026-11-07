import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const translations = {
  en: {
    'Back': 'Back', 'Sample data': 'Sample data', 'Open': 'Open', 'Closed': 'Closed',
    'Demo mode: data is stored in this browser; AI uses local rules': 'Demo mode: data is stored in this browser; AI uses local rules',
    'Explore': 'Explore', 'Saved': 'Saved', 'Merchants': 'Merchants', 'Language': 'Language',
    'Explore the district. Meet local merchants.': 'Explore the district. Meet local merchants.',
    'Search laksa, labu sayong, coffee…': 'Search laksa, labu sayong, coffee…',
    'All': 'All', 'District highlights': 'District highlights', 'AI summary': 'AI summary',
    'No matches. Try another category or district.': 'No matches. Try another category or district.',
    'Not sure where to go?': 'Not sure where to go?', 'Plan a day trip with AI Trip Planner.': 'Plan a day trip with AI Trip Planner.',
    'Failed to load data: {error}': 'Failed to load data: {error}',
    'Not found': 'Not found', 'This profile is unavailable.': 'This profile is unavailable.',
    'Save': 'Save', 'Products': 'Products', 'Opening days:': 'Opening days:',
    'Contact the merchant': 'Contact the merchant', 'Location verified by merchant': 'Location verified by merchant',
    'Directions': 'Directions', 'Your shop': 'Your shop', 'Last 7 days': 'Last 7 days',
    'people viewed your profile this week': 'people viewed your profile this week',
    'WhatsApp clicks': 'WhatsApp clicks', 'navigation clicks': 'navigation clicks',
    '{count} more than last week': '{count} more than last week', 'Same as last week': 'Same as last week',
    'Last week: {count}': 'Last week: {count}',
    'Share your profile link on your WhatsApp status to start getting visitors.': 'Share your profile link on your WhatsApp status to start getting visitors.',
    'Every view and click is recorded automatically.': 'Every view and click is recorded automatically.',
    'Press again to erase all demo data': 'Press again to erase all demo data', 'Reset demo data': 'Reset demo data',
    'View public profile': 'View public profile', 'Your shop can be online in 3 minutes': 'Your shop can be online in 3 minutes',
    'Write a few notes. AI prepares a profile. Review and publish.': 'Write a few notes. AI prepares a profile. Review and publish.',
    'Write what you sell': 'Write what you sell', 'Review the AI profile draft': 'Review the AI profile draft',
    'Add photos and a WhatsApp number': 'Add photos and a WhatsApp number', 'District administrator': 'District administrator',
    'Start selling online': 'Start selling online', 'Saved shops': 'Saved shops',
    'No saved shops yet.': 'No saved shops yet.', 'Explore now': 'Explore now',
    'Your route': 'Your route', 'Edit': 'Edit', 'AI-generated from the LOKALENS directory': 'AI-generated from the LOKALENS directory',
    'Sorted by distance and opening hours': 'Sorted by distance and opening hours',
    '{count} min travel': '{count} min travel', 'No suitable stops. Try a different duration or style.': 'No suitable stops. Try a different duration or style.',
    'Where are you starting?': 'Where are you starting?', 'How much time do you have?': 'How much time do you have?',
    'What kind of trip?': 'What kind of trip?', 'Routes use only merchants listed on LOKALENS. Check opening hours before leaving.': 'Routes use only merchants listed on LOKALENS. Check opening hours before leaving.',
    'Generate route': 'Generate route', 'Planning your route…': 'Planning your route…',
    'Apa yang anda mahu buat?': 'What would you like to do?',
    'Beritahu AI pilihan atau keperluan khas anda. Pilihan ini tidak wajib.': 'Tell the AI your preferences or special requirements. This is optional.',
    'Contoh prompt perjalanan': 'Example: I am travelling with kids, enjoy local food and crafts, and prefer short drives.',
    'Permintaan anda:': 'Your request:',
    'Laluan tidak dapat dijana. Cuba lagi.': 'Could not generate the route. Please try again.',
    'Merchant registration': 'Merchant registration', 'What do you sell?': 'What do you sell?',
    'One-step AI profile': 'One-step AI profile',
    'Example: selling labu sayong pottery in Kuala Kangsar, open Saturday and Sunday': 'Example: selling labu sayong pottery in Kuala Kangsar, open Saturday and Sunday',
    'Generate Profile': 'Generate Profile', 'Regenerate profile': 'Regenerate profile',
    'AI profile ready to review': 'AI profile ready to review', 'Suggested tags': 'Suggested tags',
    'Heritage': 'Heritage', 'Handicraft': 'Handicraft', 'Continue to shop details': 'Continue to shop details',
    'Profile generated. Review and edit before publishing.': 'Profile generated. Review and edit before publishing.',
    'Edit original note': 'Edit original note', 'Generating profile…': 'Generating profile…',
    'Government dashboard': 'Government dashboard',
    'Example: Delicious nasi lemak in front of Bota mosque, open in the morning. We have squid sambal.': 'Example: Delicious nasi lemak in front of Bota mosque, open in the morning. We have squid sambal.',
    'Write like a WhatsApp message. It does not need to be polished.': 'Write like a WhatsApp message. It does not need to be polished.',
    'District': 'District', 'Town or village': 'Town or village', 'Example: Batu Gajah': 'Example: Batu Gajah',
    'Generate profile': 'Generate profile', 'AI is writing your profile…': 'AI is writing your profile…',
    'Review draft': 'Review draft', 'Shop name': 'Shop name', 'AI draft. Review every detail.': 'AI draft. Review every detail.',
    'Automatic draft. Review every detail.': 'Automatic draft. Review every detail.', 'Category': 'Category',
    'Description': 'Description', 'Products (separate with commas)': 'Products (separate with commas)',
    'Close': 'Close', 'Opening days': 'Opening days',
    'Suitable for travellers who enjoy': 'Suitable for travellers who enjoy', 'Rewrite': 'Rewrite',
    'Continue': 'Continue', 'Contact & photos': 'Contact & photos', 'WhatsApp number': 'WhatsApp number',
    'The WhatsApp button will open wa.me/{phone}': 'The WhatsApp button will open wa.me/{phone}',
    'Enter a complete number': 'Enter a complete number', 'Photos (up to 3)': 'Photos (up to 3)',
    '{count} photos selected': '{count} photos selected', 'Choose photos': 'Choose photos',
    'Shop location': 'Shop location', 'Verified ({how})': 'Verified ({how})',
    'Use my current location': 'Use my current location', 'Tap this while you are at the shop.': 'Tap this while you are at the shop.',
    'This browser does not support GPS. Enter the shop address.': 'This browser does not support GPS. Enter the shop address.',
    'Location access denied. Enter the shop address manually.': 'Location access denied. Enter the shop address manually.',
    'Use GPS or enter the shop address.': 'Use GPS or enter the shop address.',
    'GPS location is unavailable. Enter the shop address manually.': 'GPS location is unavailable. Enter the shop address manually.',
    'Tap this while you are at the shop, or enter the address below.': 'Tap this while you are at the shop, or enter the address below.',
    'Shop address': 'Shop address', 'Example shop address': 'Example: 12 Jalan Sultan Iskandar, Ipoh, Perak',
    'The address will open as a Google Maps search.': 'The address will open as a Google Maps search.',
    'Shop location filled from phone GPS.': 'Shop location filled from phone GPS.',
    'Using the address you entered.': 'Using the address you entered.',
    'Pautan video TikTok (pilihan)': 'TikTok video link (optional)',
    'Gunakan pautan video TikTok penuh yang mengandungi /video/ID.': 'Use the full TikTok video URL containing /video/ID.',
    'Masukkan pautan video TikTok yang sah atau kosongkan ruangan ini.': 'Enter a valid TikTok video URL or leave this field empty.',
    'Video TikTok': 'TikTok video',
    'Video TikTok daripada {name}': 'TikTok video from {name}',
    'Tidak dapat memainkan video? Buka di TikTok': 'Video not playing? Open it on TikTok',
    'Peniaga popular': 'Top-rated merchants',
    'Dinilai 4 bintang ke atas · sekurang-kurangnya 3 ulasan': 'Rated 4+ stars · at least 3 reviews',
    'Peniaga popular tidak dapat dimuat': 'Could not load top-rated merchants',
    'Ulasan pengunjung': 'Visitor reviews',
    '{count} ulasan': '{count} reviews',
    'Belum ada ulasan': 'No reviews yet',
    'Tutup': 'Close',
    'Tulis ulasan': 'Write a review',
    'Ulasan tidak dapat dimuat atau dihantar': 'Could not load or submit reviews',
    'Terima kasih atas ulasan anda.': 'Thank you for your review.',
    'Ulasan contoh': 'Sample review',
    'Nama anda': 'Your name',
    'Penilaian': 'Rating',
    'Beri {count} bintang': 'Give {count} stars',
    'Ulasan anda (pilihan)': 'Your review (optional)',
    'Sedang menghantar…': 'Submitting…',
    'Hantar ulasan': 'Submit review',
    'Failed to publish. Please try again.': 'Failed to publish. Please try again.', 'Publishing…': 'Publishing…',
    'Publish': 'Publish', 'District administrator: Highlights': 'District administrator: Highlights',
    'Announcement or promotion text': 'Announcement or promotion text',
    'Paste a press release, district council Facebook post, or event flyer.': 'Paste a press release, district council Facebook post, or event flyer.',
    'Highlight draft {source}': 'Highlight draft {source}', 'Administrator passcode': 'Administrator passcode',
    'Summarize': 'Summarize', 'Reset': 'Reset', 'Invalid district': 'Invalid district',
    '2 hours': '2 hours', 'Half day': 'Half day', 'Full day': 'Full day',
    'Culture': 'Culture', 'Nature': 'Nature', 'Relaxed': 'Relaxed',
    'Food': 'Food', 'Drinks & Coffee': 'Drinks & Coffee', 'Kuih & Pastries': 'Kuih & Pastries',
    'Handicrafts': 'Handicrafts', 'Farm Produce': 'Farm Produce', 'Experiences': 'Experiences',
    'Setiap hari': 'Every day',
    'Data contoh': 'Sample data', 'Buka': 'Open', 'Ditutup': 'Closed', 'Kembali': 'Back',
    'Mod demo: data disimpan dalam pelayar ini, AI guna peraturan tempatan': 'Demo mode: data is stored in this browser; AI uses local rules',
    'Teroka': 'Explore', 'Simpan': 'Saved', 'Peniaga': 'Merchants', 'Semua': 'All',
    'Teroka daerah. Jumpa peniaga tempatan.': 'Explore the district. Meet local merchants.',
    'Cari laksa, labu sayong, kopi…': 'Search laksa, labu sayong, coffee…',
    'Sorotan Daerah': 'District highlights', 'Ringkasan AI': 'AI summary',
    'Tiada padanan. Cuba kategori atau daerah lain.': 'No matches. Try another category or district.',
    '✨ Tak pasti nak ke mana?': '✨ Not sure where to go?',
    'Jana laluan sehari dengan AI Trip Planner.': 'Plan a day trip with AI Trip Planner.',
    'Gagal memuat data: {error}': 'Failed to load data: {error}',
    'Tidak dijumpai': 'Not found', 'Profil ini tiada.': 'This profile is unavailable.',
    'Produk': 'Products', 'Hari buka:': 'Opening days:',
    'Hubungi peniaga': 'Contact the merchant', 'Lokasi disahkan oleh peniaga': 'Location verified by merchant',
    '📍 Navigasi': '📍 Directions', 'Kedai anda': 'Your shop', '7 hari lepas': 'Last 7 days',
    'orang melihat profil anda minggu ini': 'people viewed your profile this week',
    'klik ke WhatsApp': 'WhatsApp clicks', 'klik navigasi': 'navigation clicks',
    'dari minggu lepas': 'more than last week', 'Sama seperti minggu lepas': 'Same as last week',
    'Minggu lepas: {count}': 'Last week: {count}',
    'Kongsi pautan profil anda di WhatsApp status untuk mula dapat pelawat.': 'Share your profile link on your WhatsApp status to start getting visitors.',
    'Setiap paparan dan klik direkod secara automatik.': 'Every view and click is recorded automatically.',
    'Tekan sekali lagi untuk padam semua data demo': 'Press again to erase all demo data',
    'Set semula data demo': 'Reset demo data', 'Lihat profil awam': 'View public profile',
    'Kedai anda online dalam 3 minit': 'Your shop can be online in 3 minutes',
    'Tulis nota ringkas. AI sediakan profil. Anda semak dan terbit.': 'Write a few notes. AI prepares a profile. Review and publish.',
    'Tulis apa yang anda jual': 'Write what you sell', 'Semak draf profil AI': 'Review the AI profile draft',
    'Tambah gambar dan nombor WhatsApp': 'Add photos and a WhatsApp number',
    'Pentadbir daerah': 'District administrator', 'Mula Berniaga Online': 'Start selling online',
    'Disimpan': 'Saved shops', 'Belum ada kedai disimpan.': 'No saved shops yet.',
    'Teroka sekarang': 'Explore now', 'Laluan Anda': 'Your route', 'Ubah': 'Edit',
    'Dijana oleh AI daripada senarai LOKALENS': 'AI-generated from the LOKALENS directory',
    'Disusun ikut jarak dan waktu buka': 'Sorted by distance and opening hours',
    'min perjalanan': 'min travel', 'Tiada hentian sesuai. Tukar tempoh atau gaya.': 'No suitable stops. Try a different duration or style.',
    'Mula dari mana?': 'Where are you starting?', 'Berapa lama masa anda?': 'How much time do you have?',
    'Gaya perjalanan?': 'What kind of trip?',
    'Laluan hanya guna peniaga berdaftar di LOKALENS. Semak waktu buka sebelum bertolak.': 'Routes use only merchants listed on LOKALENS. Check opening hours before leaving.',
    'Jana Laluan': 'Generate route', '✨ Menyusun laluan anda…': 'Planning your route…',
    'Daftar Kedai': 'Merchant registration', 'Apa yang anda jual?': 'What do you sell?',
    'Contoh: Nasi lemak sedap depan masjid Bota, buka pagi. Ada sambal sotong.': 'Example: Delicious nasi lemak in front of Bota mosque, open in the morning. We have squid sambal.',
    'Tulis macam mesej WhatsApp. Tak perlu ayat cantik.': 'Write like a WhatsApp message. It does not need to be polished.',
    'Daerah': 'District', 'Bandar atau kampung': 'Town or village', 'Contoh: Batu Gajah': 'Example: Batu Gajah',
    'Profil AI dalam satu langkah': 'One-step AI profile',
    'Contoh: jual kraf pasu labu sayong kt kuala kangsar buka sabtu ahad': 'Example: selling labu sayong pottery in Kuala Kangsar, open Saturday and Sunday',
    'Jana semula profil': 'Regenerate profile', 'Profil AI sedia untuk disemak': 'AI profile ready to review',
    'Tag dicadangkan': 'Suggested tags', 'Warisan': 'Heritage', 'Kraf tangan': 'Handicraft',
    'Teruskan ke butiran kedai': 'Continue to shop details',
    'Profil anda sudah dijana. Semak dan ubah sebelum diterbitkan.': 'Profile generated. Review and edit before publishing.',
    'Ubah nota asal': 'Edit original note', 'Sedang menjana profil…': 'Generating profile…',
    'Jana Profil': 'Generate Profile', 'Papan pemuka kerajaan': 'Government dashboard',
    '✨ Jana Profil': '✨ Generate profile', '✨ AI sedang menulis profil anda…': '✨ AI is writing your profile…',
    'Semak Draf': 'Review draft', 'Nama kedai': 'Shop name',
    'Draf oleh AI. Semak setiap butiran.': 'AI draft. Review every detail.',
    'Draf automatik. Semak setiap butiran.': 'Automatic draft. Review every detail.',
    'Kategori': 'Category', 'Penerangan': 'Description',
    'Produk (asingkan dengan koma)': 'Products (separate with commas)',
    'Waktu tutup': 'Close', 'Hari buka': 'Opening days',
    'Sesuai untuk pelancong yang suka': 'Suitable for travellers who enjoy',
    'Tulis semula': 'Rewrite', 'Teruskan': 'Continue',
    'Hubungan & Gambar': 'Contact & photos', 'Nombor WhatsApp': 'WhatsApp number',
    'Butang WhatsApp akan buka wa.me/{phone}': 'The WhatsApp button will open wa.me/{phone}',
    'Masukkan nombor penuh': 'Enter a complete number', 'Gambar (sehingga 3)': 'Photos (up to 3)',
    '{count} gambar dipilih': '{count} photos selected', 'Pilih gambar': 'Choose photos',
    'Lokasi kedai': 'Shop location', 'Disahkan ({how})': 'Verified ({how})',
    'Guna lokasi saya sekarang': 'Use my current location', 'Tekan ini semasa anda berada di kedai.': 'Tap this while you are at the shop.',
    'Pelayar ini tidak menyokong GPS. Masukkan alamat kedai.': 'This browser does not support GPS. Enter the shop address.',
    'Akses lokasi ditolak. Masukkan alamat kedai secara manual.': 'Location access denied. Enter the shop address manually.',
    'Gunakan GPS atau masukkan alamat kedai.': 'Use GPS or enter the shop address.',
    'Lokasi GPS tidak tersedia. Masukkan alamat kedai secara manual.': 'GPS location is unavailable. Enter the shop address manually.',
    'Tekan ini semasa anda berada di kedai, atau masukkan alamat di bawah.': 'Tap this while you are at the shop, or enter the address below.',
    'Alamat kedai': 'Shop address', 'Contoh alamat kedai': 'Example: 12 Jalan Sultan Iskandar, Ipoh, Perak',
    'Alamat akan dibuka sebagai carian di Google Maps.': 'The address will open as a Google Maps search.',
    'Lokasi kedai diisi daripada GPS telefon.': 'Shop location filled from phone GPS.',
    'Menggunakan alamat yang dimasukkan.': 'Using the address you entered.',
    'Gagal terbit. Cuba lagi.': 'Failed to publish. Please try again.', 'Menerbit…': 'Publishing…', '🚀 Terbit': '🚀 Publish',
    'Pentadbir: Sorotan Daerah': 'District administrator: Highlights',
    'Teks pengumuman atau promosi': 'Announcement or promotion text',
    'Tampal kenyataan media, hantaran Facebook majlis daerah, atau risalah acara.': 'Paste a press release, district council Facebook post, or event flyer.',
    'Draf sorotan {source}': 'Highlight draft {source}', 'Kod pentadbir': 'Administrator passcode',
    '✨ Ringkaskan': '✨ Summarize', 'Semula': 'Reset', 'Terbit': 'Publish',
    '2 Jam': '2 hours', 'Separuh Hari': 'Half day', 'Sehari Penuh': 'Full day',
    'Budaya': 'Culture', 'Alam': 'Nature', 'Santai': 'Relaxed',
    'Minuman & Kopi': 'Drinks & Coffee', 'Kuih & Pastri': 'Kuih & Pastries',
    'Kraftangan': 'Handicrafts', 'Produk Tani': 'Farm Produce', 'Pengalaman': 'Experiences',
  },
  ms: {},
}

const categories = {
  'Makanan': 'Food',
  'Minuman & Kopi': 'Drinks & Coffee',
  'Kuih & Pastri': 'Kuih & Pastries',
  'Kraftangan': 'Handicrafts',
  'Produk Tani': 'Farm Produce',
  'Pengalaman': 'Experiences',
}

const sampleMerchants = {
  '000000000001': ['Kopitiam Pak Long', 'An old-town family kopitiam in Ipoh. White coffee is brewed every morning and served with kaya toast and soft-boiled eggs.', ['White coffee', 'Kaya toast', 'Soft-boiled eggs'], 'Every day'],
  '000000000002': ['Tau Fu Fa Mak Jah', 'Silky tau fu fa with palm sugar syrup. This small roadside stall is a lovely dessert stop after lunch.', ['Tau fu fa', 'Soy milk'], 'Tuesday to Sunday'],
  '000000000003': ['Nasi Lemak Kak Ros', 'Packed nasi lemak with homemade sambal. It often sells out early, so come before 10 am.', ['Nasi lemak', 'Squid sambal', 'Assorted kuih'], 'Every day except Friday'],
  '000000000004': ['Pak Ali’s Pomelo Orchard', 'A pomelo orchard in Tambun. Visitors can taste fresh fruit and buy directly from the orchard.', ['Pomelo', 'Pomelo juice'], 'Every day'],
  '000000000005': ['Ulu Kinta Forest Trails', 'Take a guided hike to a waterfall with a local guide. Small groups; book a day ahead on WhatsApp.', ['2-hour guided hike', 'Waterfall swim'], 'Saturday and Sunday'],
  '000000000006': ['Ipoh Hand-Painted Batik Studio', 'A hand-painted batik studio. Visitors can try painting their own batik handkerchief in a one-hour session.', ['Batik handkerchief', '1-hour batik class', 'Shawl'], 'Wednesday to Monday'],
  '000000000007': ['Labu Sayong Mak Teh', 'Labu sayong pottery is shaped and traditionally fired in Kampung Sayong. Watch the process and buy directly from the maker.', ['Labu sayong pottery', 'Pottery-making demo'], 'Every day except Friday'],
  '000000000008': ['Riverside Fried Banana', 'Hot fried bananas by the Perak River. Seating overlooks the river—perfect for an afternoon tea break.', ['Fried banana', 'Prawn fritters', 'Teh tarik'], 'Every day'],
  '000000000009': ['Laksa Opah Kuala Kangsar', 'Fish laksa made from a three-generation family recipe. A small shop near the old town.', ['Laksa', 'Cendol'], 'Every day'],
  '000000000010': ['Kuala Kangsar Heritage Tekat', 'Gold-thread tekat embroidery by local artisans. Small souvenirs and custom orders are available.', ['Small framed tekat', 'Custom orders'], 'Monday to Saturday'],
}

const sampleHighlights = {
  h1: ['Tambun pomelo season', 'The orchards in Tambun are open for fresh fruit tasting. Visit in the morning for the best selection.'],
  h2: ['Weekend labu sayong demo', 'A pottery maker in Kampung Sayong demonstrates shaping and firing labu sayong every Saturday.'],
  h3: ['Afternoon tea by the Perak River', 'The riverside fried banana stall opens from 3 pm. A lovely stop after visiting the royal town.'],
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem('lokalens_language') === 'en' ? 'en' : 'ms' } catch { return 'ms' }
  })

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'ms'
    try { localStorage.setItem('lokalens_language', language) } catch {}
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key, vars = {}) => Object.entries(vars).reduce(
      (text, [name, replacement]) => text.replaceAll(`{${name}}`, replacement),
      language === 'en' ? (translations.en[key] || key) : key
    ),
  }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}

export function translateCategory(category, language) {
  return language === 'en' ? (categories[category] || category) : category
}

export function localizeMerchant(merchant, language) {
  if (language !== 'en' || !merchant?.is_sample) return merchant
  const id = String(merchant.id).slice(-12)
  const translation = sampleMerchants[id]
  if (!translation) return { ...merchant, category: translateCategory(merchant.category, language) }
  const [name, description, products, open_days] = translation
  return { ...merchant, name, description, products, open_days, category: translateCategory(merchant.category, language) }
}

export function localizeHighlight(highlight, language) {
  return language === 'en' && sampleHighlights[highlight.id]
    ? { ...highlight, title: sampleHighlights[highlight.id][0], summary: sampleHighlights[highlight.id][1] }
    : highlight
}
