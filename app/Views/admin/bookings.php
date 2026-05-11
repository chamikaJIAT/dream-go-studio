<?php 
$pageTitle = 'Booking Management';
$activePage = 'bookings';
include __DIR__ . '/layout_header.php'; 
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_bookings.css">
<style>
    .clickable-cell { cursor: pointer; position: relative; transition: background 0.2s; }
    .clickable-cell:hover { background: rgba(255, 255, 255, 0.05); }
    .clickable-cell:hover::after { content: '👁️ View Details'; position: absolute; right: 5px; top: 50%; transform: translateY(-50%); font-size: 0.7rem; color: #48dbfb; opacity: 0.8; }

    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: none; justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(5px); }
    .modal-content { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 2rem; max-width: 500px; width: 90%; color: white; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); position: relative; max-height: 85vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; }
    .modal-header h3 { margin: 0; color: #48dbfb; }
    .close-modal { cursor: pointer; font-size: 1.5rem; color: #94a3b8; }
    .detail-row { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
    .detail-label { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
    .detail-value { font-size: 1rem; color: #e2e8f0; font-weight: 500; }
    .location-btn { display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem; background: #3b82f6; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center; width: 100%; box-sizing: border-box; }
    /* DataTables Dark Theme Overrides */
    .dataTables_wrapper { margin-top: 1rem; color: #e2e8f0; }
    .dataTables_wrapper .dataTables_length, .dataTables_wrapper .dataTables_filter, .dataTables_wrapper .dataTables_info, .dataTables_wrapper .dataTables_processing, .dataTables_wrapper .dataTables_paginate { color: #e2e8f0; margin-bottom: 15px; margin-top: 10px; }
    .dataTables_wrapper .dataTables_filter input { background: #1e293b; border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px; padding: 4px 10px; margin-left: 8px; outline: none; }
    .dataTables_wrapper .dataTables_length select { background: #1e293b; border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px; padding: 4px; }
    .dataTables_wrapper .dataTables_paginate .paginate_button { color: #e2e8f0 !important; border: 1px solid transparent; border-radius: 4px; }
    .dataTables_wrapper .dataTables_paginate .paginate_button:hover { background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.2); color: white !important; }
    .dataTables_wrapper .dataTables_paginate .paginate_button.current { background: #3b82f6 !important; color: white !important; border: none; }
    table.dataTable.no-footer { border-bottom: 1px solid rgba(255,255,255,0.1); }
    table.dataTable thead th, table.dataTable thead td { border-bottom: 2px solid rgba(255,255,255,0.1); }
</style>

<!-- DataTables CSS -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.21/css/jquery.dataTables.min.css">

<div class="admin-page-container">
    <div class="page-header">
        <h2>Booking Management</h2>
        <p>Review and manage customer booking requests.</p>
    </div>

    <div class="table-container">
        <table class="admin-table display" id="bookingsTable" style="width:100%">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Mobile</th>
                    <th>Date</th>
                    <th>Package Selected</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($bookings as $booking):
                    // Parse event_details JSON for event-specific fields
                    $eventDetails = json_decode($booking['event_details'] ?? '{}', true) ?? [];
                    $category        = $eventDetails['category'] ?? '';
                    $coupleName      = $booking['couple_name'] ?? $eventDetails['coupleName'] ?? '';
                    $birthdayPerson  = $eventDetails['birthdayPersonName'] ?? '';
                    $hotelName       = $booking['hotel_name'] ?? $eventDetails['hotelName'] ?? 'Not Specified';
                    $latitude        = $booking['latitude'] ?? $eventDetails['latitude'] ?? null;
                    $longitude       = $booking['longitude'] ?? $eventDetails['longitude'] ?? null;
                    $paidAmount      = (float)($booking['paid_amount'] ?? 0);
                    $totalAmount     = (float)($booking['total_amount'] ?? 0);
                    $statusLabel     = $booking['status_label'] ?? 'Pending';
                    $paymentStatus   = $booking['payment_status'] ?? '';
                    $packageTitles   = $booking['package_titles'] ?? '';
                    $bookingDate     = $booking['booking_date'] ?? '';
                    $receiptUrl      = $booking['payment_receipt_url'] ?? '';

                    // Build details payload for the modal
                    $detailsPayload = [
                        'id'       => $booking['id'],
                        'customer' => $booking['customer_name'],
                        'mobile'   => $booking['mobile'],
                        'category' => $category,
                        'package'  => $packageTitles,
                        'date'     => $bookingDate,
                        'couple'   => $coupleName,
                        'birthday' => $birthdayPerson,
                        'hotel'    => $hotelName,
                        'lat'      => $latitude,
                        'lng'      => $longitude,
                    ];
                ?>
                    <tr>
                        <td class="fw-bold text-light" style="font-size: 0.8rem;"><?= $booking['id'] ?></td>
                        <td><?= htmlspecialchars($booking['customer_name']) ?></td>
                        <td><?= htmlspecialchars($booking['mobile']) ?></td>

                        <!-- Clickable Date Cell -->
                        <td class="text-info fw-bold clickable-cell"
                            style="font-size: 0.9rem;"
                            onclick="showBookingDetails(<?= htmlspecialchars(json_encode($detailsPayload)) ?>)">
                            <?= !empty($bookingDate) ? htmlspecialchars($bookingDate) : 'Not Set' ?>
                        </td>

                        <!-- Clickable Package Cell -->
                        <td class="clickable-cell"
                            onclick="showBookingDetails(<?= htmlspecialchars(json_encode($detailsPayload)) ?>)">
                            <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center;">
                                <?php 
                                $titles = $packageTitles ? explode(', ', $packageTitles) : [];
                                foreach ($titles as $t): ?>
                                    <span class="package-tag"><?= htmlspecialchars(trim($t)) ?></span>
                                <?php endforeach; ?>
                                
                                <!-- Add Package Action -->
                                <form action="<?= BASE_URL ?>/admin/bookings/add-package" method="POST" style="display: inline-flex; gap: 4px; margin-left: 5px;" onclick="event.stopPropagation()">
                                    <input type="hidden" name="booking_id" value="<?= $booking['id'] ?>">
                                    <select name="package_id" required style="background: rgba(15, 23, 42, 0.6); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; font-size: 0.7rem; padding: 2px;">
                                        <option value="">+ Add</option>
                                        <?php foreach ($allPackages as $p): ?>
                                            <option value="<?= $p['id'] ?>"><?= htmlspecialchars($p['title']) ?> (LKR <?= number_format($p['price'], 0) ?>)</option>
                                        <?php endforeach; ?>
                                    </select>
                                    <button type="submit" style="background: #3b82f6; color: white; border: none; border-radius: 4px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.8rem; font-weight: bold;">+</button>
                                </form>

                                <?php if (empty($titles)): ?>
                                    <span style="color:#94a3b8; font-style:italic;">No package</span>
                                <?php endif; ?>
                            </div>
                        </td>

                        <td class="fw-bold" style="color: #feb47b;">
                            LKR <?= number_format($totalAmount, 2) ?>
                        </td>
                        <td class="fw-bold" style="color: #ff7eb3;">
                            LKR <?= number_format($paidAmount, 2) ?>
                        </td>
                        <td class="fw-bold" style="color: #48dbfb;">
                            LKR <?= number_format($totalAmount - $paidAmount, 2) ?>
                        </td>

                        <!-- Booking Status -->
                        <td>
                            <?php 
                            $statusClass = match($statusLabel) {
                                'Confirmed', 'Completed' => 'badge-success',
                                'Rejected'               => 'badge-danger',
                                default                  => 'badge-warning',
                            };
                            ?>
                            <span class="status-badge <?= $statusClass ?>">
                                <?= htmlspecialchars($statusLabel) ?>
                            </span>
                        </td>

                        <!-- Payment Status -->
                        <td>
                            <?php 
                            $payClass = match(true) {
                                $paymentStatus === 'Paid'                 => 'badge-success',
                                $paymentStatus === 'Pending Verification' => 'badge-warning',
                                default                                   => 'badge-danger',
                            };
                            ?>
                            <span class="status-badge <?= $payClass ?>">
                                <?= htmlspecialchars($paymentStatus ?: 'Unpaid') ?>
                            </span>
                            <?php if (!empty($receiptUrl)): ?>
                                <br><a href="<?= BASE_URL . htmlspecialchars($receiptUrl) ?>" target="_blank"
                                   style="font-size: 0.8rem; color: #48dbfb; text-decoration: underline; margin-top: 6px; display: inline-block;">
                                   📄 View Slip (LKR <?= number_format($booking['receipt_amount'] ?? 0, 2) ?>)
                                </a>
                            <?php endif; ?>
                        </td>

                        <!-- Actions -->
                        <td class="actions-cell">
                            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                <!-- Booking Status Update -->
                                <form action="<?= BASE_URL ?>/admin/bookings/status" method="POST" style="display: inline;">
                                    <input type="hidden" name="id" value="<?= $booking['id'] ?>">
                                    <?php if ($statusLabel === 'Pending'): ?>
                                        <input type="hidden" name="status_id" value="">
                                        <button type="submit" name="status_id" value="2" class="action-btn accept-btn" title="Confirm">✓</button>
                                        <button type="submit" name="status_id" value="3" class="action-btn reject-btn" title="Reject">✕</button>
                                    <?php else: ?>
                                        <button type="submit" name="status_id" value="1" class="action-btn text-btn">Revert</button>
                                    <?php endif; ?>
                                </form>

                                <!-- Payment Verification -->
                                <?php if ($paymentStatus === 'Pending Verification'): ?>
                                    <form action="<?= BASE_URL ?>/admin/bookings/payment" method="POST" style="display: inline;">
                                        <input type="hidden" name="id" value="<?= $booking['id'] ?>">
                                        <button type="submit" name="status" value="Paid" class="action-btn accept-btn" title="Verify Payment">💰</button>
                                    </form>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
                <?php if (empty($bookings)): ?>
                    <tr>
                        <td colspan="11" class="empty-state">No bookings found.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- Booking Details Modal -->
<div id="bookingModal" class="modal-overlay" onclick="closeModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
            <h3>Booking Details</h3>
            <span class="close-modal" onclick="closeModal(null)">&times;</span>
        </div>
        <div id="modalBody">
            <!-- Details will be injected here -->
        </div>
    </div>
</div>

<script>
function showBookingDetails(data) {
    const modal = document.getElementById('bookingModal');
    const body = document.getElementById('modalBody');
    
    let html = `
        <div class="detail-row">
            <span class="detail-label">Booking ID</span>
            <span class="detail-value">#${data.id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Customer</span>
            <span class="detail-value">${data.customer}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Mobile</span>
            <span class="detail-value">${data.mobile}</span>
        </div>
    `;

    if (data.category) {
        html += `
        <div class="detail-row">
            <span class="detail-label">Event Category</span>
            <span class="detail-value">${data.category}</span>
        </div>`;
    }

    html += `
        <div class="detail-row">
            <span class="detail-label">Package(s)</span>
            <span class="detail-value">${data.package || 'Not specified'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Event Date</span>
            <span class="detail-value">${data.date || 'Not Set'}</span>
        </div>
    `;

    if (data.couple) {
        html += `
        <div class="detail-row">
            <span class="detail-label">Couple Name</span>
            <span class="detail-value">${data.couple}</span>
        </div>`;
    }

    if (data.birthday) {
        html += `
        <div class="detail-row">
            <span class="detail-label">Birthday Person</span>
            <span class="detail-value">${data.birthday}</span>
        </div>`;
    }

    html += `
        <div class="detail-row">
            <span class="detail-label">Hotel / Venue</span>
            <span class="detail-value">${data.hotel || 'Not Specified'}</span>
        </div>
    `;

    if (data.lat && data.lng) {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}`;
        html += `<a href="${mapsUrl}" target="_blank" class="location-btn">📍 View Location on Maps</a>`;
    } else {
        html += `
        <div class="detail-row">
            <span class="detail-label">Location</span>
            <span class="detail-value" style="color: #94a3b8; font-style: italic;">No GPS location provided</span>
        </div>`;
    }

    body.innerHTML = html;
    modal.style.display = 'flex';
}

function closeModal(e) {
    document.getElementById('bookingModal').style.display = 'none';
}
</script>

<!-- jQuery and DataTables JS -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.21/js/jquery.dataTables.min.js"></script>
<script>
    $(document).ready(function() {
        $('#bookingsTable').DataTable({
            "order": [[ 0, "desc" ]], // Order by ID descending by default
            "pageLength": 15,
            "columnDefs": [
                { "orderable": false, "targets": [4, 10] } // Disable sorting on 'Package Selected' and 'Actions' columns
            ],
            "language": {
                "search": "Search Bookings:",
                "lengthMenu": "Show _MENU_ entries"
            }
        });
    });
</script>

<?php include __DIR__ . '/layout_footer.php'; ?>
