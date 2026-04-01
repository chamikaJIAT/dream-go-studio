import { useState, useEffect, useContext } from 'react';
import { apiCall } from '../../api';
import { AuthContext } from '../../context/AuthContext';
import './ClientBookings.css';

export default function ClientBookings() {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [uploadingId, setUploadingId] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [amountsPaid, setAmountsPaid] = useState({});
    const [uploadProgress, setUploadProgress] = useState({});

    const fetchBookings = async () => {
        if (!user) return;
        try {
            const res = await apiCall(`/bookings/user/${user.id}`);
            setBookings(res.bookings);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user]);

    const handleFileChange = (bookingId, file) => {
        setSelectedFiles(prev => ({
            ...prev,
            [bookingId]: file
        }));
    };

    const handleUploadReceipt = async (bookingId) => {
        const file = selectedFiles[bookingId];
        if (!file) return;

        setUploadingId(bookingId);
        setUploadProgress(prev => ({ ...prev, [bookingId]: 10 })); // Start progress

        try {
            const formData = new FormData();
            formData.append('receipt', file);
            formData.append('amountPaid', amountsPaid[bookingId] || 0);

            // Simulation of progress since fetch doesn't support it directly without XHR
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    const current = prev[bookingId] || 10;
                    if (current >= 90) {
                        clearInterval(interval);
                        return prev;
                    }
                    return { ...prev, [bookingId]: current + 10 };
                });
            }, 300);

            await apiCall(`/bookings/${bookingId}/upload-receipt`, {
                method: 'POST',
                body: formData
            });

            clearInterval(interval);
            setUploadProgress(prev => ({ ...prev, [bookingId]: 100 }));
            
            setSelectedFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles[bookingId];
                return newFiles;
            });

            alert('Payment receipt uploaded successfully. Waiting for admin verification.');
            fetchBookings();
        } catch (err) {
            console.error("Error uploading receipt:", err);
            alert("Failed to upload receipt. Please try again.");
        } finally {
            setUploadingId(null);
            setTimeout(() => {
                setUploadProgress(prev => {
                    const newProg = { ...prev };
                    delete newProg[bookingId];
                    return newProg;
                });
            }, 1000);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusText = (status) => status || 'Pending';
    const getPaymentStatusText = (status) => status || 'Unpaid';

    if (!user) {
        return (
            <div className="client-bookings-container">
                <div className="empty-state">
                    <h3>Please log in to view your bookings</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="client-bookings-container">
            <div className="bookings-header">
                <h2>My Bookings</h2>
                <p>Track your events and manage your payments</p>
            </div>

            <div className="bookings-list">
                {bookings.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven't made any bookings yet.</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking.id} className="booking-card">
                            <div className="booking-card-header">
                                <span className="booking-id">ID: {booking.id}</span>
                                <span className={`status-badge ${getStatusText(booking.status).toLowerCase()}`}>
                                    {getStatusText(booking.status)}
                                </span>
                            </div>

                            <div className="booking-card-body">
                                <div className="booking-detail-row">
                                    <span className="detail-label">Event Type</span>
                                    <span className="detail-value">{booking.category || 'General'}</span>
                                </div>
                                <div className="booking-detail-row">
                                    <span className="detail-label">Package(s)</span>
                                    <span className="detail-value" style={{ textAlign: 'right', maxWidth: '60%' }}>
                                        {booking.packageTitle || 'Custom Package'}
                                    </span>
                                </div>
                                <div className="booking-detail-row">
                                    <span className="detail-label">Booking Date</span>
                                    <span className="detail-value">{booking.bookingDate || 'Not Set'}</span>
                                </div>
                                <div className="booking-detail-row">
                                    <span className="detail-label">Location</span>
                                    <span className="detail-value" style={{ textAlign: 'right', maxWidth: '60%' }}>
                                        {booking.hotelName}
                                    </span>
                                </div>
                                <div className="booking-detail-row">
                                    <span className="detail-label">Total Amount</span>
                                    <span className="detail-value" style={{ color: '#feb47b', fontWeight: 'bold' }}>
                                        LKR {booking.totalAmount?.toLocaleString() || '0.00'}
                                    </span>
                                </div>
                                <div className="booking-detail-row">
                                    <span className="detail-label pink-text">Verified Paid</span>
                                    <span className="detail-value pink-text">
                                        LKR {booking.paidAmount?.toLocaleString() || '0.00'}
                                    </span>
                                </div>
                                {booking.pendingPaidAmount > 0 && (
                                    <div className="booking-detail-row">
                                        <span className="detail-label" style={{ color: '#909399' }}>Pending Approval</span>
                                        <span className="detail-value" style={{ color: '#909399' }}>
                                            LKR {booking.pendingPaidAmount?.toLocaleString() || '0.00'}
                                        </span>
                                    </div>
                                )}
                                <div className="booking-detail-row">
                                    <span className="detail-label gold-text">Remaining Balance</span>
                                    <span className="detail-value gold-text" style={{ fontWeight: 'bold' }}>
                                        LKR {((booking.totalAmount || 0) - (booking.paidAmount || 0)).toLocaleString()}
                                    </span>
                                </div>
                                <div className="booking-detail-row">
                                    <span className="detail-label">Booking Date</span>
                                    <span className="detail-value">{booking.bookingDate || 'Not specified'}</span>
                                </div>
                                <div className="booking-detail-row">
                                    <span className="detail-label">Status</span>
                                    <span className={`status-text ${booking.status.toLowerCase()}`}>{booking.status}</span>
                                </div>
                            </div>

                            {/* Payment Section - Only show logic if Confirmed */}
                            {booking.status === 'Confirmed' && (
                                <div className="payment-section">
                                    <div className="payment-status-row">
                                        <span className="detail-label">Payment Status</span>
                                        <span className={`payment-badge ${getPaymentStatusText(booking.paymentStatus).toLowerCase().replace(' ', '-')}`}>
                                            {getPaymentStatusText(booking.paymentStatus)}
                                        </span>
                                    </div>

                                    {/* Upload form if unpaid or failed */}
                                    {(!booking.paymentStatus || booking.paymentStatus === 'Unpaid' || booking.paymentStatus === 'Failed') && (
                                        <div className="upload-receipt-wrapper">
                                            <div className="upload-receipt-form">
                                                 <input 
                                                    type="file" 
                                                    accept="image/*,application/pdf" 
                                                    className="file-input"
                                                    onChange={(e) => handleFileChange(booking.id, e.target.files[0])}
                                                />
                                                <input 
                                                    type="number"
                                                    placeholder="Amount Paid (e.g. 5000)"
                                                    className="amount-input"
                                                    value={amountsPaid[booking.id] || ''}
                                                    onChange={(e) => setAmountsPaid(prev => ({ ...prev, [booking.id]: e.target.value }))}
                                                    style={{ 
                                                        background: 'rgba(255,255,255,0.1)', 
                                                        border: '1px solid #48dbfb', 
                                                        color: 'white', 
                                                        padding: '8px', 
                                                        borderRadius: '5px',
                                                        marginTop: '10px',
                                                        width: '100%'
                                                    }}
                                                />
                                                <button 
                                                    className="upload-btn"
                                                    onClick={() => handleUploadReceipt(booking.id)}
                                                    disabled={uploadingId === booking.id || !selectedFiles[booking.id] || !amountsPaid[booking.id]}
                                                    style={{ marginTop: '10px' }}
                                                >
                                                    {uploadingId === booking.id ? 'Uploading...' : 'Submit Payment'}
                                                </button>
                                            </div>
                                            {uploadingId === booking.id && uploadProgress[booking.id] !== undefined && (
                                                <div className="progress-bar-container">
                                                    <div 
                                                        className="progress-bar-fill"
                                                        style={{ width: `${uploadProgress[booking.id]}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Show receipt link if uploaded */}
                                    {booking.paymentReceiptUrl && (
                                        <a 
                                            href={booking.paymentReceiptUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="view-receipt-link"
                                        >
                                            📄 View Uploaded Receipt
                                        </a>
                                    )}
                                </div>
                            )}

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
