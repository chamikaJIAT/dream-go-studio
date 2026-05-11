<?php 
$pageTitle = 'Admin Management';
$activePage = 'employees';
include __DIR__ . '/layout_header.php'; 

// $availablePages is now passed from AdminController dynamically
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_employees.css">

<div class="admin-page-container">
    <div class="page-header">
        <h2>Admin Account Management</h2>
        <p>Add and manage admin accounts with localized access permissions.</p>
    </div>

    <div class="employee-content-split">
        <!-- Form Section -->
        <div class="employee-form-container">
            <h3><?= $editEmp ? 'Edit Employee Account' : 'Register New Admin' ?></h3>
            <form action="<?= BASE_URL ?>/admin/employees/save" method="POST" class="admin-form">
                <?php if ($editEmp): ?>
                    <input type="hidden" name="id" value="<?= $editEmp['id'] ?>">
                <?php endif; ?>

                <div class="input-group">
                    <?php if ($editEmp): ?>
                        <label>Full Name</label>
                        <input type="text" name="name" value="<?= htmlspecialchars($editEmp['full_name']) ?>" placeholder="Enter employee name" required readonly style="background: #1e293b; color: #94a3b8; cursor: not-allowed;" />
                        <input type="hidden" name="profile_id" value="<?= $editEmp['profile_id'] ?>">
                    <?php else: ?>
                        <label>Select Staff Member</label>
                        <select name="profile_id" required>
                            <option value="" disabled selected>Select from staff directory...</option>
                            <?php foreach ($availableStaff as $staff): ?>
                                <option value="<?= $staff['profile_id'] ?>"><?= htmlspecialchars($staff['full_name']) ?> - <?= htmlspecialchars($staff['position']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    <?php endif; ?>
                </div>
                <div class="input-row">
                    <div class="input-group">
                        <label>Username</label>
                        <input type="text" name="username" value="<?= $editEmp ? htmlspecialchars($editEmp['username']) : '' ?>" placeholder="Login Username" required />
                    </div>
                    <div class="input-group">
                        <label>Password</label>
                        <input type="password" name="password" value="<?= $editEmp ? htmlspecialchars($editEmp['password']) : '' ?>" placeholder="Login Password" required />
                    </div>
                </div>

                <div class="input-group">
                    <label>Role</label>
                    <select name="role" id="roleSelect" onchange="togglePerms(this.value)">
                        <option value="admin" <?= ($editEmp && $editEmp['role_id'] == 2) ? 'selected' : '' ?>>Admin (Employee)</option>
                        <option value="superadmin" <?= ($editEmp && $editEmp['role_id'] == 1) ? 'selected' : '' ?>>Super Admin (Owner)</option>
                    </select>
                </div>

                <div id="permsSection" class="permissions-section" style="<?= ($editEmp && $editEmp['role_id'] == 1) ? 'display:none' : '' ?>">
                    <label class="permissions-label">Select Granted Pages</label>
                    <div class="permissions-grid">
                        <?php foreach ($availablePages as $p): ?>
                            <label class="permission-cb">
                                <input type="checkbox" name="permissions[]" value="<?= $p['id'] ?>" <?= ($editEmp && in_array($p['page_slug'], $editEmp['permissions'])) ? 'checked' : '' ?> />
                                <?= htmlspecialchars($p['page_name']) ?>
                            </label>
                        <?php endforeach; ?>
                    </div>
                    <p class="perm-hint">*Super Admin has access to all pages by default.</p>
                </div>

                <div class="form-actions" style="margin-top: 1rem;">
                    <button type="submit" class="btn-primary"><?= $editEmp ? 'Save Changes' : 'Create Account' ?></button>
                    <?php if ($editEmp): ?>
                        <a href="<?= BASE_URL ?>/admin/employees" class="btn-secondary" style="text-decoration: none; display: inline-block; text-align: center;">Cancel</a>
                    <?php endif; ?>
                </div>
            </form>
        </div>

        <!-- List Section -->
        <div class="employee-list-container">
            <h3>Registered Accounts</h3>
            <div class="employee-cards">
                <?php foreach ($employees as $emp): ?>
                    <div class="employee-card">
                        <div class="emp-header">
                            <h4><?= htmlspecialchars($emp['full_name']) ?></h4>
                            <span class="role-badge <?= strtolower(str_replace(' ', '', $emp['role'])) ?>">
                                <?= htmlspecialchars($emp['role']) ?>
                            </span>
                        </div>
                        <div class="emp-details">
                            <p><strong>Username:</strong> <?= htmlspecialchars($emp['username']) ?></p>
                            <?php if ($emp['role_id'] == 2): ?>
                                <p class="emp-perms">
                                    <strong>Access:</strong> <?= implode(', ', array_map('ucfirst', $emp['permissions'])) ?: 'None' ?>
                                </p>
                            <?php endif; ?>
                        </div>
                        <div class="emp-actions">
                            <a href="<?= BASE_URL ?>/admin/employees?edit=<?= $emp['id'] ?>" class="action-btn edit-btn">Edit</a>
                            <?php if ($emp['id'] != $_SESSION['user']['id']): ?>
                                <form action="<?= BASE_URL ?>/admin/employees/delete" method="POST" style="display: inline;" data-confirm-message="Delete this account?">
                                    <input type="hidden" name="id" value="<?= $emp['id'] ?>">
                                    <button type="submit" class="action-btn delete-btn">Delete</button>
                                </form>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<script>
function togglePerms(role) {
    const section = document.getElementById('permsSection');
    section.style.display = (role === 'superadmin') ? 'none' : 'block';
}
</script>

<?php include __DIR__ . '/layout_footer.php'; ?>
