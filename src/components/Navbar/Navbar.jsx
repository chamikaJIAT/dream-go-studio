import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoWhite from '../../logo/DreamGO -White.png';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (window.innerWidth <= 768) {
            setIsOpen(false);
        }
    }, [location.pathname]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const navLinks = [
        { path: '/', label: 'Booking', icon: '📅' },
        { path: '/gallery', label: 'Gallery', icon: '🖼️' },
        { path: '/about', label: 'About Us', icon: 'ℹ️' },
        { path: '/contact', label: 'Contact Us', icon: '📞' }
    ];

    return (
        <>
            {/* Mobile Top Bar (Only visible on small screens) */}
            <div className="mobile-topbar">
                <Link to="/" className="mobile-logo">
                    <img src={logoWhite} alt="Dream Go Logo" />
                </Link>
                <div className="mobile-menu-btn" onClick={toggleMenu}>
                    <div className={`hamburger ${isOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>

            {/* Main Sidebar */}
            <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-container">
                    <Link to="/" className="sidebar-logo">
                        <img src={logoWhite} alt="Dream Go Logo" />
                    </Link>

                    <div className="sidebar-links">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                            >
                                <span className="icon">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                        {user && (
                            <Link
                                to="/my-bookings"
                                className={`sidebar-link ${location.pathname === '/my-bookings' ? 'active' : ''}`}
                            >
                                <span className="icon">🧾</span>
                                My Bookings
                            </Link>
                        )}
                    </div>

                    {user && (
                        <div className="sidebar-user-section">
                            <div className="user-profile">
                                <div className="user-avatar">{user.name.charAt(0)}</div>
                                <div className="user-info">
                                    <span className="user-name">{user.name.split(' ')[0]}</span>
                                    <span className="user-username">@{user.username}</span>
                                </div>
                            </div>
                            <button className="user-logout-btn" onClick={logout}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                <div className="sidebar-footer">
                    <p>© {new Date().getFullYear()} Dream Go.</p>
                </div>
            </nav>

            {/* Overlay for mobile when sidebar is open */}
            {isOpen && <div className="sidebar-overlay" onClick={toggleMenu}></div>}
        </>
    );
}

