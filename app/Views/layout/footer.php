    <!-- Main Footer -->
    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-brand">
                <h3>Dream Go Studio</h3>
                <p>Crafting memories that last a lifetime. Premium photography, videography, and printing services based in Galle, Sri Lanka.</p>
                <div class="footer-socials">
                    <a href="https://www.facebook.com/Dream-GO-100308695540295/" target="_blank" rel="noreferrer" aria-label="Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="https://www.instagram.com/dreamgo_buddhika_sandaruwan_" target="_blank" rel="noreferrer" aria-label="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                    <a href="https://wa.me/94768634775" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    </a>
                </div>
            </div>

            <div class="footer-links-col">
                <h4>Navigation</h4>
                <ul>
                    <li><a href="<?= BASE_URL ?>/">Booking</a></li>
                    <li><a href="<?= BASE_URL ?>/my-bookings">Track My Booking</a></li>
                    <li><a href="<?= BASE_URL ?>/login">Login</a></li>
                    <li><a href="<?= BASE_URL ?>/admin/login">Admin Portal</a></li>
                </ul>
            </div>

            <div class="footer-links-col">
                <h4>Services</h4>
                <ul>
                    <li><span class="service-item">› Wedding Photography</span></li>
                    <li><span class="service-item">› Event Photography</span></li>
                    <li><span class="service-item">› Birthday Photography</span></li>
                    <li><span class="service-item">› Videography</span></li>
                    <li><span class="service-item">› Album Designing</span></li>
                    <li><span class="service-item">› Picture Framing</span></li>
                    <li><span class="service-item">› Printing Services</span></li>
                </ul>
            </div>

            <div class="footer-contact-col">
                <h4>Contact</h4>
                <ul>
                    <li>
                        <span class="fc-icon">📧</span>
                        <a href="mailto:dreamgopictures@gmail.com">dreamgopictures@gmail.com</a>
                    </li>
                    <li>
                        <span class="fc-icon">📞</span>
                        <div class="footer-phones">
                            <a href="tel:+94768634775">076 863 4775</a>
                            <span class="phone-divider">|</span>
                            <a href="tel:+94724980088">072 498 0088</a>
                        </div>
                    </li>
                    <li>
                        <span class="fc-icon">📍</span>
                        <a href="https://maps.google.com/?q=Thalagaha+Junction,+Akmeemana,+Galle,+Sri+Lanka" target="_blank" rel="noreferrer">Thalagaha Junction, Akmeemana, Galle</a>
                    </li>
                    <li>
                        <span class="fc-icon">🕐</span>
                        <span>Mon – Sat: 9 AM – 4:30 PM</span>
                    </li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <p>© <?= date('Y') ?> Dream Go Studio. All rights reserved.</p>
            <p>Developed by <span class="footer-creator">Chamika Wickramage</span></p>
        </div>
    </footer>

    <!-- Scripts for original behavior -->
    <!-- Chatbot Widget -->
    <div id="chatbot-container" style="position: fixed; bottom: 30px; right: 30px; z-index: 9999; font-family: 'Outfit', sans-serif;">
        <!-- Chat Toggle Button -->
        <button id="chatbot-toggle" onclick="toggleChatbot()" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #6366f1); border: none; cursor: pointer; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4); display: flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none;">
            <span id="chat-icon" style="font-size: 24px; color: white;">💬</span>
            <span id="close-icon" style="font-size: 24px; color: white; display: none;">✕</span>
        </button>

        <!-- Chat Window -->
        <div id="chat-window" style="position: absolute; bottom: 80px; right: 0; width: 350px; height: 500px; background: #1e293b; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); display: none; flex-direction: column; overflow: hidden; transform-origin: bottom right; transition: all 0.3s ease;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 1.5rem; color: white;">
                <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Dream Go Helper 🤖</h4>
                <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem; opacity: 0.9;">Ask me anything about our services!</p>
            </div>

            <!-- Chat Content -->
            <div id="chat-messages" style="flex: 1; padding: 1.2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; scroll-behavior: smooth;">
                <div class="bot-msg" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 15px 15px 15px 0; max-width: 85%; align-self: flex-start; color: #f8fafc; font-size: 0.9rem;">
                    Hello! How can I help you today? Please select a question below:
                </div>
                <div id="faq-options" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
                    <!-- FAQ buttons will be injected here -->
                </div>
            </div>

            <!-- Footer -->
            <div style="padding: 1rem; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; font-size: 0.75rem; color: #64748b;">
                Dream Go Studio Automated Assistant
            </div>
        </div>
    </div>

    <!-- Scripts for original behavior -->
    <script>
        // Sidebar Toggle
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('hamburger').classList.toggle('open');
        }

        // Chatbot Logic
        let chatbotInitialized = false;
        let faqs = [];

        async function toggleChatbot() {
            const window = document.getElementById('chat-window');
            const chatIcon = document.getElementById('chat-icon');
            const closeIcon = document.getElementById('close-icon');
            
            if (window.style.display === 'none' || window.style.display === '') {
                window.style.display = 'flex';
                chatIcon.style.display = 'none';
                closeIcon.style.display = 'block';
                
                if (!chatbotInitialized) {
                    await loadFaqs();
                    chatbotInitialized = true;
                }
            } else {
                window.style.display = 'none';
                chatIcon.style.display = 'block';
                closeIcon.style.display = 'none';
            }
        }

        async function loadFaqs() {
            try {
                const response = await fetch('<?= BASE_URL ?>/api/chatbot/faqs');
                faqs = await response.json();
                renderFaqOptions();
            } catch (error) {
                console.error("Failed to load FAQs", error);
            }
        }

        function renderFaqOptions() {
            const container = document.getElementById('faq-options');
            container.innerHTML = '';
            
            if (faqs.length === 0) {
                container.innerHTML = '<p style="color:#64748b; font-size:0.8rem; text-align:center;">No FAQs found.</p>';
                return;
            }

            faqs.forEach((faq, index) => {
                const btn = document.createElement('button');
                btn.innerText = faq.question;
                btn.style.cssText = "background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); padding: 0.7rem 1rem; border-radius: 12px; cursor: pointer; text-align: left; font-size: 0.85rem; transition: all 0.2s; font-family: 'Outfit', sans-serif;";
                btn.onclick = () => selectFaq(faq);
                btn.onmouseover = () => btn.style.background = "rgba(59, 130, 246, 0.2)";
                btn.onmouseout = () => btn.style.background = "rgba(59, 130, 246, 0.1)";
                container.appendChild(btn);
            });
        }

        function selectFaq(faq) {
            const messages = document.getElementById('chat-messages');
            
            // Add user message
            const userDiv = document.createElement('div');
            userDiv.innerText = faq.question;
            userDiv.style.cssText = "background: #3b82f6; color: white; padding: 0.8rem 1rem; border-radius: 15px 15px 0 15px; max-width: 85%; align-self: flex-end; font-size: 0.9rem; margin-top: 0.5rem;";
            messages.appendChild(userDiv);

            // Add bot thinking (delayed)
            setTimeout(() => {
                const botDiv = document.createElement('div');
                botDiv.innerHTML = faq.answer.replace(/\n/g, '<br>');
                botDiv.style.cssText = "background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 15px 15px 15px 0; max-width: 85%; align-self: flex-start; color: #f8fafc; font-size: 0.9rem; margin-top: 0.5rem; animation: slideUp 0.3s ease-out;";
                messages.appendChild(botDiv);
                
                // Add "Back to questions" link
                const backBtn = document.createElement('button');
                backBtn.innerText = "Back to other questions";
                backBtn.style.cssText = "background: transparent; border: none; color: #94a3b8; text-decoration: underline; cursor: pointer; font-size: 0.8rem; align-self: flex-start; margin-top: 0.5rem;";
                backBtn.onclick = () => {
                    backBtn.remove();
                    renderFaqOptions();
                };
                messages.appendChild(backBtn);

                messages.scrollTop = messages.scrollHeight;
            }, 600);

            // Clear options while bot is answering
            document.getElementById('faq-options').innerHTML = '';
            messages.scrollTop = messages.scrollHeight;
        }
    </script>
    <style>
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        #chatbot-toggle:hover { transform: scale(1.1); box-shadow: 0 15px 30px rgba(59, 130, 246, 0.6); }
    </style>
</body>
</html>
