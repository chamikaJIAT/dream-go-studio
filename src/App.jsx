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
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes with Navbar */}
        <Route path="/" element={<><Navbar /><BookingForm /></>} />
        <Route path="/gallery" element={<><Navbar /><Gallery /></>} />

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
  )
}

export default App
