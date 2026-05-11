<?php 
$catName = $category ? htmlspecialchars($category['name']) : 'Unknown';
$pageTitle = $catName . ' - Events';
$activePage = 'gallery';
include __DIR__ . '/layout_header.php'; 
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_gallery.css">

<div class="admin-page-container">
    <div class="page-header">
        <h2>Gallery Management</h2>
        <p>Manage events for "<?= $catName ?>".</p>
        <div class="admin-breadcrumbs">
            <a href="<?= BASE_URL ?>/admin/gallery">Categories</a>
            <span class="separator">/</span>
            <span class="active"><?= $catName ?></span>
        </div>
    </div>

    <div class="view-section">
        <form action="<?= BASE_URL ?>/admin/gallery/event/save" method="POST" class="admin-inline-form">
            <input type="hidden" name="category_id" value="<?= $id ?>">
            <input
                type="text"
                name="title"
                placeholder="Event Name (e.g. Nipun & Chathu)"
                required
            />
            <button type="submit" class="btn-primary">Add Event</button>
        </form>

        <div class="admin-grid">
            <?php foreach ($events as $evt): ?>
                <div class="admin-card" onclick="location.href='<?= BASE_URL ?>/admin/gallery/event/<?= $evt['id'] ?>'">
                    <div class="card-image-placeholder">
                        <?php if (!empty($evt['cover_image'])): ?>
                            <img src="<?= BASE_URL . htmlspecialchars($evt['cover_image']) ?>" alt="<?= htmlspecialchars($evt['title']) ?>" />
                        <?php else: ?>
                            <span class="icon-placeholder">📅</span>
                        <?php endif; ?>
                    </div>
                    <div class="card-info">
                        <div>
                            <h4><?= htmlspecialchars($evt['title']) ?></h4>
                            <?php if (!empty($evt['created_at'])): ?>
                                <small class="event-date"><?= date('n/j/Y', strtotime($evt['created_at'])) ?></small>
                            <?php endif; ?>
                        </div>
                        <form action="<?= BASE_URL ?>/admin/gallery/event/delete" method="POST" style="display: inline;" data-confirm-message="Delete event and all photos?">
                            <input type="hidden" name="id" value="<?= $evt['id'] ?>">
                            <input type="hidden" name="category_id" value="<?= $id ?>">
                            <button type="submit" class="icon-btn delete" onclick="event.stopPropagation();">🗑️</button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
            <?php if (empty($events)): ?>
                <p class="empty-message">No events found in this category.</p>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include __DIR__ . '/layout_footer.php'; ?>
