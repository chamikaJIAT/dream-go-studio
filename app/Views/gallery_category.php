<?php $categoryName = $category ? htmlspecialchars($category['name']) : 'Unknown Category'; ?>
<?php $pageTitle = $categoryName . ' - Dream Go Studio'; ?>
<?php $activePage = 'gallery'; ?>
<?php include __DIR__ . '/layout/header.php'; ?>

<div class="gallery-container">
    <div class="gallery-header">
        <h1><?= $categoryName ?></h1>
        <div class="breadcrumbs">
            <a href="<?= BASE_URL ?>/">Home</a> <span>/</span> <a href="<?= BASE_URL ?>/gallery">Gallery</a> <span>/</span> <span class="current"><?= $categoryName ?></span>
        </div>
        <div class="sub-header-info">
            <span class="sub-icon">📸</span>
            <span class="sub-text">Events</span>
        </div>
    </div>

    <div class="gallery-grid">
        <?php foreach ($events as $evt): ?>
            <a href="<?= BASE_URL ?>/gallery/category/<?= htmlspecialchars($categoryId) ?>/event/<?= htmlspecialchars($evt['id']) ?>" class="gallery-card" style="text-decoration: none; color: inherit;">
                <div class="card-image">
                    <?php if (!empty($evt['cover_image'])): ?>
                        <img src="<?= BASE_URL . htmlspecialchars($evt['cover_image']) ?>" alt="<?= htmlspecialchars($evt['title']) ?>" loading="lazy" />
                    <?php else: ?>
                        <div class="placeholder-bg">📅</div>
                    <?php endif; ?>
                </div>
                <div class="card-overlay">
                    <h3><?= htmlspecialchars($evt['title']) ?></h3>
                </div>
            </a>
        <?php endforeach; ?>
        <?php if (empty($events)): ?>
            <div class="empty-gallery">
                No events found in this category yet.
            </div>
        <?php endif; ?>
    </div>
</div>

<?php include __DIR__ . '/layout/footer.php'; ?>
