// SAMPLE DATA. Names and locations are placeholders. Sample listings carry no phone number.
// Replace with the 10 real merchants once owners give permission.

export const DISTRICTS = ['Kinta', 'Kuala Kangsar']

export const CATEGORIES = [
  'Makanan',
  'Minuman & Kopi',
  'Kuih & Pastri',
  'Kraftangan',
  'Produk Tani',
  'Pengalaman',
]

export const VIBES = [
  { id: 'foodie', label: 'Foodie', emoji: '🍜' },
  { id: 'culture', label: 'Budaya', emoji: '🏺' },
  { id: 'nature', label: 'Alam', emoji: '🌿' },
  { id: 'chill', label: 'Santai', emoji: '☕' },
]

export const STARTS = {
  Ipoh: { lat: 4.5975, lng: 101.0901, district: 'Kinta' },
  'Batu Gajah': { lat: 4.469, lng: 101.041, district: 'Kinta' },
  'Kuala Kangsar': { lat: 4.77, lng: 100.938, district: 'Kuala Kangsar' },
}

export const SEED_MERCHANTS = [
  {
    id: 'a1000000-0000-4000-8000-000000000001',
    name: 'Kopitiam Pak Long',
    district: 'Kinta', town: 'Ipoh',
    category: 'Minuman & Kopi',
    description: 'Kopitiam keluarga di Ipoh lama. Kopi putih dibancuh setiap pagi, dihidang bersama roti bakar kaya dan telur separuh masak.',
    products: ['Kopi putih', 'Roti bakar kaya', 'Telur separuh masak'],
    tags: ['foodie', 'chill'],
    open_time: '07:00', close_time: '15:00', open_days: 'Setiap hari',
    lat: 4.5978, lng: 101.0785, emoji: '☕',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000002',
    name: 'Tau Fu Fa Mak Jah',
    district: 'Kinta', town: 'Ipoh',
    category: 'Kuih & Pastri',
    description: 'Tau fu fa lembut dengan sirap gula merah. Gerai kecil di tepi jalan, sesuai untuk pencuci mulut selepas makan tengah hari.',
    products: ['Tau fu fa', 'Air soya'],
    tags: ['foodie'],
    open_time: '10:00', close_time: '18:00', open_days: 'Selasa hingga Ahad',
    lat: 4.5952, lng: 101.0822, emoji: '🍮',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000003',
    name: 'Nasi Lemak Kak Ros',
    district: 'Kinta', town: 'Batu Gajah',
    category: 'Makanan',
    description: 'Nasi lemak bungkus dengan sambal tumis buatan sendiri. Habis awal pagi, datang sebelum jam 10.',
    products: ['Nasi lemak', 'Sambal sotong', 'Kuih muih'],
    tags: ['foodie'],
    open_time: '06:30', close_time: '11:30', open_days: 'Setiap hari kecuali Jumaat',
    lat: 4.4691, lng: 101.0412, emoji: '🍛',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000004',
    name: 'Kebun Limau Bali Pak Ali',
    district: 'Kinta', town: 'Tambun',
    category: 'Produk Tani',
    description: 'Kebun limau bali di Tambun. Pengunjung boleh rasa buah segar dan beli terus dari kebun.',
    products: ['Limau bali', 'Jus limau bali'],
    tags: ['nature', 'foodie'],
    open_time: '09:00', close_time: '18:00', open_days: 'Setiap hari',
    lat: 4.6205, lng: 101.1488, emoji: '🍊',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000005',
    name: 'Jejak Hutan Ulu Kinta',
    district: 'Kinta', town: 'Tanjung Rambutan',
    category: 'Pengalaman',
    description: 'Trek berpandu ke air terjun bersama pemandu tempatan. Kumpulan kecil, tempah sehari lebih awal melalui WhatsApp.',
    products: ['Trek berpandu 2 jam', 'Mandi air terjun'],
    tags: ['nature'],
    open_time: '08:00', close_time: '17:00', open_days: 'Sabtu dan Ahad',
    lat: 4.6702, lng: 101.1601, emoji: '🌿',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000006',
    name: 'Studio Batik Lukis Ipoh',
    district: 'Kinta', town: 'Ipoh',
    category: 'Kraftangan',
    description: 'Studio batik lukis tangan. Pengunjung boleh cuba melukis sapu tangan batik sendiri dalam sesi 1 jam.',
    products: ['Sapu tangan batik', 'Kelas batik 1 jam', 'Selendang'],
    tags: ['culture'],
    open_time: '10:00', close_time: '18:00', open_days: 'Rabu hingga Isnin',
    lat: 4.5901, lng: 101.0898, emoji: '🎨',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000007',
    name: 'Labu Sayong Mak Teh',
    district: 'Kuala Kangsar', town: 'Kampung Sayong',
    category: 'Kraftangan',
    description: 'Labu sayong dibentuk dan dibakar secara tradisional di Kampung Sayong. Lihat proses membuat labu dan beli terus dari pembuat.',
    products: ['Labu sayong', 'Demo membuat labu'],
    tags: ['culture'],
    open_time: '09:00', close_time: '17:00', open_days: 'Setiap hari kecuali Jumaat',
    lat: 4.7931, lng: 100.9288, emoji: '🏺',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000008',
    name: 'Pisang Goreng Tebing Sungai',
    district: 'Kuala Kangsar', town: 'Kuala Kangsar',
    category: 'Makanan',
    description: 'Pisang goreng panas di tebing Sungai Perak. Tempat duduk menghadap sungai, sesuai untuk minum petang.',
    products: ['Pisang goreng', 'Cucur udang', 'Teh tarik'],
    tags: ['foodie', 'chill', 'nature'],
    open_time: '15:00', close_time: '19:30', open_days: 'Setiap hari',
    lat: 4.7702, lng: 100.9421, emoji: '🍌',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000009',
    name: 'Laksa Opah Kuala Kangsar',
    district: 'Kuala Kangsar', town: 'Kuala Kangsar',
    category: 'Makanan',
    description: 'Laksa kuah ikan resipi keluarga tiga generasi. Kedai kecil berhampiran pekan lama.',
    products: ['Laksa', 'Cendol'],
    tags: ['foodie'],
    open_time: '11:00', close_time: '16:00', open_days: 'Setiap hari',
    lat: 4.7719, lng: 100.9377, emoji: '🍲',
  },
  {
    id: 'a1000000-0000-4000-8000-000000000010',
    name: 'Tekat Warisan Kuala Kangsar',
    district: 'Kuala Kangsar', town: 'Kuala Kangsar',
    category: 'Kraftangan',
    description: 'Sulaman tekat benang emas oleh tukang tempatan. Tersedia cenderamata kecil dan tempahan khas.',
    products: ['Tekat bingkai kecil', 'Tempahan khas'],
    tags: ['culture', 'chill'],
    open_time: '09:00', close_time: '17:00', open_days: 'Isnin hingga Sabtu',
    lat: 4.7648, lng: 100.9352, emoji: '🧵',
  },
].map((m) => ({ ...m, photos: [], is_sample: true, is_published: true }))

export const SEED_HIGHLIGHTS = [
  {
    id: 'h1', district: 'Kinta', is_sample: true,
    title: 'Musim limau bali Tambun',
    summary: 'Kebun di Tambun buka untuk rasa buah segar. Datang pagi untuk pilihan terbaik.',
  },
  {
    id: 'h2', district: 'Kuala Kangsar', is_sample: true,
    title: 'Demo labu sayong hujung minggu',
    summary: 'Pembuat labu di Kampung Sayong tunjuk proses membentuk dan membakar labu setiap Sabtu.',
  },
  {
    id: 'h3', district: 'Kuala Kangsar', is_sample: true,
    title: 'Minum petang tepi Sungai Perak',
    summary: 'Gerai pisang goreng di tebing sungai buka dari 3 petang. Sesuai selepas lawatan pekan diraja.',
  },
]
