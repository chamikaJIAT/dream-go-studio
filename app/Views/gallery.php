<?php $pageTitle = 'Gallery - Dream Go Studio'; ?>
<?php $activePage = 'gallery'; ?>
<?php include __DIR__ . '/layout/header.php'; ?>

<div class="gallery-container">
    <div class="gallery-header">
        <h1>Our Masterpieces</h1>
        <p>Explore beautiful memories, sorted by category.</p>
        <div class="breadcrumbs">
            <a href="<?= BASE_URL ?>/">Home</a> <span>/</span> <span class="current">Gallery</span>
        </div>
        <div class="sub-header-info">
            <span class="sub-icon">📁</span>
            <span class="sub-text">Categories</span>
        </div>
    </div>

    <div class="gallery-grid">
        <?php foreach ($categories as $cat): ?>
            <a href="<?= BASE_URL ?>/gallery/category/<?= htmlspecialchars($cat['id']) ?>" class="gallery-card" style="text-decoration: none; color: inherit;">
                <div class="card-image">
                    <?php if (!empty($cat['cover_image'])): ?>
                        <img src="<?= BASE_URL . htmlspecialchars($cat['cover_image']) ?>" alt="<?= htmlspecialchars($cat['name']) ?>" loading="lazy" />
                    <?php else: ?>
                        <div class="placeholder-bg" >📁</div>
                    <?php endif; ?>
                </div>
                <div class="card-overlay">
                    <h3><?= htmlspecialchars($cat['name']) ?></h3>
                </div>
            </a>
        <?php endforeach; ?>
        <?php if (empty($categories)): ?>
            <div class="empty-gallery">
                Our gallery is currently being curated. Come back soon!
            </div>
        <?php endif; ?>
    </div>
</div>

<?php include __DIR__ . '/layout/footer.php'; ?>
