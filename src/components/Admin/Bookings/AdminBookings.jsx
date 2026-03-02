import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firebase';
import './AdminBookings.css';

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const bData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBookings(bData);
        });
        return () => unsub();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, 'bookings', id), { status: newStatus });
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
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
                            <th>Package Selected</th>
                            <th>Hotel/Location</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td className="fw-bold text-light" style={{ fontSize: '0.8rem' }}>{booking.id}</td>
                                <td>{booking.customerName}</td>
                                <td>{booking.mobile}</td>
                                <td><span className="package-tag">{booking.packageTitle}</span></td>
                                <td>{booking.hotelName}</td>
                                <td>
                                    <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="actions-cell">
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
                                <td colSpan="7" className="empty-state">No bookings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
