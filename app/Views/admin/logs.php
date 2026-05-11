<?php 
$pageTitle = 'Activity Logs';
$activePage = 'logs';
include __DIR__ . '/layout_header.php'; 
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_logs.css">

<div class="admin-page-container">
    <div class="page-header">
        <h2>System Activity Logs</h2>
        <p>Monitor administrative actions and system events.</p>
    </div>

    <div class="table-container">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($logs as $log): ?>
                    <tr>
                        <td class="timestamp"><?= date('M j, Y g:i A', strtotime($log['created_at'])) ?></td>
                        <td>
                            <div class="actor-info">
                                <span class="actor-name"><?= htmlspecialchars($log['actor_name'] ?: 'System') ?></span>
                            </div>
                        </td>
                        <td>
                            <span class="action-tag <?= strtolower(explode(' ', $log['action'])[0]) ?>">
                                <?= htmlspecialchars($log['action']) ?>
                            </span>
                        </td>
                        <td>
                            <div class="target-info">
                                <span class="target-type"><?= htmlspecialchars($log['target_type']) ?></span>
                                <span class="target-name">
                                    <?= $log['target_name'] ? htmlspecialchars($log['target_name']) : ($log['target_id'] ? '#' . htmlspecialchars($log['target_id']) : '') ?>
                                </span>
                            </div>
                        </td>
                        <td class="details-cell"><?= htmlspecialchars($log['details']) ?></td>
                    </tr>
                <?php endforeach; ?>
                <?php if (empty($logs)): ?>
                    <tr>
                        <td colspan="5" class="empty-state">No activity logs found.</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</div>

<?php include __DIR__ . '/layout_footer.php'; ?>
