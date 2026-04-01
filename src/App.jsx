import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import BookingForm from './components/BookingForm/BookingForm'
import Gallery from './components/Gallery/Gallery'
import GalleryCategoryView from './components/Gallery/GalleryCategoryView'
import GalleryEventView from './components/Gallery/GalleryEventView'
import AboutUs from './components/AboutUs/AboutUs'
import ContactUs from './components/ContactUs/ContactUs'
import Footer from './components/Footer/Footer'
import ClientBookings from './components/ClientBookings/ClientBookings'
import AdminLogin from './components/Admin/Login/AdminLogin'
import AdminLayout from './components/Admin/Layout/AdminLayout'
import AdminDashboard from './components/Admin/Dashboard/AdminDashboard'
import AdminBookings from './components/Admin/Bookings/AdminBookings'
import AdminOldBookings from './components/Admin/OldBookings/AdminOldBookings'
import AdminPackages from './components/Admin/Packages/AdminPackages'
import AdminGallery from './components/Admin/Gallery/AdminGallery'
import AdminMessages from './components/Admin/Messages/AdminMessages'
import AdminUsers from './components/Admin/Users/AdminUsers'
import AdminEmployees from './components/Admin/Employees/AdminEmployees'
import StaffManagement from './components/Admin/Employees/StaffManagement'
import AdminLogs from './components/Admin/Logs/AdminLogs'
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
          <Route path="/my-bookings" element={<><Navbar /><div className="public-layout"><ClientBookings /><Footer /></div></>} />
          <Route path="/gallery/:categoryId" element={<><Navbar /><div className="public-layout"><GalleryCategoryView /><Footer /></div></>} />
          <Route path="/gallery/:categoryId/:eventId" element={<><Navbar /><div className="public-layout"><GalleryEventView /><Footer /></div></>} />

          {/* Admin Routes without Navbar */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="old-bookings" element={<AdminOldBookings />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
