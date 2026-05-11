<?php 
$evtName = $event ? htmlspecialchars($event['title']) : 'Unknown Event';
$catName = 'Gallery'; // Fallback
$pageTitle = $evtName . ' - Dream Go Studio'; 
$activePage = 'gallery'; 
include __DIR__ . '/layout/header.php'; 
?>

<div class="gallery-container">
    <div class="gallery-header">
        <h1><?= $evtName ?></h1>
        <div class="breadcrumbs">
            <a href="<?= BASE_URL ?>/">Home</a> <span>/</span> 
            <a href="<?= BASE_URL ?>/gallery">Gallery</a> <span>/</span> 
            <a href="<?= BASE_URL ?>/gallery/category/<?= htmlspecialchars($categoryId) ?>">Category</a> <span>/</span> 
            <span class="current"><?= $evtName ?></span>
        </div>
        <div class="sub-header-info">
            <span class="sub-icon">🖼️</span>
            <span class="sub-text">Event Photos</span>
        </div>
    </div>

    <div class="gallery-photo-grid">
        <?php foreach ($images as $photo): ?>
            <div class="photo-item">
                <img src="<?= BASE_URL . htmlspecialchars($photo['url']) ?>" alt="Event moment" loading="lazy" />
            </div>
        <?php endforeach; ?>
        <?php if (empty($images)): ?>
            <div class="empty-gallery">
                No photos uploaded for this event.
            </div>
        <?php endif; ?>
    </div>
</div>

<?php include __DIR__ . '/layout/footer.php'; ?>
