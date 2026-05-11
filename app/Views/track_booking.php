<?php $pageTitle = 'My Bookings - Dream Go Studio'; ?>
<?php $activePage = 'my-bookings'; ?>
<?php include __DIR__ . '/layout/header.php'; ?>

<div class="public-layout">
    <div style="padding: 4rem 2rem; max-width: 800px; margin: 0 auto;">
        
        <?php if (!isset($_SESSION['user'])): ?>
            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Track Your <span style="color: #8ec5fc;">Booking</span></h1>
                <p style="color: #94a3b8;">Enter the mobile number you used during booking to check your status.</p>
            </div>

            <div style="background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); margin-bottom: 3rem;">
                <form method="GET" action="<?= BASE_URL ?>/my-bookings" style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 250px;">
                        <label style="display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.9rem;">Mobile Number</label>
                        <input type="tel" name="mobile" value="<?= htmlspecialchars($_GET['mobile'] ?? '') ?>" placeholder="e.g. 0712345678" required style="width: 100%; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.2); padding: 1rem; color: white; border-radius: 12px; font-size: 1rem;">
                    </div>
                    <div style="display: flex; align-items: flex-end;">
                        <button type="submit" style="padding: 1rem 2rem; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 1rem; transition: transform 0.2s;">Check Status</button>
                    </div>
                </form>
            </div>
        <?php else: ?>
            <div style="text-align: center; margin-bottom: 3rem;">
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">My <span style="color: #8ec5fc;">Bookings</span></h1>
                <p style="color: #94a3b8;">Review your scheduled events and keep track of their approval status.</p>
            </div>
        <?php endif; ?>

        <?php if ($searched && empty($bookings)): ?>
            <div style="text-align: center; padding: 3rem; background: rgba(255, 255, 255, 0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                <h3 style="color: white; margin-bottom: 0.5rem;">No Bookings Found</h3>
                <p style="color: #94a3b8;">We couldn't find any bookings associated with this mobile number.</p>
            </div>
        <?php elseif ($searched && !empty($bookings)): ?>
            <div>
                <h3 style="color: white; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Your Bookings (<?= count($bookings) ?>)</h3>
                
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <?php foreach ($bookings as $booking): ?>
                        <?php 
                            $details = json_decode($booking['event_details'], true);
                            $category = $details['category'] ?? 'General';
                        ?>
                        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                            
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                                <div>
                                    <h4 style="color: white; font-size: 1.2rem; margin: 0 0 0.2rem 0;"><?= htmlspecialchars($category) ?> Event</h4>
                                    <p style="color: #94a3b8; font-size: 0.9rem; margin: 0;">Date Booked: <?= date('M d, Y', strtotime($booking['created_at'])) ?></p>
                                </div>
                                
                                <?php 
                                    $statusColor = '#94a3b8'; 
                                    $statusBg = 'rgba(148, 163, 184, 0.1)';
                                    
                                    if ($booking['status_label'] === 'Approved') {
                                        $statusColor = '#34d399';
                                        $statusBg = 'rgba(52, 211, 153, 0.1)';
                                    } elseif ($booking['status_label'] === 'Rejected') {
                                        $statusColor = '#f87171';
                                        $statusBg = 'rgba(248, 113, 113, 0.1)';
                                    } elseif ($booking['status_label'] === 'Completed') {
                                        $statusColor = '#818cf8';
                                        $statusBg = 'rgba(129, 140, 248, 0.1)';
                                    }
                                ?>
                                <div style="display: inline-block; padding: 0.4rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.9rem; color: <?= $statusColor ?>; background: <?= $statusBg ?>;">
                                    <?= htmlspecialchars($booking['status_label']) ?>
                                </div>
                            </div>
                            
                            <div style="height: 1px; background: rgba(255,255,255,0.05);"></div>
                            
                            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
                                <div style="flex: 1; min-width: 250px;">
                                    <span style="display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 0.3rem;">PACKAGE SELECTION</span>
                                    <span style="color: #e2e8f0; font-size: 0.95rem; line-height: 1.4;"><?= htmlspecialchars($booking['package_titles'] ?: 'Custom') ?></span>
                                </div>
                                <div style="flex: 2; min-width: 300px; display: flex; justify-content: flex-end; gap: 2rem; flex-wrap: wrap; text-align: right; background: rgba(0, 0, 0, 0.15); padding: 1rem 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03);">
                                    <div>
                                        <span style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.3rem;">TOTAL COST</span>
                                        <span style="color: #cbd5e1; font-weight: 600; font-size: 1.1rem;">LKR <?= number_format($booking['total_amount'], 2) ?></span>
                                    </div>
                                    <div>
                                        <span style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.3rem;">TOTAL PAID</span>
                                        <span style="color: #34d399; font-weight: 600; font-size: 1.1rem;">LKR <?= number_format($booking['paid_amount'], 2) ?></span>
                                    </div>
                                    <div style="padding-left: 1.5rem; border-left: 1px solid rgba(255,255,255,0.1);">
                                        <span style="display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.3rem;">BALANCE DUE</span>
                                        <span style="color: #f87171; font-weight: 700; font-size: 1.25rem;">LKR <?= number_format($booking['total_amount'] - $booking['paid_amount'], 2) ?></span>
                                    </div>
                                </div>
                            </div>
                            
                            <?php if ($booking['status_label'] === 'Approved'): ?>
                                <div style="margin-top: 0.5rem; padding-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.1); color: #34d399; font-size: 0.9rem; text-align: center;">
                                    🎉 Your booking has been approved! We will contact you shortly to finalize details.
                                </div>
                            <?php elseif ($booking['status_label'] === 'Pending'): ?>
                                <div style="margin-top: 0.5rem; padding-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.9rem; text-align: center;">
                                    ⏳ Your booking is currently under review by our team. Please hold on!
                                </div>
                            <?php endif; ?>
                            
                            <?php if (isset($_SESSION['user'])): ?>
                                <div style="background: rgba(0, 0, 0, 0.2); padding: 1rem; border-radius: 12px; margin-top: 0.5rem;">
                                    <?php if (empty($booking['payment_receipt_url'])): ?>
                                        <form action="<?= BASE_URL ?>/my-bookings/upload-receipt" method="POST" enctype="multipart/form-data" style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                                            <input type="hidden" name="booking_id" value="<?= $booking['id'] ?>">
                                            <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; width: 100%;">
                                                <div style="flex: 2;">
                                                    <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.4rem; font-weight: 600;">UPLOAD RECEIPT (JPG, PNG, PDF)</label>
                                                    <input type="file" name="receipt" accept="image/jpeg,image/png,application/pdf" required style="width: 100%; font-size: 0.95rem; color: white; background: rgba(15, 23, 42, 0.5); border: 1px dashed rgba(148, 163, 184, 0.3); padding: 0.65rem; border-radius: 8px;">
                                                </div>
                                                <div style="flex: 1; min-width: 120px;">
                                                    <label style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.4rem; font-weight: 600;">AMOUNT (LKR)</label>
                                                    <input type="number" name="amount" step="0.01" placeholder="0.00" required style="width: 100%; font-size: 0.95rem; color: white; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); padding: 0.65rem; border-radius: 8px;">
                                                </div>
                                                <button type="submit" style="padding: 0.8rem 1.5rem; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; white-space: nowrap; height: 100%;">Send Receipt</button>
                                            </div>
                                        </form>
                                    <?php else: ?>
                                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                                            <div>
                                                <span style="display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.2rem;">PAYMENT SLIP</span>
                                                <span style="color: #38bdf8; font-weight: 600;">🛡️ <?= htmlspecialchars($booking['payment_status'] ?: 'Submitted') ?></span>
                                            </div>
                                            <a href="<?= BASE_URL . htmlspecialchars($booking['payment_receipt_url']) ?>" target="_blank" style="color: white; text-decoration: none; font-size: 0.9rem; border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 8px; background: rgba(255,255,255,0.05);">View Receipt</a>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>

                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Messages & Replies Section -->
            <div style="margin-top: 4rem;">
                <h3 style="color: white; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Messages & Admin Replies</h3>
                
                <?php if (empty($messages)): ?>
                    <div style="text-align: center; padding: 2rem; background: rgba(255, 255, 255, 0.02); border-radius: 16px; color: #64748b; font-size: 0.9rem;">
                        No messages sent yet.
                    </div>
                <?php else: ?>
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <?php foreach ($messages as $msg): ?>
                            <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; overflow: hidden;">
                                <!-- User's Original Message -->
                                <div style="padding: 1.5rem;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                                        <span style="color: #38bdf8; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Your Message</span>
                                        <span style="color: #475569; font-size: 0.8rem;"><?= date('M d, Y h:i A', strtotime($msg['created_at'])) ?></span>
                                    </div>
                                    <div style="color: #cbd5e1; font-size: 1rem; line-height: 1.6;"><?= nl2br(htmlspecialchars($msg['message'])) ?></div>
                                </div>

                                <!-- Admin's Reply -->
                                <?php if ($msg['reply_message']): ?>
                                    <div style="background: rgba(56, 189, 248, 0.08); border-top: 1px solid rgba(56, 189, 248, 0.1); padding: 1.5rem;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
                                            <span style="color: #10b981; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Admin Reply</span>
                                            <span style="color: #64748b; font-size: 0.8rem;"><?= (isset($msg['replied_at']) && $msg['replied_at']) ? date('M d, Y h:i A', strtotime($msg['replied_at'])) : '' ?></span>
                                        </div>
                                        <div style="color: #f8fafc; font-size: 1rem; line-height: 1.6; font-weight: 500;">
                                            <?= nl2br(htmlspecialchars($msg['reply_message'])) ?>
                                        </div>
                                    </div>
                                <?php else: ?>
                                    <div style="padding: 1rem 1.5rem; background: rgba(0,0,0,0.1); border-top: 1px solid rgba(255,255,255,0.02); text-align: right;">
                                        <span style="color: #64748b; font-size: 0.8rem; font-style: italic;">Awaiting admin response...</span>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>

    </div>
</div>

<?php include __DIR__ . '/layout/footer.php'; ?>
