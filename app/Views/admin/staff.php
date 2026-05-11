<?php 
$pageTitle = 'Employee Directory';
$activePage = 'staff';
include __DIR__ . '/layout_header.php'; 
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_employees.css">

<div class="admin-page-container">
    <div class="page-header">
        <h2>Employees Directory Management</h2>
        <p>Manage the full staff directory.</p>
    </div>

    <div class="employee-content-split">
        <!-- Form Section -->
        <div class="employee-form-container">
            <h3><?= $editStaff ? 'Edit Staff Member' : 'Add New Staff Member' ?></h3>
            <form action="<?= BASE_URL ?>/admin/staff/save" method="POST" class="admin-form">
                <?php if ($editStaff): ?>
                    <input type="hidden" name="id" value="<?= $editStaff['id'] ?>">
                <?php endif; ?>

                <div class="input-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value="<?= $editStaff ? htmlspecialchars($editStaff['full_name']) : '' ?>" placeholder="Full name of employee" required />
                </div>
                
                <div class="input-row">
                    <div class="input-group">
                        <label>Position</label>
                        <input type="text" name="position" value="<?= $editStaff ? htmlspecialchars($editStaff['position']) : '' ?>" placeholder="Position (e.g., Photographer)" required />
                    </div>
                    <div class="input-group">
                        <label>Join Date</label>
                        <input type="date" name="joinDate" value="<?= $editStaff ? htmlspecialchars(date('Y-m-d', strtotime($editStaff['created_at']))) : '' ?>" />
                    </div>
                </div>

                <div class="input-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value="<?= $editStaff ? htmlspecialchars($editStaff['email']) : '' ?>" placeholder="Email address" />
                </div>

                <div class="input-row">
                    <div class="input-group">
                        <label>Phone Number</label>
                        <input type="tel" name="phone" value="<?= $editStaff ? htmlspecialchars($editStaff['mobile']) : '' ?>" placeholder="Contact phone" required />
                    </div>
                    <div class="input-group">
                        <label>Status</label>
                        <select name="status">
                            <option value="1" <?= ($editStaff && $editStaff['status'] == 1) ? 'selected' : '' ?>>Active</option>
                            <option value="0" <?= ($editStaff && $editStaff['status'] == 0) ? 'selected' : '' ?>>Inactive</option>
                        </select>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary"><?= $editStaff ? 'Save Changes' : 'Add Member' ?></button>
                    <?php if ($editStaff): ?>
                        <a href="<?= BASE_URL ?>/admin/staff" class="btn-secondary" style="text-decoration: none; display: inline-block; text-align: center;">Cancel</a>
                    <?php endif; ?>
                </div>
            </form>
        </div>

        <!-- List Section -->
        <div class="employee-list-container">
            <h3>Staff List</h3>
            <div class="employee-cards">
                <?php foreach ($staff as $member): ?>
                    <div class="employee-card">
                        <div class="emp-header">
                            <h4><?= htmlspecialchars($member['full_name']) ?></h4>
                            <?php 
                            $statusClass = ($member['status'] == 1) ? 'active' : 'inactive';
                            ?>
                            <span class="role-badge <?= $statusClass ?>">
                                <?= ($member['status'] == 1) ? 'Active' : 'Inactive' ?>
                            </span>
                        </div>
                        <div class="emp-details">
                            <p><strong>Position:</strong> <?= htmlspecialchars($member['position']) ?></p>
                            <p><strong>Phone:</strong> <?= htmlspecialchars($member['mobile']) ?></p>
                            <p><strong>Joined:</strong> <?= $member['created_at'] ? date('Y-m-d', strtotime($member['created_at'])) : 'N/A' ?></p>
                        </div>
                        <div class="emp-actions">
                            <a href="<?= BASE_URL ?>/admin/staff?edit=<?= $member['id'] ?>" class="action-btn edit-btn">Edit</a>
                            <form action="<?= BASE_URL ?>/admin/staff/delete" method="POST" style="display: inline;" data-confirm-message="Delete this staff record?">
                                <input type="hidden" name="id" value="<?= $member['id'] ?>">
                                <button type="submit" class="action-btn delete-btn">Delete</button>
                            </form>
                        </div>
                    </div>
                <?php endforeach; ?>
                <?php if (empty($staff)): ?>
                    <p style="color: #94a3b8">No staff members added yet.</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/layout_footer.php'; ?>
