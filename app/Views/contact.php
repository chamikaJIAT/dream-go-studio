<?php $pageTitle = 'Contact Us - Dream Go Studio'; ?>
<?php $activePage = 'contact'; ?>
<?php include __DIR__ . '/layout/header.php'; ?>

<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/contact.css">

<div class="contact-container">
    <div class="contact-header">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you. Send us a message and we will get back to you as soon as possible.</p>
    </div>

    <div class="contact-content">
        <!-- Contact Info Cards -->
        <div class="contact-info-grid">
            <?php 
            $contactDetails = [
                ["icon" => "📧", "label" => "Email", "value" => "dreamgopictures@gmail.com", "link" => "mailto:dreamgopictures@gmail.com"],
                ["icon" => "📞", "label" => "Phone", "value" => "076 863 4775 / 072 498 0088", "link" => "tel:+94768634775"],
                ["icon" => "📍", "label" => "Address", "value" => "Dream-GO STUDIO, Thalagaha Junction, Akmeemana, Galle", "link" => "https://maps.google.com/?q=Dream-GO+STUDIO+Thalagaha+Junction+Akmeemana+Galle"],
                ["icon" => "🕐", "label" => "Working Hours", "value" => "Mon – Sat<br>9:00 AM (Open)<br>4:30 PM (Close)", "link" => null]
            ];
            foreach ($contactDetails as $i => $item): ?>
                <div class="contact-info-card" style="animation-delay: <?= $i * 0.1 ?>s">
                    <div class="contact-icon"><?= $item['icon'] ?></div>
                    <div>
                        <h4><?= $item['label'] ?></h4>
                        <?php if ($item['link']): ?>
                            <a href="<?= $item['link'] ?>" target="_blank" rel="noreferrer"><?= $item['value'] ?></a>
                        <?php else: ?>
                            <p><?= $item['value'] ?></p>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Contact Form -->
        <div class="contact-form-section">
            <div class="contact-map">
                <iframe
                    title="Dream GO Studio Location"
                    src="https://maps.google.com/maps?q=Thalagaha+Junction,Akmeemana,Galle&output=embed"
                    width="100%"
                    height="280"
                    style="border: 0; border-radius: 16px;"
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>

            <form class="contact-form" id="contactForm" onsubmit="handleContactSubmit(event)">
                <h2>Send Us a Message</h2>
                <div id="successMessage" class="success-message" style="display: none;">
                    ✅ Message sent successfully! We'll get back to you soon.
                </div>
                <?php 
                $userEmail = '';
                if (isset($_SESSION['user'])) {
                    $userEmail = $_SESSION['user']['email'] ?? '';
                    if (empty($userEmail)) {
                        $db = \Core\Database::getConnection();
                        $stmt = $db->prepare("SELECT p.email FROM user_accounts a JOIN user_profiles p ON a.profile_id = p.id WHERE a.id = ?");
                        $stmt->execute([$_SESSION['user']['id']]);
                        $userEmail = $stmt->fetchColumn() ?: '';
                        $_SESSION['user']['email'] = $userEmail; // Update session for future use
                    }
                }
                ?>
                <div class="form-row">
                    <div class="form-group">
                        <label>Your Name</label>
                        <input type="text" name="name" id="contactName" placeholder="John Doe" value="<?= isset($_SESSION['user']) ? htmlspecialchars($_SESSION['user']['full_name']) : '' ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" id="contactEmail" placeholder="you@example.com" value="<?= htmlspecialchars($userEmail) ?>" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Phone (Optional)</label>
                        <input type="tel" name="phone" id="contactPhone" placeholder="07X XXX XXXX" value="<?= isset($_SESSION['user']) ? htmlspecialchars($_SESSION['user']['mobile']) : '' ?>">
                    </div>
                    <div class="form-group">
                        <label>Subject</label>
                        <input type="text" name="subject" id="contactSubject" placeholder="Wedding Photography Inquiry" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Message</label>
                    <textarea name="message" id="contactMessage" rows="5" placeholder="Tell us about your event or inquiry..." required></textarea>
                </div>
                <button type="submit" class="btn-submit" id="submitBtn">
                    Send Message ✉️
                </button>
            </form>
        </div>
    </div>
</div>

<script>
async function handleContactSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('successMessage');
    
    btn.disabled = true;
    btn.innerHTML = 'Sending...';
    
    const payload = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
        status: 'Unread'
    };

    try {
        const response = await fetch('<?= BASE_URL ?>/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if(response.ok) {
            successMsg.style.display = 'block';
            document.getElementById('contactForm').reset();
            ModalSystem.alert('Message sent successfully!', 'success');
            setTimeout(() => successMsg.style.display = 'none', 5000);
        } else {
            ModalSystem.alert('Failed to send message.', 'error');
        }
    } catch(err) {
        console.error(err);
        ModalSystem.alert('Failed to send message. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Send Message ✉️';
    }
}
</script>

<?php include __DIR__ . '/layout/footer.php'; ?>
