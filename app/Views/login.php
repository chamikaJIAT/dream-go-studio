<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Login - Dream Go Studio</title>
    <link rel="icon" type="image/png" href="<?= BASE_URL ?>/assets/images/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/app.css">
</head>
<body>
    <div class="admin-login-container">
        <div class="login-card">
            <div class="login-header">
                <h2>Welcome Back</h2>
                <p>Login to book your Dream Event</p>
            </div>

            <?php if (!empty($error)): ?>
                <div class="login-error" style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; color: #fca5a5; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <?php if (!empty($success)): ?>
                <div class="login-success" style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; color: #86efac; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;"><?= htmlspecialchars($success) ?></div>
            <?php endif; ?>

            <form method="POST" action="<?= BASE_URL ?>/login" class="login-form">
                <div class="input-group">
                    <label style="display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.9rem;">Username</label>
                    <input type="text" name="username" placeholder="Enter your username" required style="width: 100%; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.2); padding: 1rem; color: white; border-radius: 12px; margin-bottom: 1.5rem;">
                </div>

                <div class="input-group">
                    <label style="display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.9rem;">Password</label>
                    <input type="password" name="password" placeholder="Enter password" required style="width: 100%; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.2); padding: 1rem; color: white; border-radius: 12px; margin-bottom: 1.5rem;">
                </div>

                <button type="submit" class="login-button" style="width: 100%; padding: 1.2rem; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer;">Sign In</button>
                
                <p style="text-align: center; font-size: 0.9rem; color: #94a3b8; margin-top: 1.5rem;">
                    Don't have an account? <a href="<?= BASE_URL ?>/register" style="color: #38bdf8; text-decoration: none; font-weight: 600;">Create new account</a>
                </p>
                <p style="text-align: center; font-size: 0.8rem; margin-top: 0.5rem;">
                    <a href="<?= BASE_URL ?>/" style="color: #64748b; text-decoration: none;">← Back to Home</a>
                </p>
            </form>
        </div>
    </div>
</body>
</html>
