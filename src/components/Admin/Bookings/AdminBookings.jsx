import { useState, useEffect } from 'react';
import { apiCall } from '../../../api';
import './AdminBookings.css';

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [packages, setPackages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [selectedPackageIds, setSelectedPackageIds] = useState([]);
    const [editBookingDate, setEditBookingDate] = useState('');
    const [editTotalAmount, setEditTotalAmount] = useState(0);
    const admin = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchBookings = async () => {
        try {
            const res = await apiCall('/bookings');
            setBookings(res.bookings);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        }
    };

    const fetchPackages = async () => {
        try {
            const res = await apiCall('/packages');
            setPackages(res.packages);
        } catch (err) {
            console.error('Failed to fetch packages', err);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchPackages();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await apiCall(`/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    status: newStatus,
                    adminId: admin.id,
                    adminName: admin.name,
                    adminRole: admin.role
                })
            });
            fetchBookings(); // Refresh after update
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const handlePaymentStatusChange = async (id, newPaymentStatus) => {
        try {
            await apiCall(`/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    paymentStatus: newPaymentStatus,
                    adminId: admin.id,
                    adminName: admin.name,
                    adminRole: admin.role
                })
            });
            fetchBookings();
        } catch (err) {
            console.error('Error updating payment status:', err);
            alert('Failed to update payment status');
        }
    };

    const handleEditClick = (booking) => {
        setEditingBooking(booking);
        setSelectedPackageIds(booking.packageIds || []);
        setEditBookingDate(booking.bookingDate || '');
        setEditTotalAmount(booking.totalAmount || 0);
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        try {
            const selectedPkgs = packages.filter(p => selectedPackageIds.includes(p.id));
            const combinedPackageTitles = selectedPkgs.map(p => p.title).join(' + ');

                await apiCall(`/bookings/${editingBooking.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        packageIds: selectedPackageIds,
                        packageTitle: combinedPackageTitles || 'Custom Package',
                        bookingDate: editBookingDate,
                        totalAmount: editTotalAmount,
                        adminId: admin.id,
                        adminName: admin.name,
                        adminRole: admin.role
                    })
                });

            setIsEditing(false);
            setEditingBooking(null);
            fetchBookings();
        } catch (err) {
            console.error('Error updating booking:', err);
            alert('Failed to update booking');
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Confirmed': return 'badge-success';
            case 'Rejected': return 'badge-danger';
            default: return 'badge-warning';
        }
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>Booking Management</h2>
                <p>Review and manage customer booking requests.</p>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer Name</th>
                            <th>Mobile</th>
                            <th>Created At</th>
                            <th>Booking Date</th>
                            <th>Package Selected</th>
                            <th>Hotel/Location</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Pending</th>
                            <th>Balance</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td className="fw-bold text-light" style={{ fontSize: '0.8rem' }}>{booking.id}</td>
                                <td>{booking.customerName}</td>
                                <td>{booking.mobile}</td>
                                <td className="text-muted" style={{ fontSize: '0.8rem' }}>{formatDate(booking.createdAt)}</td>
                                <td className="text-info fw-bold" style={{ fontSize: '0.9rem' }}>
                                    {booking.bookingDate || 'Not Set'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {booking.packageTitle ? booking.packageTitle.split(' + ').map((pkg, idx) => (
                                            <span key={idx} className="package-tag">{pkg}</span>
                                        )) : <span className="package-tag">Unknown Package</span>}
                                    </div>
                                </td>
                                <td>{booking.hotelName}</td>
                                <td className="fw-bold" style={{ color: '#feb47b' }}>
                                    LKR {booking.totalAmount?.toLocaleString() || '0.00'}
                                </td>
                                <td className="fw-bold" style={{ color: '#ff7eb3' }}>
                                    LKR {booking.paidAmount?.toLocaleString() || '0.00'}
                                </td>
                                <td className="fw-bold" style={{ color: '#909399' }}>
                                    LKR {booking.pendingPaidAmount?.toLocaleString() || '0.00'}
                                </td>
                                <td className="fw-bold" style={{ color: '#48dbfb' }}>
                                    LKR {((booking.totalAmount || 0) - (booking.paidAmount || 0)).toLocaleString()}
                                </td>
                                <td>
                                    <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <span className={`status-badge ${booking.paymentStatus === 'Success' ? 'badge-success' : booking.paymentStatus === 'Pending Verification' ? 'badge-warning' : 'badge-danger'}`}>
                                            {booking.paymentStatus || 'Unpaid'}
                                        </span>
                                        {booking.paymentReceiptUrl && (
                                            <a href={booking.paymentReceiptUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#48dbfb', textDecoration: 'underline' }}>
                                                View Receipt
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="action-btn text-btn"
                                        onClick={() => handleEditClick(booking)}
                                        title="Edit Booking"
                                    >
                                        ✏️ Edit
                                    </button>
                                    
                                    {booking.status === 'Pending' && (
                                        <>
                                            <button
                                                className="action-btn accept-btn"
                                                onClick={() => handleStatusChange(booking.id, 'Confirmed')}
                                                title="Confirm Booking"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                className="action-btn reject-btn"
                                                onClick={() => handleStatusChange(booking.id, 'Rejected')}
                                                title="Reject Booking"
                                            >
                                                ✕
                                            </button>
                                        </>
                                    )}
                                    {booking.paymentStatus === 'Pending Verification' && (
                                        <button
                                            className="action-btn accept-btn"
                                            onClick={() => handlePaymentStatusChange(booking.id, 'Success')}
                                            title={`Verify Payment (LKR ${booking.pendingPaidAmount})`}
                                            style={{ marginLeft: '5px', position: 'relative' }}
                                        >
                                            💰
                                            {booking.pendingPaidAmount > 0 && <span className="pending-indicator"></span>}
                                        </button>
                                    )}
                                    {booking.status !== 'Pending' && (
                                        <button
                                            className="action-btn text-btn"
                                            onClick={() => handleStatusChange(booking.id, 'Pending')}
                                        >
                                            Revert
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {bookings.length === 0 && (
                            <tr>
                                <td colSpan="9" className="empty-state">No bookings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Booking Modal */}
            {isEditing && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit Booking: {editingBooking?.customerName}</h3>
                        <div className="admin-form">
                            <div className="input-group">
                                <label>Booking Date</label>
                                <input
                                    type="date"
                                    value={editBookingDate}
                                    onChange={(e) => setEditBookingDate(e.target.value)}
                                    className="modal-input"
                                />
                            </div>

                            <div className="input-group">
                                <label>Extra Services (Packages)</label>
                                <div className="packages-checkbox-list">
                                    {packages.map(pkg => (
                                        <label key={pkg.id} className="package-cb-label">
                                            <input
                                                type="checkbox"
                                                checked={selectedPackageIds.includes(pkg.id)}
                                                onChange={(e) => {
                                                    let newIds = [];
                                                    if (e.target.checked) {
                                                        newIds = [...selectedPackageIds, pkg.id];
                                                    } else {
                                                        newIds = selectedPackageIds.filter(id => id !== pkg.id);
                                                    }
                                                    setSelectedPackageIds(newIds);

                                                    // Auto calculate new price
                                                    const selectedPkgs = packages.filter(p => newIds.includes(p.id));
                                                    const newTotal = selectedPkgs.reduce((sum, p) => {
                                                        const priceStr = p.price || "0";
                                                        const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
                                                        return sum + numericPrice;
                                                    }, 0);
                                                    setEditTotalAmount(newTotal);
                                                }}
                                            />
                                            {pkg.title} ({pkg.category || 'General'})
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="input-group">
                                <label>Estimated Total Price</label>
                                <div className="total-price-display" style={{ 
                                    padding: '10px', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    borderRadius: '8px',
                                    color: '#feb47b',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold'
                                }}>
                                    LKR {editTotalAmount?.toLocaleString() || '0.00'}
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="btn-primary" onClick={handleSaveEdit}>Save Changes</button>
                                <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
