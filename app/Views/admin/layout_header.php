<?php
$adminRoles = ['Super Admin', 'Admin', 'Employee'];
if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role'], $adminRoles)) {
    header("Location: " . BASE_URL . "/admin/login");
    exit;
}
$admin = $_SESSION['user'];
$activePage = $activePage ?? 'dashboard';
$permissions = $admin['permissions'] ?? [];

// Access Control: If not Super Admin, check if they have permission for the current page
$isSuper = ($admin['role'] === 'Super Admin');
if (!$isSuper && $activePage !== 'dashboard' && !in_array($activePage, $permissions)) {
    // Check if the item is even in the restricted list (some pages like dashboard might be always allowed)
    // For now, let's redirect to dashboard if they try to access something not granted
    $_SESSION['flash_message'] = "Access Denied: You do not have permission to view this page.";
    $_SESSION['flash_type'] = "error";
    header("Location: " . BASE_URL . "/admin/dashboard");
    exit;
}

$navItems = [

    ['path' => BASE_URL . '/admin/dashboard', 'icon' => '📊', 'label' => 'Dashboard', 'id' => 'dashboard'],
    ['path' => BASE_URL . '/admin/bookings', 'icon' => '📅', 'label' => 'Bookings', 'id' => 'bookings'],
    ['path' => BASE_URL . '/admin/old-bookings', 'icon' => '⏳', 'label' => 'Old Bookings', 'id' => 'old-bookings'],
    ['path' => BASE_URL . '/admin/gallery', 'icon' => '🖼️', 'label' => 'Gallery', 'id' => 'gallery'],
    ['path' => BASE_URL . '/admin/packages', 'icon' => '📦', 'label' => 'Packages', 'id' => 'packages'],
    ['path' => BASE_URL . '/admin/chatbot', 'icon' => '🤖', 'label' => 'Chatbot FAQs', 'id' => 'chatbot'],
    ['path' => BASE_URL . '/admin/messages', 'icon' => '💬', 'label' => 'Messages', 'id' => 'messages'],
    ['path' => BASE_URL . '/admin/users', 'icon' => '👥', 'label' => 'User Management', 'id' => 'users'],
    ['path' => BASE_URL . '/admin/staff', 'icon' => '👤', 'label' => 'Employe Management', 'id' => 'staff'],
    ['path' => BASE_URL . '/admin/employees', 'icon' => '🛡️', 'label' => 'Admin Accounts', 'id' => 'employees', 'superOnly' => true],
    ['path' => BASE_URL . '/admin/logs', 'icon' => '📜', 'label' => 'Activity Logs', 'id' => 'logs', 'superOnly' => true],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'Admin' ?> - Dream Go Studio</title>
    <link rel="icon" type="image/png" href="<?= BASE_URL ?>/assets/images/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_layout.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/notifications.css">
    <script src="<?= BASE_URL ?>/assets/js/notifications.js" defer></script>
    <style>
        /* Small fixes for PHP version */
        .admin-main-content { overflow-x: hidden; }
        .sidebar-link { text-decoration: none; }
    </style>

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
    <div class="admin-layout-container">
        <!-- Sidebar -->
        <aside class="admin-sidebar" id="adminSidebar">
            <div class="sidebar-header">
                <img src="<?= BASE_URL ?>/assets/images/DreamGO%20-White.png" alt="Dream Go Logo" class="admin-logo">
                <span class="badge">Admin Hub</span>
            </div>

            <nav class="sidebar-nav">
                <?php foreach ($navItems as $item): ?>
                    <?php 
                    if (isset($item['superOnly']) && $item['superOnly'] && !$isSuper) continue;
                    // For regular admins, check if the page is in their granted permissions
                    if (!$isSuper && $item['id'] !== 'dashboard' && !in_array($item['id'], $permissions)) continue;
                    ?>
                    <a href="<?= $item['path'] ?>" class="sidebar-link <?= ($activePage === $item['id']) ? 'active' : '' ?>">

                        <span class="icon"><?= $item['icon'] ?></span>
                        <span class="label"><?= $item['label'] ?></span>
                    </a>
                <?php endforeach; ?>
            </nav>

            <div class="sidebar-footer">
                <a href="<?= BASE_URL ?>/admin/logout" class="logout-btn" style="text-decoration: none;" data-confirm-message="Are you sure you want to logout?">
                    <span>🚪</span> Logout
                </a>
            </div>
        </aside>

        <div class="admin-sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebarMenu()"></div>

        <!-- Main Content -->
        <main class="admin-main-content">
            <header class="admin-topbar">
                <div class="topbar-left">
                    <div class="admin-mobile-menu-btn" onclick="toggleSidebarMenu()">
                        <div class="hamburger" id="adminHamburger">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                    <div class="topbar-title">
                        <h3><?= $pageTitle ?? 'Dashboard' ?></h3>
                    </div>
                </div>
                <div class="admin-profile">
                    <div class="avatar"><?= strtoupper(substr($admin['full_name'], 0, 1)) ?></div>
                    <span class="profile-name"><?= htmlspecialchars($admin['full_name']) ?></span>
                    <div style="font-size: 0.7rem; color: #94a3b8; margin-left: auto; margin-right:1rem; text-transform:uppercase;">
                        <?= $admin['role'] ?>
                    </div>
                    <a href="<?= BASE_URL ?>/admin/logout" class="topbar-logout-btn" title="Logout" style="text-decoration: none;" data-confirm-message="Are you sure you want to logout?">
                        🚪
                    </a>
                </div>
            </header>

            <div class="admin-content-wrapper">
