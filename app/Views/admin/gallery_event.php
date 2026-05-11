<?php 
$evtName = $event ? htmlspecialchars($event['title']) : 'Unknown';
$pageTitle = $evtName . ' - Photos';
$activePage = 'gallery';
include __DIR__ . '/layout_header.php'; 
?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_gallery.css">

<div class="admin-page-container">
    <div class="page-header">
        <h2>Gallery Management</h2>
        <p>Manage photos for "<?= $evtName ?>".</p>
        <div class="admin-breadcrumbs">
            <a href="<?= BASE_URL ?>/admin/gallery">Categories</a>
            <span class="separator">/</span>
            <?php if ($event): ?>
                <a href="<?= BASE_URL ?>/admin/gallery/category/<?= $event['category_id'] ?>">Category</a>
                <span class="separator">/</span>
            <?php endif; ?>
            <span class="active"><?= $evtName ?></span>
        </div>
    </div>

    

    <div class="view-section">
        <div class="upload-section">
            <h3>Upload Photos to "<?= $evtName ?>"</h3>
            <form action="<?= BASE_URL ?>/admin/gallery/upload" method="POST" enctype="multipart/form-data" id="uploadForm">
                <input type="hidden" name="event_id" value="<?= $id ?>">
                <div class="upload-box" onclick="document.getElementById('fileInput').click()">
                    <div class="upload-icon">☁️</div>
                    <p>Click to browse or drag and drop multiple photos</p>
                    <span class="upload-hint">JPG, PNG, WEBP allowed</span>
                    <input
                        type="file"
                        id="fileInput"
                        name="photos[]"
                        accept="image/*"
                        multiple
                        hidden
                        onchange="showPreviews(this)"
                    />
                </div>

                <div id="previewsPanel" class="upload-actions-panel" style="display: none;">
                    <h4>Selected (<span id="fileCount">0</span>)</h4>
                    <div id="previewsGrid" class="previews-grid"></div>
                    <div class="upload-buttons">
                        <button type="submit" class="btn-primary">Upload Photos</button>
                        <button type="button" class="btn-secondary" onclick="resetUpload()">Cancel</button>
                    </div>
                </div>
            </form>
        </div>



        <div class="gallery-admin-grid">
            <?php foreach ($images as $photo): ?>
                <div class="admin-gallery-item">
                    <img src="<?= BASE_URL . htmlspecialchars($photo['url']) ?>" alt="Gallery item" loading="lazy" />
                    <div class="item-overlay-admin">
                        <form action="<?= BASE_URL ?>/admin/gallery/image/delete" method="POST" data-confirm-message="Remove photo?">
                            <input type="hidden" name="id" value="<?= $photo['id'] ?>">
                            <input type="hidden" name="event_id" value="<?= $id ?>">
                            <button type="submit" class="delete-photo-btn" title="Delete Photo">🗑️</button>
                        </form>
                    </div>
                </div>
                
            <?php endforeach; ?>
            <?php if (empty($images)): ?>
                <p class="empty-message">No photos in this event yet.</p>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
function showPreviews(input) {
    const panel = document.getElementById('previewsPanel');
    const grid = document.getElementById('previewsGrid');
    const count = document.getElementById('fileCount');
    
    grid.innerHTML = '';
    if (input.files && input.files.length > 0) {
        panel.style.display = 'block';
        count.innerText = input.files.length;
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const item = document.createElement('div');
                item.className = 'preview-item';
                item.innerHTML = `<img src="${e.target.result}" />`;
                grid.appendChild(item);
            }
            reader.readAsDataURL(file);
        });
    } else {
        panel.style.display = 'none';
    }
}

function resetUpload() {
    document.getElementById('fileInput').value = '';
    document.getElementById('previewsPanel').style.display = 'none';
    document.getElementById('previewsGrid').innerHTML = '';
}
</script>

<?php include __DIR__ . '/layout_footer.php'; ?>
