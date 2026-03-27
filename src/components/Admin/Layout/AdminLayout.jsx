import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import logoWhite from '../../../logo/DreamGO -White.png';
import './AdminLayout.css';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (window.innerWidth <= 768) {
            setIsOpen(false);
        }
    }, [location.pathname]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            navigate('/admin/login');
        }
    };

    const navItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/bookings', icon: '📅', label: 'Bookings' },
        { path: '/admin/old-bookings', icon: '⏳', label: 'Old Bookings' },
        { path: '/admin/gallery', icon: '🖼️', label: 'Gallery' },
        { path: '/admin/packages', icon: '📦', label: 'Packages' },
        { path: '/admin/messages', icon: '💬', label: 'Messages' },
    ];

    return (
        <div className="admin-layout-container">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src={logoWhite} alt="Dream Go Logo" className="admin-logo" />
                    <span className="badge">Admin Hub</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-link ${location.pathname.includes(item.path) ? 'active' : ''}`}
                        >
                            <span className="icon">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && <div className="admin-sidebar-overlay" onClick={toggleMenu}></div>}

            {/* Main Content Area */}
            <main className="admin-main-content">
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <div className="admin-mobile-menu-btn" onClick={toggleMenu}>
                            <div className={`hamburger ${isOpen ? 'open' : ''}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <div className="topbar-title">
                            <h3>{navItems.find(i => location.pathname.includes(i.path))?.label || 'Dashboard'}</h3>
                        </div>
                    </div>
                    <div className="admin-profile">
                        <div className="avatar">A</div>
                        <span className="profile-name">Admin User</span>
                        <button className="topbar-logout-btn" onClick={handleLogout} title="Logout">
                            🚪
                        </button>
                    </div>
                </header>

                <div className="admin-content-wrapper">
                    <Outlet /> {/* Child routes will render here */}
                </div>
            </main>
        </div>
    );
}
