import './AdminDashboard.css';

export default function AdminDashboard() {
    // Mock Data
    const stats = [
        { label: 'Total Bookings', value: '124', icon: '📅', color: 'blue' },
        { label: 'Pending Approvals', value: '12', icon: '⏳', color: 'orange' },
        { label: 'Gallery Photos', value: '840', icon: '🖼️', color: 'purple' },
        { label: 'Revenue (LKR)', value: '1.2M', icon: '💰', color: 'green' }
    ];

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
                    <p className="placeholder-text">Coming soon: List of recent bookings to approve/reject...</p>
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
