<?php 
$pageTitle = 'Gallery Management';
$activePage = 'gallery';
include __DIR__ . '/layout_header.php'; 
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_gallery.css">

<div class="admin-page-container">
    <div class="page-header">
        <h2>Gallery Management</h2>
        <p>Organize photos into Categories and Events.</p>
        <div class="admin-breadcrumbs">
            <span class="active">Gallery & Carousel</span>
        </div>
    </div>

    <!-- Carousel Management Section -->
    <div class="view-section" style="margin-bottom: 4rem; padding: 2rem; background: rgba(30, 41, 59, 0.4); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05);">
        <h3 style="margin-top: 0; display: flex; align-items: center; gap: 10px;">🎡 Homepage Carousel</h3>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem;">These images will be displayed on the main booking page slider.</p>
        
        <form action="<?= BASE_URL ?>/admin/carousel/upload" method="POST" enctype="multipart/form-data" class="admin-inline-form" style="margin-bottom: 2rem;">
            <input type="file" name="photos[]" multiple accept="image/*" required style="flex: 1;" />
            <button type="submit" class="btn-primary">Upload to Carousel</button>
        </form>

        <!-- Carousel Settings -->
        <div style="background: rgba(15, 23, 42, 0.4); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 2rem;">
            <h4 style="margin-top: 0; color: #48dbfb; margin-bottom: 1rem;">⚙️ Carousel Settings</h4>
            <form action="<?= BASE_URL ?>/admin/carousel/settings" method="POST" style="display: flex; gap: 2rem; align-items: flex-end; flex-wrap: wrap;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="font-size: 0.8rem; color: #94a3b8;">Transition Speed (Milliseconds)</label>
                    <input type="number" name="speed" value="<?= $carouselSettings['speed'] ?? 5000 ?>" min="1000" max="10000" step="500" required style="background: #1e293b; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.6rem; border-radius: 8px; width: 150px;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <label style="font-size: 0.8rem; color: #94a3b8;">Transition Effect</label>
                    <select name="effect" required style="background: #1e293b; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.6rem; border-radius: 8px; width: 150px;">
                        <option value="fade" <?= ($carouselSettings['effect'] ?? '') === 'fade' ? 'selected' : '' ?>>Fade</option>
                        <option value="zoom" <?= ($carouselSettings['effect'] ?? '') === 'zoom' ? 'selected' : '' ?>>Zoom</option>
                        <option value="slide" <?= ($carouselSettings['effect'] ?? '') === 'slide' ? 'selected' : '' ?>>Slide Horizontal</option>
                        <option value="vert-slide" <?= ($carouselSettings['effect'] ?? '') === 'vert-slide' ? 'selected' : '' ?>>Slide Vertical</option>
                        <option value="blur" <?= ($carouselSettings['effect'] ?? '') === 'blur' ? 'selected' : '' ?>>Blur Fade</option>
                        <option value="flip" <?= ($carouselSettings['effect'] ?? '') === 'flip' ? 'selected' : '' ?>>Flip 3D</option>
                        <option value="shuffle" <?= ($carouselSettings['effect'] ?? '') === 'shuffle' ? 'selected' : '' ?>>3D Box Shuffle</option>
                        <option value="kenburns" <?= ($carouselSettings['effect'] ?? '') === 'kenburns' ? 'selected' : '' ?>>Ken Burns</option>
                        <option value="wipe" <?= ($carouselSettings['effect'] ?? '') === 'wipe' ? 'selected' : '' ?>>Horizontal Wipe</option>
                        <option value="curtain" <?= ($carouselSettings['effect'] ?? '') === 'curtain' ? 'selected' : '' ?>>Vertical Curtain</option>
                        <option value="spin" <?= ($carouselSettings['effect'] ?? '') === 'spin' ? 'selected' : '' ?>>Spin Fade</option>
                        <option value="mosaic" <?= ($carouselSettings['effect'] ?? '') === 'mosaic' ? 'selected' : '' ?>>Mosaic Grid (New)</option>
                        <option value="shatter" <?= ($carouselSettings['effect'] ?? '') === 'shatter' ? 'selected' : '' ?>>Box Shatter (New)</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary" style="padding: 0.7rem 1.5rem;">Update Settings</button>
            </form>
        </div>

        <div class="gallery-admin-grid">
            <?php foreach ($carouselImages as $img): ?>
                <div class="admin-gallery-item" style="height: 180px;">
                    <img src="<?= BASE_URL . htmlspecialchars($img['url']) ?>" alt="Carousel Image" />
                    <div class="item-overlay-admin">
                        <form action="<?= BASE_URL ?>/admin/carousel/delete" method="POST" data-confirm-message="Remove this image from carousel?">
                            <input type="hidden" name="id" value="<?= $img['id'] ?>">
                            <button type="submit" class="delete-photo-btn">🗑️</button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
            <?php if (empty($carouselImages)): ?>
                <div class="empty-message" style="grid-column: 1 / -1;">No carousel images. Default images will be shown on homepage.</div>
            <?php endif; ?>
        </div>
    </div>

    <div class="view-section">
        <h3 style="margin-top: 0; display: flex; align-items: center; gap: 10px;">📁 Gallery Categories</h3>
        <form action="<?= BASE_URL ?>/admin/gallery/category/save" method="POST" class="admin-inline-form">
            <input
                type="text"
                name="name"
                placeholder="New Category Name (e.g. Wedding)"
                required
            />
            <button type="submit" class="btn-primary">Add Category</button>
        </form>

        <div class="admin-grid">
            <?php foreach ($categories as $cat): ?>
                <div class="admin-card" onclick="location.href='<?= BASE_URL ?>/admin/gallery/category/<?= $cat['id'] ?>'">
                    <div class="card-image-placeholder">
                        <?php if (!empty($cat['cover_image'])): ?>
                            <img src="<?= BASE_URL . htmlspecialchars($cat['cover_image']) ?>" alt="<?= htmlspecialchars($cat['name']) ?>" />
                        <?php else: ?>
                            <span class="icon-placeholder">📁</span>
                        <?php endif; ?>
                    </div>
                    <div class="card-info">
                        <h4><?= htmlspecialchars($cat['name']) ?></h4>
                        <form action="<?= BASE_URL ?>/admin/gallery/category/delete" method="POST" style="display: inline;" data-confirm-message="Delete category? All events and photos will be lost.">
                            <input type="hidden" name="id" value="<?= $cat['id'] ?>">
                            <button type="submit" class="icon-btn delete" onclick="event.stopPropagation();">🗑️</button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
            <?php if (empty($categories)): ?>
                <p class="empty-message">No categories found. Create one above.</p>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include __DIR__ . '/layout_footer.php'; ?>
