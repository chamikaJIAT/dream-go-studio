<?php 
$pageTitle = 'Old Booking Management';
$activePage = 'old-bookings';
include __DIR__ . '/layout_header.php'; 
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_old_bookings.css">
<!-- Flatpickr CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/themes/dark.min.css">


<div class="admin-page-container">
    <div class="page-header">
        <h2>Old Booking Management</h2>
        <p>Manage historical booking records and payments in a clean, organized dashboard.</p>
    </div>

    <div class="bookings-content">
        <!-- Booking Form -->
        <div class="booking-editor">
            <h3><?= $editBooking ? 'Edit Booking Record' : 'Add New Booking Record' ?></h3>
            <form action="<?= BASE_URL ?>/admin/old-bookings/save" method="POST" class="admin-form">
                <?php if ($editBooking): ?>
                    <input type="hidden" name="id" value="<?= $editBooking['id'] ?>">
                <?php endif; ?>
                
                <div class="input-row">
                    <div class="input-group">
                        <label>Customer Name</label>
                        <input type="text" name="customerName" value="<?= $editBooking ? htmlspecialchars($editBooking['customer_name']) : '' ?>" placeholder="e.g. John Doe" required />
                    </div>
                    <div class="input-group">
                        <label>Mobile Number</label>
                        <input type="text" name="mobile" value="<?= $editBooking ? htmlspecialchars($editBooking['mobile']) : '' ?>" placeholder="e.g. 0771234567" required />
                    </div>
                </div>

                <div class="input-row">
                    <div class="input-group">
                        <label>Booking Date</label>
                        <input type="text" name="date" id="bookingDate" class="datepicker" value="<?= $editBooking ? htmlspecialchars($editBooking['booking_date']) : '' ?>" placeholder="Select Date.." required />

                    </div>
                    <div class="input-group">
                        <label>Current Status</label>
                        <select name="status">
                            <option value="Pending" <?= ($editBooking && $editBooking['status'] === 'Pending') ? 'selected' : '' ?>>Pending</option>
                            <option value="Completed" <?= ($editBooking && $editBooking['status'] === 'Completed') ? 'selected' : '' ?>>Completed</option>
                            <option value="Cancelled" <?= ($editBooking && $editBooking['status'] === 'Cancelled') ? 'selected' : '' ?>>Cancelled</option>
                        </select>
                    </div>
                </div>

                <div class="input-group">
                    <label>Service Description</label>
                    <textarea name="bookingDetails" rows="3" placeholder="Describe the service provided (e.g. Wedding Photography, Studio Session)..." required><?= $editBooking ? htmlspecialchars($editBooking['booking_details']) : '' ?></textarea>
                </div>

                <div class="input-row">
                    <div class="input-group">
                        <label>Total Amount (LKR)</label>
                        <input type="number" step="0.01" name="totalAmount" value="<?= $editBooking ? htmlspecialchars($editBooking['total_amount']) : '' ?>" placeholder="0.00" required />
                    </div>
                    <div class="input-group">
                        <label>Initial Paid Amount (LKR)</label>
                        <input type="number" step="0.01" name="paidAmount" value="<?= $editBooking ? htmlspecialchars($editBooking['paid_amount']) : '' ?>" placeholder="0.00" required />
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary"><?= $editBooking ? 'Update Record' : 'Add Record' ?></button>
                    <?php if ($editBooking): ?>
                        <a href="<?= BASE_URL ?>/admin/old-bookings" class="btn-secondary" style="text-decoration: none; display: inline-block; text-align: center;">Cancel</a>
                    <?php endif; ?>
                </div>
            </form>
        </div>

        <!-- Search Bar Section -->
        <div class="search-section">
            <form action="<?= BASE_URL ?>/admin/old-bookings" method="GET" class="search-input-wrapper">
                <span class="search-icon">🔍</span>
                <input 
                    type="text" 
                    name="q"
                    placeholder="Search by name or mobile number..." 
                    value="<?= htmlspecialchars($_GET['q'] ?? '') ?>"
                />
            </form>
        </div>

        <!-- Bookings Table -->
        <div class="table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Event Date</th>
                        <th>Customer</th>
                        <th>Service Details</th>
                        <th>Financials (LKR)</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($bookings as $booking): ?>
                        <tr>
                            <td style="white-space: nowrap;">
                                <div class="cust-info">
                                    <strong><?= date('M j, Y', strtotime($booking['booking_date'])) ?></strong>
                                    <span style="font-size: 0.7rem; color: #64748b;">Created: <?= date('M j, y', strtotime($booking['created_at'])) ?></span>
                                </div>
                            </td>
                            <td>
                                <div class="cust-info">
                                    <strong><?= htmlspecialchars($booking['customer_name']) ?></strong>
                                    <span><?= htmlspecialchars($booking['mobile']) ?></span>
                                </div>
                            </td>
                            <td class="details-cell">
                                <div style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: normal;">
                                    <?= htmlspecialchars($booking['booking_details']) ?>
                                </div>
                                <?php if (!empty($booking['booking_details'])): ?>
                                    <div style="margin-top: 8px; font-size: 0.8rem; color: #94a3b8;">
                                        <i>Offline Booking Notes</i>
                                    </div>
                                <?php endif; ?>
                            </td>
                            <td>
                                <div class="cust-info">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                                        <span style="color: #94a3b8;">Total:</span>
                                        <span style="color: #fff; font-weight: 600;"><?= number_format($booking['total_amount'], 2) ?></span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                                        <span style="color: #94a3b8;">Paid:</span>
                                        <span style="color: #10b981; font-weight: 600;"><?= number_format($booking['paid_amount'], 2) ?></span>
                                    </div>
                                    <?php $balance = $booking['total_amount'] - $booking['paid_amount']; ?>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px;">
                                        <span style="color: #94a3b8;">Due:</span>
                                        <span class="<?= $balance > 0 ? 'text-danger' : 'text-success' ?>" style="font-weight: 700;">
                                            <?= number_format($balance, 2) ?>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <?php 
                                $statusClass = '';
                                if ($booking['status'] === 'Completed') $statusClass = 'badge-success';
                                elseif ($booking['status'] === 'Cancelled') $statusClass = 'badge-danger';
                                else $statusClass = 'badge-warning';
                                ?>
                                <span class="status-badge <?= $statusClass ?>">
                                    <?= $booking['status'] ?>
                                </span>
                            </td>
                            <td class="actions-cell">
                                <button class="action-btn pay" onclick="openPaymentModal(<?= htmlspecialchars(json_encode($booking)) ?>)" title="Add Payment">💰</button>
                                <a href="<?= BASE_URL ?>/admin/old-bookings?edit=<?= $booking['id'] ?>" class="action-btn edit" title="Edit" style="text-decoration: none;">✏️</a>
                                <form action="<?= BASE_URL ?>/admin/old-bookings/delete" method="POST" style="display: inline;" data-confirm-message="Are you sure you want to delete this historical record?">
                                    <input type="hidden" name="id" value="<?= $booking['id'] ?>">
                                    <button type="submit" class="action-btn delete" title="Delete">🗑️</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if (empty($bookings)): ?>
                        <tr>
                            <td colSpan="6" style="padding: 4rem; text-align: center; color: #64748b;">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">📂</div>
                                <p>No historical records found for your search.</p>
                            </td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Payment Modal -->
    <div id="paymentModal" class="modal-overlay" style="display: none;">
        <div class="modal-content">
            <h3>Add New Payment</h3>
            <p style="color: #94a3b8; margin-top: -1.5rem; margin-bottom: 2rem;">Customer: <strong id="modalCustomerName" style="color: #38bdf8;"></strong></p>
            
            <form action="<?= BASE_URL ?>/admin/old-bookings/payment" method="POST" class="admin-form">
                <input type="hidden" name="id" id="modalBookingId">
                <div class="input-group">
                    <label>Amount to Pay (LKR)</label>
                    <input type="number" step="0.01" name="amount" placeholder="0.00" required autofocus />
                </div>
                <div class="input-row">
                    <div class="input-group">
                        <label>Update Booking Status</label>
                        <select name="status" id="modalStatus">
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions" style="margin-top: 1rem;">
                    <button type="submit" class="btn-primary" style="width: 100%;">Confirm Payment</button>
                    <button type="button" class="btn-secondary" style="width: 100%;" onclick="closePaymentModal()">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Flatpickr JS -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    flatpickr(".datepicker", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "F j, Y",
        theme: "dark",
        allowInput: true
    });
});


function openPaymentModal(booking) {
    document.getElementById('modalBookingId').value = booking.id;
    document.getElementById('modalCustomerName').innerText = booking.customer_name;
    document.getElementById('modalStatus').value = booking.status;
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Close modal on escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePaymentModal();
});
</script>

<?php include __DIR__ . '/layout_footer.php'; ?>
