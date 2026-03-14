import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import BookingForm from './components/BookingForm/BookingForm'
import Gallery from './components/Gallery/Gallery'
import AdminLogin from './components/Admin/Login/AdminLogin'
import AdminLayout from './components/Admin/Layout/AdminLayout'
import AdminDashboard from './components/Admin/Dashboard/AdminDashboard'
import AdminBookings from './components/Admin/Bookings/AdminBookings'
import AdminPackages from './components/Admin/Packages/AdminPackages'
import AdminGallery from './components/Admin/Gallery/AdminGallery'
import { AuthProvider } from './context/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes with Navbar */}
          <Route path="/" element={<><Navbar /><div className="public-layout"><BookingForm /></div></>} />
          <Route path="/gallery" element={<><Navbar /><div className="public-layout"><Gallery /></div></>} />

          {/* Admin Routes without Navbar */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="packages" element={<AdminPackages />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
