<?php 
$pageTitle = 'Dashboard';
$activePage = 'dashboard';
include __DIR__ . '/layout_header.php'; 
?>

<div class="admin-dashboard">
    <div class="welcome-banner">
        <h2>Welcome back, <?= htmlspecialchars($admin['full_name']) ?>! 👋</h2>
        <p>Here's what's happening with Dream Go Studio today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
        <?php foreach ($stats as $stat): ?>
            <div class="stat-card <?= $stat['color'] ?>">
                <div class="stat-icon"><?= $stat['icon'] ?></div>
                <div class="stat-info">
                    <span class="stat-label"><?= $stat['label'] ?></span>
                    <span class="stat-value"><?= $stat['value'] ?></span>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Quick Actions -->
    <div class="dashboard-grid">
        <div class="admin-card">
            <div class="card-header">
                <h3>Quick Management</h3>
            </div>
            <div class="quick-actions-grid">
                <a href="<?= BASE_URL ?>/admin/bookings" class="action-btn">Manage Bookings</a>
                <a href="<?= BASE_URL ?>/admin/gallery" class="action-btn">Update Gallery</a>
                <a href="<?= BASE_URL ?>/admin/packages" class="action-btn">Edit Packages</a>
                <a href="<?= BASE_URL ?>/admin/messages" class="action-btn">Check Messages</a>
            </div>
        </div>
        
    </div>
</div>

<style>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: transform 0.3s ease;
}

.stat-card:hover { transform: translateY(-5px); }

.stat-icon {
    font-size: 2rem;
    width: 60px;
    height: 60px;
    background: rgba(15, 23, 42, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
}

.stat-info { display: flex; flex-direction: column; }
.stat-label { color: #94a3b8; font-size: 0.9rem; }
.stat-value { font-size: 1.8rem; font-weight: 700; color: #fff; }

.stat-card.blue { border-left: 4px solid #3b82f6; }
.stat-card.orange { border-left: 4px solid #f97316; }
.stat-card.purple { border-left: 4px solid #a855f7; }
.stat-card.green { border-left: 4px solid #22c55e; }

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
}

.admin-card {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
}

.card-header {
    padding: 1.2rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.quick-actions-grid {
    padding: 1.5rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.action-btn {
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    padding: 1rem;
    text-align: center;
    border-radius: 12px;
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.action-btn:hover {
    background: #3b82f6;
    border-color: #3b82f6;
}

@media (max-width: 600px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
    
    .quick-actions-grid {
        grid-template-columns: 1fr;
    }
    
    .welcome-banner h2 {
        font-size: 1.4rem;
    }
    
    .stat-card {
        padding: 1rem;
        gap: 1rem;
    }
}
</style>

<?php include __DIR__ . '/layout_footer.php'; ?>
