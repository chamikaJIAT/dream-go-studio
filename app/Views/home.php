<?php $pageTitle = 'Booking - Dream Go Studio'; ?>
<?php $activePage = 'home'; ?>
<?php include __DIR__ . '/layout/header.php'; ?>

        <div class="booking-wrapper">
            <!-- Left Side: Form Area -->
            <div class="booking-form-section">
                <div class="booking-header">
                    <h2>Book Your <span class="h2-accent">Dream Event</span></h2>
                    <p>Secure your date and customize your photography experience today.</p>
                </div>

                <?php if (!isset($_SESSION['user'])): ?>
                    <div style="background: rgba(30, 41, 59, 0.7); text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 3rem; margin-top: 2rem;">
                        <h3 style="color: white; margin-bottom: 1rem; font-size: 1.5rem;">Join Dream Go Studio</h3>
                        <p style="color: #94a3b8; margin-bottom: 2rem;">You need to log in or create an account to secure your booking date.</p>
                        <div style="display: flex; gap: 1rem; justify-content: center;">
                            <a href="<?= BASE_URL ?>/login" style="padding: 1rem 2rem; background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border-radius: 12px; text-decoration: none; font-weight: 600;">Sign In</a>
                            <a href="<?= BASE_URL ?>/register" style="padding: 1rem 2rem; background: rgba(255, 255, 255, 0.1); color: white; border-radius: 12px; text-decoration: none; font-weight: 600; border: 1px solid rgba(255,255,255,0.2);">Create Account</a>
                        </div>
                    </div>
                <?php else: ?>
                <form class="booking-form" action="<?= BASE_URL ?>/booking/submit" method="POST">
                    <div class="input-group">
                        <label>Customer Name</label>
                        <input type="text" name="customerName" value="<?= htmlspecialchars($_SESSION['user']['full_name']) ?>" required readonly>
                    </div>

                    <div class="input-group">
                        <label>Mobile Number</label>
                        <input type="tel" name="mobile" value="<?= htmlspecialchars($_SESSION['user']['mobile'] ?? '') ?>" placeholder="07x xxxxxxx" required readonly>
                    </div>

                    <div class="input-group">
                        <label>Event Date</label>
                        <input type="date" name="eventDate" required>
                    </div>

                    <div class="input-group">
                        <label>Select Event Category</label>
                        <select name="selectedCategory" id="categorySelect" class="package-dropdown" required onchange="handleCategoryChange()">
                            <option value="" disabled selected>Select event type...</option>
                            <?php foreach ($categories as $cat): ?>
                                <option value="<?= htmlspecialchars($cat['category_name']) ?>"><?= htmlspecialchars($cat['category_name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <!-- Dynamic Couple Name Field -->
                    <div id="coupleNameGroup" class="input-group slide-in" style="display: none;">
                        <label>Couple Name</label>
                        <input type="text" name="coupleName" placeholder="Enter Couple Name">
                    </div>

                    <!-- Dynamic Birthday Name Field -->
                    <div id="birthdayNameGroup" class="input-group slide-in" style="display: none;">
                        <label>Birthday Person's Name</label>
                        <input type="text" name="birthdayPersonName" placeholder="Birthday eka thiyena kenage name eka add karanna">
                    </div>

                    <!-- Package Selection -->
                    <div id="servicesSection" class="input-group" style="display: none;">
                        <label>Select Services (You can choose multiple)</label>
                        <div id="servicesGrid" class="services-checkbox-grid">
                            <!-- Populated via JS -->
                        </div>
                    </div>

                    <!-- Hotel/Venue Name -->
                    <div class="input-group">
                        <label>Hotel / Venue Name</label>
                        <input type="text" name="hotelName" placeholder="Eg: Shangri-La Colombo (Optional)">
                    </div>

                    <!-- Map (Simplified for now) -->
                    <div class="input-group">
                        <label>Event Location (Drop pin on map)</label>
                        <div id="map" style="height: 250px; border-radius: 12px;"></div>
                        <input type="hidden" name="latitude" id="lat">
                        <input type="hidden" name="longitude" id="lng">
                    </div>

                    <button type="submit" class="submit-button">Confirm Booking</button>
                </form>
                <?php endif; ?>
            </div>

            <!-- Right Side: Image Carousel -->
            <div class="booking-image-section effect-<?= $carouselSettings['effect'] ?? 'fade' ?>">
                <?php if (!empty($carouselImages)): ?>
                    <?php foreach ($carouselImages as $index => $img): ?>
                        <div class="carousel-slide <?= $index === 0 ? 'active' : '' ?>" style="background-image: url('<?= BASE_URL . htmlspecialchars($img['url']) ?>')"></div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="carousel-slide active" style="background-image: url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80')"></div>
                    <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1460364154652-f87c94b407e3?auto=format&fit=crop&q=80')"></div>
                    <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1541913080-214307f3535d?auto=format&fit=crop&q=80')"></div>
                <?php endif; ?>
                
                <div class="carousel-overlay"></div>
                <div class="image-overlay-content">
                    <h1>DREAM GO STUDIO</h1>
                    <p class="tagline">Where moments become eternal memories</p>
                </div>
            </div>
        </div>

    <!-- Carousel Effect Styles -->
    <style>
        .booking-wrapper {
            min-height: 100vh;
        }
        
        .booking-image-section {
            position: relative;
            overflow: hidden;
            background: #0f172a; /* Fallback background */
        }

        /* Transition Effects */
        .effect-fade .carousel-slide {
            transition: opacity 1.2s ease-in-out;
            opacity: 0;
        }
        .effect-fade .carousel-slide.active {
            opacity: 1;
        }

        /* Zoom Effect */
        .effect-zoom .carousel-slide {
            transition: transform 2s ease-in-out, opacity 1.2s ease-in-out;
            transform: scale(1.15);
            opacity: 0;
        }
        .effect-zoom .carousel-slide.active {
            transform: scale(1);
            opacity: 1;
        }

        /* Slide Effect */
        .effect-slide .carousel-slide {
            transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out;
            transform: translateX(100%);
            opacity: 1;
        }
        .effect-slide .carousel-slide.active {
            transform: translateX(0);
            z-index: 2;
        }
        .effect-slide .carousel-slide.prev {
            transform: translateX(-100%);
            z-index: 1;
        }

        /* Blur Fade Effect */
        .effect-blur .carousel-slide {
            transition: opacity 1.2s ease-in-out, filter 1.2s ease-in-out;
            opacity: 0;
            filter: blur(20px);
        }
        .effect-blur .carousel-slide.active {
            opacity: 1;
            filter: blur(0);
        }

        /* Flip 3D Effect */
        .booking-image-section.effect-flip {
            perspective: 1000px;
        }
        .effect-flip .carousel-slide {
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-in-out;
            transform: rotateY(-90deg);
            opacity: 0;
            backface-visibility: hidden;
        }
        .effect-flip .carousel-slide.active {
            transform: rotateY(0deg);
            opacity: 1;
        }

        /* 3D Shuffle Effect */
        .booking-image-section.effect-shuffle {
            perspective: 1200px;
        }
        .effect-shuffle .carousel-slide {
            transition: transform 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.8s;
            transform: translateZ(-400px) rotateY(45deg) translateX(30%);
            opacity: 0;
        }
        .effect-shuffle .carousel-slide.active {
            transform: translateZ(0) rotateY(0deg) translateX(0);
            opacity: 1;
            z-index: 2;
        }
        .effect-shuffle .carousel-slide.prev {
            transform: translateZ(-400px) rotateY(-45deg) translateX(-30%);
            opacity: 0;
            z-index: 1;
        }

        /* Wipe Horizontal Effect */
        .effect-wipe .carousel-slide {
            transition: clip-path 1s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.2s;
            clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
            opacity: 0;
        }
        .effect-wipe .carousel-slide.active {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
            opacity: 1;
            z-index: 2;
        }

        /* Curtain (Wipe Vertical) Effect */
        .effect-curtain .carousel-slide {
            transition: clip-path 1.2s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.2s;
            clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
            opacity: 0;
        }
        .effect-curtain .carousel-slide.active {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            opacity: 1;
            z-index: 2;
        }

        /* Spin Fade Effect */
        .effect-spin .carousel-slide {
            transition: transform 1s ease-in-out, opacity 1s ease-in-out;
            transform: rotate(-180deg) scale(0.5);
            opacity: 0;
        }
        .effect-spin .carousel-slide.active {
            transform: rotate(0deg) scale(1);
            opacity: 1;
        }

        /* Vertical Slide Effect */
        .effect-vert-slide .carousel-slide {
            transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out;
            transform: translateY(100%);
            opacity: 1;
        }
        .effect-vert-slide .carousel-slide.active {
            transform: translateY(0);
            z-index: 2;
        }
        .effect-vert-slide .carousel-slide.prev {
            transform: translateY(-100%);
            z-index: 1;
        }

        /* Ken Burns Effect */
        @keyframes kenburns {
            from { transform: scale(1) translate(0, 0); }
            to { transform: scale(1.15) translate(-2%, -2%); }
        }
        .effect-kenburns .carousel-slide {
            transition: opacity 1.5s ease-in-out;
            opacity: 0;
        }
        .effect-kenburns .carousel-slide.active {
            opacity: 1;
            animation: kenburns 8s linear infinite alternate;
        }

        @media (max-width: 768px) {
            .booking-image-section {
                height: 500px !important; /* Larger height on mobile */
            }
        }

        /* Complex Grid Effects */
        .complex-effect-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(8, 1fr);
            z-index: 5;
            pointer-events: none;
        }

        .mosaic-tile {
            background-size: 800% 800%; /* Based on 8x8 grid */
            background-repeat: no-repeat;
            opacity: 0;
            transform: scale(0) rotate(-15deg);
            transition: all 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 0.5px solid rgba(255,255,255,0.05);
        }
        .mosaic-tile.visible {
            opacity: 1;
            transform: scale(1) rotate(0);
        }

        .shatter-tile {
            background-size: 800% 800%;
            background-repeat: no-repeat;
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) rotate(var(--tr)) scale(0);
            transition: all 0.9s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .shatter-tile.visible {
            opacity: 1;
            transform: translate(0, 0) rotate(0) scale(1.01);
        }
    </style>

    <!-- Scripts for original behavior -->

    <script>
        const allPackages = <?= json_encode($allPackages) ?>;

        // Carousel Logic
        let currentSlide = 0;
        const slides = document.querySelectorAll('.carousel-slide');
        const speed = <?= $carouselSettings['speed'] ?? 5000 ?>;
        const effect = '<?= $carouselSettings['effect'] ?? 'fade' ?>';

        setInterval(() => {
            const nextSlideIndex = (currentSlide + 1) % slides.length;

            if (['mosaic', 'shatter'].includes(effect)) {
                applyComplexEffect(nextSlideIndex, effect);
                currentSlide = nextSlideIndex;
                return;
            }

            const prevSlide = currentSlide;
            slides[currentSlide].classList.remove('active');
            
            const usePrevClass = ['slide', 'vert-slide', 'shuffle'].includes(effect);
            if (usePrevClass) slides[currentSlide].classList.add('prev');
            
            currentSlide = nextSlideIndex;
            
            if (usePrevClass) {
                slides[currentSlide].classList.remove('prev');
            }
            slides[currentSlide].classList.add('active');

            if (usePrevClass) {
                setTimeout(() => {
                    slides[prevSlide].classList.remove('prev');
                }, 1200);
            }
        }, speed);

        function applyComplexEffect(nextIndex, type) {
            const container = document.querySelector('.booking-image-section');
            const nextSlide = slides[nextIndex];
            
            // Extract URL from background-image: url("...")
            const style = nextSlide.style.backgroundImage;
            const bgUrl = style.slice(4, -1).replace(/["']/g, "");
            
            const grid = document.createElement('div');
            grid.className = 'complex-effect-container';
            
            const rows = 8;
            const cols = 8;
            
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const tile = document.createElement('div');
                    tile.className = type === 'mosaic' ? 'mosaic-tile' : 'shatter-tile';
                    tile.style.backgroundImage = `url('${bgUrl}')`;
                    
                    // Precise background positioning for 8x8 grid
                    const posX = (c / (cols - 1)) * 100;
                    const posY = (r / (rows - 1)) * 100;
                    tile.style.backgroundPosition = `${posX}% ${posY}%`;
                    
                    if (type === 'shatter') {
                        tile.style.setProperty('--tx', `${(Math.random() - 0.5) * 300}%`);
                        tile.style.setProperty('--ty', `${(Math.random() - 0.5) * 300}%`);
                        tile.style.setProperty('--tr', `${(Math.random() - 0.5) * 720}deg`);
                    }

                    const delay = type === 'mosaic' ? (r + c) * 40 : Math.random() * 600;
                    tile.style.transitionDelay = `${delay}ms`;
                    
                    grid.appendChild(tile);
                    setTimeout(() => tile.classList.add('visible'), 50);
                }
            }
            
            container.appendChild(grid);
            
            setTimeout(() => {
                slides.forEach(s => s.classList.remove('active'));
                nextSlide.classList.add('active');
                setTimeout(() => {
                    grid.style.transition = 'opacity 0.5s';
                    grid.style.opacity = '0';
                    setTimeout(() => grid.remove(), 500);
                }, 300);
            }, type === 'mosaic' ? 1600 : 2000);
        }

        // Dynamic Form Logic
        function handleCategoryChange() {
            const category = document.getElementById('categorySelect').value;
            const coupleGroup = document.getElementById('coupleNameGroup');
            const birthdayGroup = document.getElementById('birthdayNameGroup');
            const servicesSection = document.getElementById('servicesSection');
            const grid = document.getElementById('servicesGrid');

            // Show/Hide specific fields
            coupleGroup.style.display = (category === 'Weddings' || category === 'Engagement') ? 'block' : 'none';
            birthdayGroup.style.display = (category === 'Birthday') ? 'block' : 'none';

            // Filter and show services
            const filtered = allPackages.filter(p => p.category_name === category);
            grid.innerHTML = '';
            
            if (filtered.length > 0) {
                servicesSection.style.display = 'block';
                filtered.forEach(p => {
                    const card = document.createElement('label');
                    card.className = 'service-checkbox-card';
                    card.innerHTML = `
                        <div class="cb-header">
                            <input type="checkbox" name="packageIds[]" value="${p.id}" onchange="this.parentElement.parentElement.classList.toggle('selected')">
                            <span>${p.title}</span>
                        </div>
                        <div style="padding-left: 2rem;">
                            <div class="service-price-cb">${p.price}</div>
                            <p style="font-size: 0.8rem; color: #94a3b8;">${p.description || ''}</p>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            } else {
                servicesSection.style.display = 'none';
            }
        }

        // Basic Map
        const map = L.map('map').setView([7.8731, 80.7718], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        let marker;
        
        // Add Geocoder search box
        const geocoder = L.Control.geocoder({
            defaultMarkGeocode: false,
            placeholder: 'Search location...'
        })

        .on('markgeocode', function(e) {
            const bbox = e.geocode.bbox;
            const poly = L.polygon([
                bbox.getSouthEast(),
                bbox.getNorthEast(),
                bbox.getNorthWest(),
                bbox.getSouthWest()
            ]);
            map.fitBounds(poly.getBounds());
            
            const latlng = e.geocode.center;
            if (marker) map.removeLayer(marker);
            marker = L.marker(latlng).addTo(map);
            
            document.getElementById('lat').value = latlng.lat;
            document.getElementById('lng').value = latlng.lng;
            
            // Auto-fill the hotelName field with the location name if available
            const hotelInput = document.querySelector('input[name="hotelName"]');
            if (hotelInput && e.geocode.name) {
                hotelInput.value = e.geocode.name;
            }
        })
        .addTo(map);

        map.on('click', function(e) {
            if (marker) map.removeLayer(marker);
            marker = L.marker(e.latlng).addTo(map);
            document.getElementById('lat').value = e.latlng.lat;
            document.getElementById('lng').value = e.latlng.lng;
        });
    </script>
<?php include __DIR__ . '/layout/footer.php'; ?>


