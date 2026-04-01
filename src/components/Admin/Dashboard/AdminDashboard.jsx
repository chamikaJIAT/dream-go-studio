import { useState, useEffect } from 'react';
import { apiCall } from '../../../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                apiCall('/stats'),
                apiCall('/bookings')
            ]);
            setStats(statsRes.stats);
            // Show only first 5 recent bookings
            setRecentBookings(bookingsRes.bookings.slice(0, 5));
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="dashboard-loading">Loading Dashboard Metrics...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="stats-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`stat-card ${stat.color}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-widgets">
                <div className="widget-card recent-bookings">
                    <h3>Recent Booking Requests</h3>
                    <div className="recent-list">
                        {recentBookings.length === 0 ? (
                            <p className="empty-msg">No new bookings yet.</p>
                        ) : recentBookings.map(b => (
                            <div key={b.id} className="recent-item">
                                <div className="recent-meta">
                                    <strong>{b.customerName}</strong>
                                    <span>{b.category}</span>
                                </div>
                                <div className={`recent-status ${b.status.toLowerCase()}`}>{b.status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="widget-card quick-actions">
                    <h3>Quick Actions</h3>
                    <div className="actions-grid">
                        <button>Upload Photos</button>
                        <button>Add Package</button>
                        <button>Settings</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
