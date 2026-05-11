<?php 
$pageTitle = 'User Management';
$activePage = 'users';
include __DIR__ . '/layout_header.php'; 
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_users.css">

<div class="admin-page-container">
    <div class="page-header">
        <h2>User Management</h2>
        <p>Monitor and manage your registered client base.</p>
    </div>

    <div class="users-content">
        <!-- Search Section -->
        <div class="search-container">
            <form action="<?= BASE_URL ?>/admin/users" method="GET" class="search-input-wrapper">
                <span class="search-icon">🔍</span>
                <input 
                    type="text" 
                    name="q"
                    placeholder="Search by name, mobile, or username..." 
                    value="<?= htmlspecialchars($_GET['q'] ?? '') ?>"
                />
            </form>
        </div>

        <!-- Users Table -->
        <div class="table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Registration Date</th>
                        <th>Client Details</th>
                        <th>Contact Info</th>
                        <th>System Access</th>
                        <th>Account Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $user): ?>
                        <tr>
                            <td style="white-space: nowrap;">
                                <div style="display: flex; flex-direction: column;">
                                    <strong style="color: #fff;"><?= date('M j, Y', strtotime($user['created_at'])) ?></strong>
                                    <span style="font-size: 0.75rem; color: #64748b;"><?= date('g:i A', strtotime($user['created_at'])) ?></span>
                                </div>
                            </td>
                            <td>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="width: 38px; height: 38px; background: rgba(56, 189, 248, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #38bdf8; font-weight: 700;">
                                        <?= strtoupper(substr($user['full_name'], 0, 1)) ?>
                                    </div>
                                    <strong style="color: #fff; font-size: 1rem;"><?= htmlspecialchars($user['full_name']) ?></strong>
                                </div>
                            </td>
                            <td>
                                <div style="display: flex; flex-direction: column; gap: 2px;">
                                    <span style="color: #cbd5e1;"><?= htmlspecialchars($user['mobile']) ?></span>
                                    <span style="font-size: 0.8rem; color: #64748b;">Phone Verified</span>
                                </div>
                            </td>
                            <td>
                                <div class="username-tag">
                                    @<?= htmlspecialchars($user['username']) ?>
                                </div>
                            </td>
                            <td>
                                <?php 
                                $statusClass = ($user['status'] == 0) ? 'badge-danger' : 'badge-success';
                                ?>
                                <span class="status-badge <?= $statusClass ?>">
                                    <?= ($user['status'] == 0) ? 'Inactive' : 'Active' ?>
                                </span>
                            </td>
                            <td class="actions-cell">
                                <form action="<?= BASE_URL ?>/admin/users/status" method="POST" style="display: inline;" data-confirm-message="Change status for this user?">
                                    <input type="hidden" name="id" value="<?= $user['id'] ?>">
                                    <input type="hidden" name="status" value="<?= ($user['status'] == 0) ? 1 : 0 ?>">
                                    <button 
                                        type="submit"
                                        class="action-btn <?= ($user['status'] == 0) ? 'activate' : 'deactivate' ?>"
                                        title="<?= ($user['status'] == 0) ? 'Activate User' : 'Deactivate User' ?>"
                                    >
                                        <?php if ($user['status'] == 0): ?>
                                            🔓 <span>Activate</span>
                                        <?php else: ?>
                                            🔒 <span>Deactivate</span>
                                        <?php endif; ?>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if (empty($users)): ?>
                        <tr>
                            <td colSpan="6" class="empty-state">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                                <p>No registered users found matching your search.</p>
                            </td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php include __DIR__ . '/layout_footer.php'; ?>
