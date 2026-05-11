<?php $pageTitle = 'About Us - Dream Go Studio'; ?>
<?php $activePage = 'about'; ?>
<?php include __DIR__ . '/layout/header.php'; ?>

<div class="about-container" style="margin-top: 20px; margin-right: 20px; margin-left: 20px;">
    <div class="about-header">
        <h1>Dream Go Studio</h1>
        <p>Crafting Memories That Last a Lifetime</p>
    </div>

    <div class="about-content">
        <div class="about-intro">
            <h2>Who We Are</h2>
            <p>
                Welcome to Dream Go Studio, your premier destination for high-end photography and videography services. 
                We believe that every moment, big or small, deserves to be remembered beautifully. With years of experience 
                and a passion for visual storytelling, our professional team is dedicated to providing you with breathtaking visuals 
                and exceptional service from the first click to the final print.
            </p>
        </div>

        <div class="services-section">
            <h2>Our Services</h2>
            <div class="services-grid">
                <?php 
                $services = [
                    ["title" => "Wedding Photography", "icon" => "💍", "desc" => "Capturing the magic of your most special day with timeless, elegant photography that tells your unique love story."],
                    ["title" => "Event Photography", "icon" => "🎉", "desc" => "From corporate gatherings to grand celebrations, we ensure every highlight is beautifully documented."],
                    ["title" => "Birthday Photography", "icon" => "🎂", "desc" => "Preserving the joy and fun of your birthday parties with vibrant, candid, and high-quality shots."],
                    ["title" => "Videography", "icon" => "🎥", "desc" => "Cinematic, high-definition video coverage that brings your memories to life with emotion and clarity."],
                    ["title" => "Album Designing", "icon" => "📖", "desc" => "Custom-crafted, premium photo albums designed to be the perfect keepsake for your treasured moments."],
                    ["title" => "Picture Framing", "icon" => "🖼️", "desc" => "High-quality, elegant frames tailored to protect and showcase your favorite photographs perfectly."],
                    ["title" => "Printing Services", "icon" => "🖨️", "desc" => "Professional grade photo printing with stunning color accuracy and longevity."]
                ];
                foreach ($services as $index => $service): ?>
                    <div class="service-card" style="animation-delay: <?= $index * 0.1 ?>s">
                        <div class="service-icon"><?= $service['icon'] ?></div>
                        <h3><?= $service['title'] ?></h3>
                        <p><?= $service['desc'] ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        
        <div class="about-footer">
            <p>Ready to capture your dream moments?</p>
            <a href="<?= BASE_URL ?>/" class="btn-primary">Book Now</a>
        </div>
    </div>
</div>

<?php include __DIR__ . '/layout/footer.php'; ?>
