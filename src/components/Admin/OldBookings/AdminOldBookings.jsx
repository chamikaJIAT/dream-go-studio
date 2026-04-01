import { useState, useEffect } from 'react';
import { apiCall } from '../../../api';
import './AdminOldBookings.css';

export default function AdminOldBookings() {
    const [bookings, setBookings] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBooking, setCurrentBooking] = useState({
        id: '',
        customerName: '',
        mobile: '',
        date: '',
        bookingDetails: '',
        totalAmount: '',
        paidAmount: '',
        status: 'Pending',
        paymentHistory: []
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const [showHistoryFor, setShowHistoryFor] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: ''
    });

    const fetchOldBookings = async () => {
        try {
            const res = await apiCall('/old_bookings');
            setBookings(res.old_bookings);
        } catch (err) {
            console.error('Failed to fetch old bookings', err);
        }
    };

    useEffect(() => {
        fetchOldBookings();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentBooking({ ...currentBooking, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const bookingDataToSave = {
            customerName: currentBooking.customerName,
            mobile: currentBooking.mobile,
            date: currentBooking.date,
            bookingDetails: currentBooking.bookingDetails,
            totalAmount: Number(currentBooking.totalAmount),
            paidAmount: Number(currentBooking.paidAmount),
            status: currentBooking.status,
            paymentHistory: currentBooking.paymentHistory || [],
            createdAt: currentBooking.createdAt || new Date().toISOString()
        };

        try {
            if (isEditing) {
                await apiCall(`/old_bookings/${currentBooking.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(bookingDataToSave)
                });
            } else {
                await apiCall('/old_bookings', {
                    method: 'POST',
                    body: JSON.stringify({
                        ...bookingDataToSave,
                        createdAt: new Date().toISOString()
                    })
                });
            }
            resetForm();
            fetchOldBookings();
        } catch (err) {
            console.error('Error saving booking:', err);
            alert('Failed to save booking.');
        }
    };

    const handleEdit = (booking) => {
        setCurrentBooking(booking);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await apiCall(`/old_bookings/${id}`, { method: 'DELETE' });
                fetchOldBookings();
            } catch (err) {
                console.error('Error deleting booking:', err);
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await apiCall(`/old_bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            fetchOldBookings();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const resetForm = () => {
        setCurrentBooking({
            id: '',
            customerName: '',
            mobile: '',
            date: '',
            bookingDetails: '',
            totalAmount: '',
            paidAmount: '',
            status: 'Pending',
            paymentHistory: []
        });
        setIsEditing(false);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            const newPayment = {
                amount: Number(paymentData.amount),
                date: paymentData.date,
                description: paymentData.description,
                createdAt: new Date().toISOString()
            };

            const updates = {
                paidAmount: (Number(currentBooking.paidAmount) || 0) + newPayment.amount,
                paymentHistory: [...(currentBooking.paymentHistory || []), newPayment]
            };

            if (paymentData.status) {
                updates.status = paymentData.status;
            }

            await apiCall(`/old_bookings/${currentBooking.id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            setIsPaying(false);
            setPaymentData({
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                status: ''
            });
            alert('Payment added successfully!');
            fetchOldBookings();
        } catch (err) {
            console.error('Error adding payment:', err);
            alert('Failed to add payment.');
        }
    };

    const openPaymentModal = (booking) => {
        setCurrentBooking(booking);
        setPaymentData({
            ...paymentData,
            status: booking.status
        });
        setIsPaying(true);
    };

    const filteredBookings = bookings.filter(b => 
        b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.mobile?.includes(searchTerm)
    );

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Completed': return 'badge-success';
            case 'Cancelled': return 'badge-danger';
            default: return 'badge-warning';
        }
    };

    const formatDate = (dateStringish) => {
        if (!dateStringish) return 'N/A';
        try {
            const date = new Date(dateStringish);
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>Old Booking Management</h2>
                <p>Manage historical booking records and payments.</p>
            </div>

            <div className="bookings-content">
                {/* Booking Form */}
                <div className="booking-editor">
                    <h3>{isEditing ? 'Edit Booking' : 'Add Old Booking'}</h3>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="input-row">
                            <div className="input-group">
                                <label>Customer Name</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={currentBooking.customerName}
                                    onChange={handleInputChange}
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Mobile Number</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={currentBooking.mobile}
                                    onChange={handleInputChange}
                                    placeholder="07XXXXXXXX"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Booking Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={currentBooking.date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Status</label>
                                <select 
                                    name="status" 
                                    value={currentBooking.status} 
                                    onChange={handleInputChange}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Booking Details / Service</label>
                            <textarea
                                name="bookingDetails"
                                value={currentBooking.bookingDetails}
                                onChange={handleInputChange}
                                rows="2"
                                placeholder="Describe the service provided..."
                                required
                            ></textarea>
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Total Amount (LKR)</label>
                                <input
                                    type="number"
                                    name="totalAmount"
                                    value={currentBooking.totalAmount}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Paid Amount (LKR)</label>
                                <input
                                    type="number"
                                    name="paidAmount"
                                    value={currentBooking.paidAmount}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        {currentBooking.totalAmount && currentBooking.paidAmount && (
                            <div className="balance-preview">
                                <span>Remaining Balance: </span>
                                <strong className={(currentBooking.totalAmount - currentBooking.paidAmount) > 0 ? 'text-warning' : 'text-success'}>
                                    LKR {(currentBooking.totalAmount - currentBooking.paidAmount).toLocaleString()}
                                </strong>
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {isEditing ? 'Update Record' : 'Add Record'}
                            </button>
                            {isEditing && (
                                <button type="button" className="btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Search Bar */}
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search by name or mobile number..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Event Date</th>
                                <th>Created</th>
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Total</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.date}</td>
                                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{formatDate(booking.createdAt)}</td>
                                    <td>
                                        <div className="cust-info">
                                            <strong>{booking.customerName}</strong>
                                            <span>{booking.mobile}</span>
                                        </div>
                                    </td>
                                    <td className="details-cell">
                                        {booking.bookingDetails}
                                        {booking.paymentHistory?.length > 0 && (
                                            <div style={{marginTop: '4px'}}>
                                                <button 
                                                    className="history-btn"
                                                    onClick={() => setShowHistoryFor(showHistoryFor === booking.id ? null : booking.id)}
                                                >
                                                    {showHistoryFor === booking.id ? 'Hide Payments' : `Show Payments (${booking.paymentHistory.length})`}
                                                </button>
                                                {showHistoryFor === booking.id && (
                                                    <div className="payment-history-list">
                                                        {booking.paymentHistory.map((p, idx) => (
                                                            <div key={idx} className="history-item">
                                                                <div className="history-header">
                                                                    <span className="history-date">{p.date}</span>
                                                                    <span className="history-amount">LKR {p.amount.toLocaleString()}</span>
                                                                </div>
                                                                <div className="history-desc">{p.description}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td>{Number(booking.totalAmount).toLocaleString()}</td>
                                    <td>{Number(booking.paidAmount).toLocaleString()}</td>
                                    <td className="fw-bold">
                                        <span className={(booking.totalAmount - booking.paidAmount) > 0 ? 'text-danger' : 'text-success'}>
                                            {(booking.totalAmount - booking.paidAmount).toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                                            <span className="badge-icon">{getStatusIcon(booking.status)}</span>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="action-btn pay" onClick={() => openPaymentModal(booking)} title="Add Payment">💰</button>
                                        <button className="action-btn edit" onClick={() => handleEdit(booking)} title="Edit">✏️</button>
                                        <button className="action-btn delete" onClick={() => handleDelete(booking.id)} title="Delete">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="empty-state">No historical records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            {isPaying && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add Payment for {currentBooking.customerName}</h3>
                        <form onSubmit={handlePaymentSubmit} className="admin-form">
                            <div className="input-group">
                                <label>Amount (LKR)</label>
                                <input 
                                    type="number" 
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                                    placeholder="Enter amount paid today"
                                    required
                                />
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>Payment Date</label>
                                    <input 
                                        type="date" 
                                        value={paymentData.date}
                                        onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Update Status</label>
                                    <select 
                                        value={paymentData.status}
                                        onChange={(e) => setPaymentData({...paymentData, status: e.target.value})}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea 
                                    rows="2"
                                    value={paymentData.description}
                                    onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                                    placeholder="e.g., Paid via bank transfer, Cash payment, etc."
                                    required
                                ></textarea>
                            </div>

                            <div className="balance-preview" style={{borderLeftColor: '#10b981'}}>
                                <span>Remaining Balance After: </span>
                                <strong>
                                    LKR {(currentBooking.totalAmount - currentBooking.paidAmount - (Number(paymentData.amount) || 0)).toLocaleString()}
                                </strong>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Save Payment</button>
                                <button type="button" className="btn-secondary" onClick={() => setIsPaying(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
