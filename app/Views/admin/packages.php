<?php 
$pageTitle = 'Package Management';
$activePage = 'packages';
include __DIR__ . '/layout_header.php'; 
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_packages.css">

<div class="admin-page-container">
    <div class="page-header">
        <h2>Package Management</h2>
        <p>Add, edit, or remove photography packages shown to customers.</p>
    </div>

    <div class="packages-content">
        <div class="package-editor">
            <h3><?= $editPkg ? 'Edit Package' : 'Add New Package' ?></h3>
            <form action="<?= BASE_URL ?>/admin/packages/save" method="POST" class="admin-form">
                <?php if ($editPkg): ?>
                    <input type="hidden" name="id" value="<?= $editPkg['id'] ?>">
                <?php endif; ?>
                
                <div class="input-group">
                    <label>Package Title</label>
                    <input type="text" name="title" value="<?= $editPkg ? htmlspecialchars($editPkg['title']) : '' ?>" placeholder="e.g. Birthday Party" required />
                </div>
                <div class="input-group">
                    <label>Price</label>
                    <input type="text" name="price" value="<?= $editPkg ? htmlspecialchars($editPkg['price']) : '' ?>" placeholder="e.g. LKR 40,000" required />
                </div>
                <div class="input-group">
                    <label>Category</label>
                    <select name="category_id" required>
                        <option value="">Select Category</option>
                        <?php foreach ($categories as $cat): ?>
                            <option value="<?= $cat['id'] ?>" <?= ($editPkg && $editPkg['category_id'] == $cat['id']) ? 'selected' : '' ?>>
                                <?= htmlspecialchars($cat['category_name']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="input-group">
                    <label>Duration / Coverage</label>
                    <input type="text" name="duration" value="<?= $editPkg ? htmlspecialchars($editPkg['duration']) : '' ?>" placeholder="e.g. 1 Day, Full Event" required />
                </div>
                <div class="input-group">
                    <label>Description (Features)</label>
                    <textarea name="description" rows="4" placeholder="List features..." required><?= $editPkg ? htmlspecialchars($editPkg['description']) : '' ?></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary"><?= $editPkg ? 'Save Changes' : 'Add Package' ?></button>
                    <?php if ($editPkg): ?>
                        <a href="<?= BASE_URL ?>/admin/packages" class="btn-secondary" style="text-decoration: none; display: inline-block; text-align: center;">Cancel</a>
                    <?php endif; ?>
                </div>
            </form>
        </div>

        <div class="packages-list">
            <?php foreach ($packages as $pkg): ?>
                <div class="package-card-admin">
                    <div class="package-info">
                        <h4><?= htmlspecialchars($pkg['title']) ?> <span class="price-badge"><?= htmlspecialchars($pkg['price']) ?></span></h4>
                        <span class="category-badge"><?= htmlspecialchars($pkg['category_name'] ?: 'Uncategorized') ?></span>
                        <p><?= htmlspecialchars($pkg['description']) ?></p>
                    </div>
                    <div class="package-actions">
                        <a href="<?= BASE_URL ?>/admin/packages?edit=<?= $pkg['id'] ?>" class="action-btn edit" title="Edit" style="text-decoration: none;">✏️</a>
                        <form action="<?= BASE_URL ?>/admin/packages/delete" method="POST" style="display: inline;" data-confirm-message="Are you sure you want to delete this package?">
                            <input type="hidden" name="id" value="<?= $pkg['id'] ?>">
                            <button type="submit" class="action-btn delete">🗑️</button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
            <?php if (empty($packages)): ?>
                <div class="empty-state">No packages created yet.</div>
            <?php endif; ?>

            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 3rem 0;">

            <div class="category-management">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem;">
                    <h3>Manage Categories</h3>
                    <button type="button" class="btn-primary" onclick="showAddCategory()" style="padding: 0.5rem 1rem; font-size: 0.8rem;">+ Add New Category</button>
                </div>

                <div id="addCategoryForm" style="display: none; background: rgba(30, 41, 59, 0.4); padding: 2rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <form action="<?= BASE_URL ?>/admin/packages/category/save" method="POST" class="admin-form" style="display: flex; gap: 1.5rem; align-items: flex-end; flex-wrap: wrap;">
                        <input type="hidden" name="id" id="catId">

                        <div class="input-group" style="margin-bottom: 0; flex: 1;">
                            <label>Category Name</label>
                            <input type="text" name="category_name" id="catName" required placeholder="e.g. Wedding, Birthday">
                        </div>
                        <button type="submit" class="btn-primary" style="height: 45px;">Save</button>
                        <button type="button" class="btn-secondary" onclick="hideAddCategory()" style="height: 45px;">Cancel</button>
                    </form>
                </div>

                <div class="category-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                    <?php foreach ($categories as $cat): ?>
                        <div class="category-item" style="background: rgba(30, 41, 59, 0.7); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 500;"><?= htmlspecialchars($cat['category_name']) ?></span>
                            <div style="display: flex; gap: 8px;">
                                <button type="button" class="action-btn edit" onclick="editCategory(<?= $cat['id'] ?>, '<?= addslashes($cat['category_name']) ?>')" title="Edit">✏️</button>
                                <form action="<?= BASE_URL ?>/admin/packages/category/delete" method="POST" style="display: inline;" data-confirm-message="Are you sure you want to delete this category?">
                                    <input type="hidden" name="id" value="<?= $cat['id'] ?>">
                                    <button type="submit" class="action-btn delete">🗑️</button>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    function showAddCategory() {
        document.getElementById('catId').value = '';
        document.getElementById('catName').value = '';
        document.getElementById('addCategoryForm').style.display = 'block';
        document.getElementById('catName').focus();
    }

    function hideAddCategory() {
        document.getElementById('addCategoryForm').style.display = 'none';
    }

    function editCategory(id, name) {
        document.getElementById('catId').value = id;
        document.getElementById('catName').value = name;
        document.getElementById('addCategoryForm').style.display = 'block';
        document.getElementById('catName').focus();
    }
</script>

<?php include __DIR__ . '/layout_footer.php'; ?>
