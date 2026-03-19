import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import BookingForm from './components/BookingForm/BookingForm'
import Gallery from './components/Gallery/Gallery'
import GalleryCategoryView from './components/Gallery/GalleryCategoryView'
import GalleryEventView from './components/Gallery/GalleryEventView'
import AboutUs from './components/AboutUs/AboutUs'
import ContactUs from './components/ContactUs/ContactUs'
import Footer from './components/Footer/Footer'
import AdminLogin from './components/Admin/Login/AdminLogin'
import AdminLayout from './components/Admin/Layout/AdminLayout'
import AdminDashboard from './components/Admin/Dashboard/AdminDashboard'
import AdminBookings from './components/Admin/Bookings/AdminBookings'
import AdminPackages from './components/Admin/Packages/AdminPackages'
import AdminGallery from './components/Admin/Gallery/AdminGallery'
import AdminMessages from './components/Admin/Messages/AdminMessages'
import { AuthProvider } from './context/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes with Navbar */}
          <Route path="/" element={<><Navbar /><div className="public-layout"><BookingForm /><Footer /></div></>} />
          <Route path="/gallery" element={<><Navbar /><div className="public-layout"><Gallery /><Footer /></div></>} />
          <Route path="/about" element={<><Navbar /><div className="public-layout"><AboutUs /><Footer /></div></>} />
          <Route path="/contact" element={<><Navbar /><div className="public-layout"><ContactUs /><Footer /></div></>} />
          <Route path="/gallery/:categoryId" element={<><Navbar /><div className="public-layout"><GalleryCategoryView /><Footer /></div></>} />
          <Route path="/gallery/:categoryId/:eventId" element={<><Navbar /><div className="public-layout"><GalleryEventView /><Footer /></div></>} />

          {/* Admin Routes without Navbar */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
