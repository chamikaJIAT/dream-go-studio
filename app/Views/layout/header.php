<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'Dream Go Studio' ?></title>
    <link rel="icon" type="image/png" href="<?= BASE_URL ?>/assets/images/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/app.css?v=1.1">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/notifications.css">
    <script src="<?= BASE_URL ?>/assets/js/notifications.js" defer></script>
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/vendor/leaflet.css" />
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/vendor/Control.Geocoder.min.css" />
    <script src="<?= BASE_URL ?>/assets/vendor/leaflet.js"></script>
    <script src="<?= BASE_URL ?>/assets/vendor/Control.Geocoder.min.js"></script>


    <?php if (isset($_SESSION['flash_message'])): ?>
        <script>
            (function() {
                var showMsg = function() {
                    if (window.ModalSystem) {
                        ModalSystem.alert(<?= json_encode($_SESSION['flash_message']) ?>, "<?= $_SESSION['flash_type'] ?? 'info' ?>");
                    }
                };
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', showMsg);
                } else {
                    showMsg();
                }
            })();
        </script>
        <?php unset($_SESSION['flash_message'], $_SESSION['flash_type']); ?>
    <?php endif; ?>
</head>

<body>
    <!-- Mobile Topbar -->
    <div class="mobile-topbar" id="mobileTopbar">
        <a href="<?= BASE_URL ?>/" class="mobile-logo">
            <img src="<?= BASE_URL ?>/assets/images/DreamGO%20-White.png" alt="Dream Go Logo">
        </a>
        <div class="mobile-menu-btn" onclick="toggleSidebar()">
            <div class="hamburger" id="hamburger">
                <span></span><span></span><span></span>
            </div>
        </div>
    </div>

    <!-- Sidebar -->
    <nav class="sidebar" id="sidebar">
        <div class="sidebar-container">
            <a href="<?= BASE_URL ?>/" class="sidebar-logo">
                <img src="<?= BASE_URL ?>/assets/images/DreamGO%20-White.png" alt="Dream Go Logo">
            </a>
            <div class="sidebar-links">
                <a href="<?= BASE_URL ?>/" class="sidebar-link <?= ($activePage ?? '') == 'home' ? 'active' : '' ?>">
                    <span class="icon">📅</span> Booking
                </a>
                <a href="<?= BASE_URL ?>/gallery" class="sidebar-link <?= ($activePage ?? '') == 'gallery' ? 'active' : '' ?>">
                    <span class="icon">🖼️</span> Gallery
                </a>
                <a href="<?= BASE_URL ?>/about" class="sidebar-link <?= ($activePage ?? '') == 'about' ? 'active' : '' ?>">
                    <span class="icon">ℹ️</span> About Us
                </a>
                <a href="<?= BASE_URL ?>/contact" class="sidebar-link <?= ($activePage ?? '') == 'contact' ? 'active' : '' ?>">
                    <span class="icon">📞</span> Contact Us
                </a>
                <a href="<?= BASE_URL ?>/my-bookings" class="sidebar-link <?= ($activePage ?? '') == 'my-bookings' ? 'active' : '' ?>">
                    <span class="icon">🧾</span> My Bookings
                </a>
            </div>
            <br/>
            <?php if (isset($_SESSION['user'])): ?>
                <div class="sidebar-user-section">
                    <div class="user-profile" style="justify-content: center; text-align: center;">
                        <div class="user-info" style="align-items: center;">
                            <span class="user-username" style="font-size: 1.2rem; font-weight: 600; color: white;">@<?= htmlspecialchars($_SESSION['user']['username']) ?></span>
                        </div>
                    </div>
                    <br/>
                    <a href="<?= BASE_URL ?>/logout" class="user-logout-btn" style="text-align: center; text-decoration: none;">Logout</a>
                </div>
            <?php endif; ?>
        </div>
        <div class="sidebar-footer">
            <p>© <?= date('Y') ?> Dream Go.</p>
        </div>
    </nav>
    <div class="public-layout">
