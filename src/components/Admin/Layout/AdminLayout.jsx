import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Basic mock logout
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/bookings', icon: '📅', label: 'Bookings' },
        { path: '/admin/gallery', icon: '🖼️', label: 'Gallery' },
        { path: '/admin/packages', icon: '📦', label: 'Packages' },
    ];

    return (
        <div className="admin-layout-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Dream Go<span>.</span></h2>
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

            {/* Main Content Area */}
            <main className="admin-main-content">
                <header className="admin-topbar">
                    <div className="topbar-title">
                        <h3>{navItems.find(i => location.pathname.includes(i.path))?.label || 'Dashboard'}</h3>
                    </div>
                    <div className="admin-profile">
                        <div className="avatar">A</div>
                        <span>Admin User</span>
                    </div>
                </header>

                <div className="admin-content-wrapper">
                    <Outlet /> {/* Child routes will render here */}
                </div>
            </main>
        </div>
    );
}
