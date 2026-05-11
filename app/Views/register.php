<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Account - Dream Go Studio</title>
    <link rel="icon" type="image/png" href="<?= BASE_URL ?>/assets/images/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/app.css">
    <style>
        .register-card {
            background: rgba(30, 41, 59, 0.7);
            -webkit-backdrop-filter: blur(20px);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 3rem;
            width: 100%;
            max-width: 500px;
            box-sizing: border-box;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        
        @media (max-width: 600px) {
            .register-card {
                padding: 1.5rem;
                border-radius: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="admin-login-container">
        <div class="register-card">
            <div class="login-header">
                <h2>Join Us</h2>
                <p>Create an account to book and manage your events</p>
            </div>

            <?php if (!empty($error)): ?>
                <div class="login-error" style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; color: #fca5a5; padding: 1rem; border-radius: 8px; margin-bottom: 2rem;"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <form method="POST" action="<?= BASE_URL ?>/register" class="login-form">
                <div class="input-group">
                    <label style="display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.9rem;">Full Name</label>
                    <input type="text" name="name" placeholder="John Doe" required style="width: 100%; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.2); padding: 1rem; color: white; border-radius: 12px; margin-bottom: 1.5rem;">
                </div>

                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.9rem;">Email Address</label>
                        <input type="email" name="email" placeholder="john@example.com" required style="width: 100%; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.2); padding: 1rem; color: white; border-radius: 12px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; margin-bottom: 0.5rem; color: #94a3b8; font-size: 0.9rem;">Mobile Number</label>
                        <input type="tel" name="mobile" placeholder="07x xxxxxxx" required style="width: 100%; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.2); padding: 1rem; color: white; border-radius: 12px;">
                    </div>
                </div>



                <button type="submit" class="login-button" style="width: 100%; padding: 1.2rem; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer;">Register Now</button>
                
                <p style="text-align: center; font-size: 0.9rem; color: #94a3b8; margin-top: 1.5rem;">
                    Already have an account? <a href="<?= BASE_URL ?>/login" style="color: #38bdf8; text-decoration: none; font-weight: 600;">Sign In</a>
                </p>
                <p style="text-align: center; font-size: 0.8rem; margin-top: 0.5rem;">
                    <a href="<?= BASE_URL ?>/" style="color: #64748b; text-decoration: none;">← Back to Home</a>
                </p>
            </form>
        </div>
    </div>
</body>
</html>
