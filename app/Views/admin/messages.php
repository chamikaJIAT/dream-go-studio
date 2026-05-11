<?php 
$pageTitle = 'Messages Inbox';
$activePage = 'messages';
include __DIR__ . '/layout_header.php'; 

$unreadCount = 0;
foreach ($messages as $m) if ($m['status'] === 'Unread') $unreadCount++;
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_messages.css">

<div class="admin-page-container">
    <div class="page-header">
        <h2>Messages Inbox <?php if ($unreadCount > 0): ?><span class="unread-badge"><?= $unreadCount ?> New</span><?php endif; ?></h2>
        <p>Messages sent through the Contact Us form.</p>
    </div>

    <div class="messages-layout">
        <!-- Message List -->
        <div class="messages-list-panel">
            <?php if (empty($messages)): ?>
                <div class="messages-empty">No messages found.</div>
            <?php endif; ?>

            <?php foreach ($messages as $msg): ?>
                <div
                    class="message-item <?= $msg['status'] === 'Unread' ? 'unread' : '' ?> <?= $msg['status'] === 'Replied' ? 'replied' : '' ?> <?= (isset($_GET['id']) && $_GET['id'] == $msg['id']) ? 'active' : '' ?>"
                    onclick="location.href='<?= BASE_URL ?>/admin/messages?id=<?= $msg['id'] ?>'"
                >
                    <div class="message-item-header">
                        <span class="sender-name"><?= htmlspecialchars($msg['user_name'] ?: $msg['guest_name'] ?: 'Unknown') ?></span>
                        <span class="message-date"><?= date('M j, Y g:i A', strtotime($msg['created_at'])) ?></span>
                    </div>
                    <div class="message-subject"><?= htmlspecialchars($msg['subject'] ?: 'No Subject') ?></div>
                    <div class="message-preview"><?= $msg['message'] ? htmlspecialchars(substr($msg['message'], 0, 70)) . (strlen($msg['message']) > 70 ? '...' : '') : '<em style="opacity:0.5;">No content</em>' ?></div>
                    <?php if ($msg['status'] === 'Unread'): ?><span class="new-dot" title="Unread"></span><?php endif; ?>
                    <?php if ($msg['status'] === 'Replied'): ?><span class="reply-check" title="Replied">✓</span><?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Message Detail -->
        <div class="message-detail-panel">
            <?php if (!$selectedMsg): ?>
                <div class="no-selection">
                    <div class="no-selection-icon">📬</div>
                    <p>Select a message to read it</p>
                </div>
            <?php else: ?>
                <div class="message-detail">
                    <div class="detail-header">
                        <div>
                            <h3><?= htmlspecialchars($selectedMsg['subject'] ?: 'No Subject') ?></h3>
                            <p class="detail-meta">From: <strong><?= htmlspecialchars($selectedMsg['user_name'] ?: $selectedMsg['guest_name'] ?: 'Guest') ?></strong> 
                                <?php if ($selectedMsg['guest_email']): ?>
                                    &lt;<?= htmlspecialchars($selectedMsg['guest_email']) ?>&gt;
                                <?php endif; ?>
                            </p>
                            <p class="detail-meta">
                                Received: <?= date('F j, Y, g:i A', strtotime($selectedMsg['created_at'])) ?> 
                                <span class="badge <?= $selectedMsg['user_id'] ? 'badge-user' : 'badge-guest' ?>" style="margin-left: 10px; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;">
                                    <?= $selectedMsg['user_id'] ? '👤 Registered Client' : '🌐 Guest User' ?>
                                </span>
                            </p>
                        </div>
                        <div class="detail-actions">
                            <a
                                href="mailto:<?= htmlspecialchars($selectedMsg['guest_email'] ?: '') ?>?subject=Re: <?= urlencode($selectedMsg['subject'] ?: '') ?>"
                                class="btn-reply"
                                style="text-decoration: none;"
                            >
                                ↩ Reply
                            </a>
                            <form action="<?= BASE_URL ?>/admin/messages/delete" method="POST" style="display: inline;" data-confirm-message="Delete this message?">
                                <input type="hidden" name="id" value="<?= $selectedMsg['id'] ?>">
                                <button type="submit" class="btn-delete-msg">
                                    🗑️ Delete
                                </button>
                            </form>
                        </div>
                    </div>
                    <div class="detail-body">
                        <div class="original-message" style="padding-bottom: 1rem;">
                            <p style="font-size: 1.1rem; color: #f1f5f9; line-height: 1.6; margin: 0;">
                                <?php if ($selectedMsg['message']): ?>
                                    <?= nl2br(htmlspecialchars($selectedMsg['message'])) ?>
                                <?php else: ?>
                                    <em style="opacity: 0.5; color: #94a3b8;">(This message has no content)</em>
                                <?php endif; ?>
                            </p>
                        </div>

                        <?php if ($selectedMsg['reply_message']): ?>
                            <div class="admin-reply-section">
                                <div class="reply-header">
                                    <span class="reply-label">Admin Reply</span>
                                </div>
                                <div class="reply-content">
                                    <?= nl2br(htmlspecialchars($selectedMsg['reply_message'])) ?>
                                </div>
                            </div>
                        <?php endif; ?>

                        <!-- Fast Actions & Reply -->
                        <div class="message-actions-row" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start;">
                            <!-- Direct Contact -->
                            <div class="direct-contact-buttons" style="display: flex; gap: 10px;">
                                <a href="tel:<?= htmlspecialchars($selectedMsg['guest_phone'] ?? '') ?>" class="btn-contact phone" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600;">📞 Call Now</a>
                                <a href="https://wa.me/<?= str_replace(['+', ' '], '', $selectedMsg['guest_phone'] ?? '') ?>" target="_blank" class="btn-contact whatsapp" style="background: rgba(37, 211, 102, 0.1); color: #25D366; border: 1px solid rgba(37, 211, 102, 0.3); padding: 0.5rem 1rem; border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600;">💬 WhatsApp</a>
                            </div>

                            <!-- Small Reply Toggle -->
                            <details style="flex: 1; min-width: 250px;">
                                <summary style="cursor: pointer; color: #38bdf8; font-size: 0.85rem; font-weight: 600; outline: none; margin-bottom: 0.5rem;">✍️ Write a quick reply...</summary>
                                <form action="<?= BASE_URL ?>/admin/messages/reply" method="POST" style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                                    <input type="hidden" name="id" value="<?= $selectedMsg['id'] ?>">
                                    <textarea name="reply" placeholder="Type message..." required style="width: 100%; min-height: 80px; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; padding: 0.8rem; margin-bottom: 0.8rem; font-size: 0.9rem; font-family: inherit;"></textarea>
                                    <button type="submit" class="btn-reply" style="width: 100%; padding: 0.5rem; font-size: 0.85rem;">Send Reply</button>
                                </form>
                            </details>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include __DIR__ . '/layout_footer.php'; ?>
