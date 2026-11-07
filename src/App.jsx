import { Routes, Route, useLocation } from 'react-router-dom'
import { BottomNav, DemoBanner } from './components/ui.jsx'
import Explore from './pages/Explore.jsx'
import MerchantDetail from './pages/MerchantDetail.jsx'
import TripPlanner from './pages/TripPlanner.jsx'
import Saved from './pages/Saved.jsx'
import MerchantHome from './pages/MerchantHome.jsx'
import Onboard from './pages/Onboard.jsx'
import Admin from './pages/Admin.jsx'
import { LanguageToggle } from './components/ui.jsx'

// Screens with their own thumb-zone actions hide the bottom nav.
const NO_NAV = [/^\/m\//, /^\/peniaga\/daftar/, /^\/admin/]

export default function App() {
  const { pathname } = useLocation()
  const showNav = !NO_NAV.some((re) => re.test(pathname))
  const isAdmin = pathname === '/admin'
  return (
    <div className={`mx-auto min-h-dvh w-full ${isAdmin ? 'max-w-6xl' : 'max-w-md'} bg-stone-50 shadow-xl`}>
      <div className="sticky top-0 z-40 flex h-10 items-center justify-end border-b border-stone-200 bg-stone-50/95 px-4 backdrop-blur">
        <LanguageToggle />
      </div>
      <DemoBanner />
      <main className={showNav ? 'pb-24' : 'pb-28'}>
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/m/:id" element={<MerchantDetail />} />
          <Route path="/trip" element={<TripPlanner />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/peniaga" element={<MerchantHome />} />
          <Route path="/peniaga/daftar" element={<Onboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Explore />} />
        </Routes>
      </main>
      {showNav && <BottomNav />}
    </div>
  )
}
