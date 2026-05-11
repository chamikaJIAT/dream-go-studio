/**
 * Custom Notification & Modal System
 * Replaces default window.alert and window.confirm
 */

window.ModalSystem = {
    init() {
        if (document.getElementById('customModalOverlay')) return;

        const modalHtml = `
            <div id="customModalOverlay" class="custom-modal-overlay">
                <div class="custom-modal">
                    <div id="modalIcon" class="modal-icon"></div>
                    <h3 id="modalTitle" class="modal-title"></h3>
                    <p id="modalMessage" class="modal-message"></p>
                    <div id="modalActions" class="modal-actions">
                        <button id="modalCancelBtn" class="modal-btn btn-cancel">Cancel</button>
                        <button id="modalConfirmBtn" class="modal-btn btn-confirm">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        this.overlay = document.getElementById('customModalOverlay');
        this.icon = document.getElementById('modalIcon');
        this.title = document.getElementById('modalTitle');
        this.message = document.getElementById('modalMessage');
        this.cancelBtn = document.getElementById('modalCancelBtn');
        this.confirmBtn = document.getElementById('modalConfirmBtn');
        this.actions = document.getElementById('modalActions');

        // Global Form Interceptor for 'confirm'
        this.initFormInterceptor();
    },

    show(options) {
        this.init();
        const { title, message, type, showCancel, confirmText, cancelText } = options;

        return new Promise((resolve) => {
            this.title.innerText = title || 'Notification';
            this.message.innerText = message || '';
            this.confirmBtn.innerText = confirmText || 'OK';
            this.cancelBtn.innerText = cancelText || 'Cancel';
            
            // Set Icon & Type
            let icon = '🔔';
            this.overlay.className = 'custom-modal-overlay active';
            
            if (type === 'success') icon = '✅';
            if (type === 'error') icon = '❌';
            if (type === 'info') icon = 'ℹ️';
            if (type === 'confirm') icon = '❓';
            
            this.icon.innerText = icon;
            this.overlay.classList.add('modal-' + (type || 'info'));

            this.cancelBtn.style.display = showCancel ? 'block' : 'none';

            const handleAction = (result) => {
                this.overlay.classList.remove('active');
                // Remove all type classes
                this.overlay.classList.remove('modal-success', 'modal-error', 'modal-info', 'modal-confirm');
                
                // Cleanup listeners to prevent memory leaks
                this.confirmBtn.onclick = null;
                this.cancelBtn.onclick = null;
                
                setTimeout(() => resolve(result), 300);
            };

            this.confirmBtn.onclick = () => handleAction(true);
            this.cancelBtn.onclick = () => handleAction(false);
        });
    },

    alert(message, type = 'info') {
        return this.show({
            title: type.charAt(0).toUpperCase() + type.slice(1),
            message: message,
            type: type,
            showCancel: false,
            confirmText: 'Got it'
        });
    },

    confirm(message) {
        return this.show({
            title: 'Confirmation Required',
            message: message,
            type: 'confirm',
            showCancel: true,
            confirmText: 'Yes, Proceed',
            cancelText: 'No, Cancel'
        });
    },

    initFormInterceptor() {
        // Function to process elements and move inline confirm to data attribute
        const processElements = (root = document) => {
            // Process onsubmit
            root.querySelectorAll('form[onsubmit*="confirm"]').forEach(form => {
                const onsubmit = form.getAttribute('onsubmit');
                const match = onsubmit.match(/confirm\s*\(\s*['"](.+?)['"]\s*\)/i);
                if (match) {
                    form.dataset.confirmMessage = match[1];
                    form.removeAttribute('onsubmit');
                    form.onsubmit = null; // Explicitly clear the property
                }
            });

            // Process onclick
            root.querySelectorAll('[onclick*="confirm"]').forEach(el => {
                const onclick = el.getAttribute('onclick');
                const match = onclick.match(/confirm\s*\(\s*['"](.+?)['"]\s*\)/i);
                if (match) {
                    el.dataset.confirmMessage = match[1];
                    el.removeAttribute('onclick');
                    el.onclick = null; // Explicitly clear the property
                }
            });
        };

        // Run initially
        processElements();

        // Handle dynamic content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) processElements(node);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Global Click Listener
        document.addEventListener('click', async (e) => {
            const target = e.target.closest('[data-confirm-message]');
            if (!target) return;

            // If it's a form, let the 'submit' listener handle it
            if (target.tagName === 'FORM') return;
            
            // If it's a button inside a form with confirm message, let 'submit' handle it
            if (target.tagName === 'BUTTON' && target.type === 'submit' && target.form && target.form.dataset.confirmMessage) return;

            if (!target.dataset.confirmed) {
                e.preventDefault();
                e.stopImmediatePropagation();
                
                const confirmed = await this.confirm(target.dataset.confirmMessage);
                if (confirmed) {
                    target.dataset.confirmed = "true";
                    target.click(); // Re-trigger click
                    delete target.dataset.confirmed;
                }
            }
        }, true);

        // Global Submit Listener
        document.addEventListener('submit', async (e) => {
            const form = e.target;
            if (form.dataset.confirmMessage && !form.dataset.confirmed) {
                e.preventDefault();
                
                const confirmed = await this.confirm(form.dataset.confirmMessage);
                if (confirmed) {
                    console.log("Submitting form:", form.action);
                    form.dataset.confirmed = "true";
                    form.submit();
                }
            }
        }, true);
    }
};

// Override Global Functions
window.alert = (msg) => ModalSystem.alert(msg);
window.confirm = (msg) => {
    console.warn("Blocking confirm() is not supported with custom modals. Use ModalSystem.confirm() instead.");
    return ModalSystem.confirm(msg);
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => ModalSystem.init());
