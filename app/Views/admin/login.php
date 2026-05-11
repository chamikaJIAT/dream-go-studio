<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Dream Go Studio</title>
    <link rel="icon" type="image/png" href="<?= BASE_URL ?>/assets/images/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin_login.css">
</head>
<body>
    <div class="admin-login-container">
        <div class="login-card">
            <div class="login-header">
                <h2>Admin Portal</h2>
                <p>Login to manage Dream Go Studio</p>
            </div>

            <?php if (isset($error)): ?>
                <div class="login-error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <form action="<?= BASE_URL ?>/admin/login" method="POST" class="login-form">
                <div class="input-group">
                    <label for="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter admin username"
                        required
                    />
                </div>

                <div class="input-group">
                    <label for="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter password"
                        required
                    />
                </div>

                <button type="submit" class="login-button">
                    Secure Login
                </button>
                
                <p style="text-align: center; font-size: 0.8rem; color: #64748b; margin-top: 1rem;">
                    Authorized Personnel Only
                </p>
            </form>
        </div>
    </div>
</body>
</html>
