<?php 
$pageTitle = 'Chatbot Management';
$activePage = 'chatbot';
include __DIR__ . '/layout_header.php'; 
?>

<div class="admin-page-container">
    <div class="page-header">
        <h2>Chatbot Management</h2>
        <p>Manage frequently asked questions and automated answers.</p>
    </div>

    <!-- Add/Edit FAQ Form -->
    <div class="view-section" style="margin-bottom: 2rem; padding: 2rem; background: rgba(30, 41, 59, 0.4); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05);">
        <h3 style="margin-top: 0;">➕ Add New FAQ</h3>
        <form action="<?= BASE_URL ?>/admin/chatbot/save" method="POST" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <input type="hidden" name="id" id="faq_id">
            <div class="input-group">
                <label style="display: block; margin-bottom: 0.5rem; color: #94a3b8;">Question</label>
                <input type="text" name="question" id="faq_question" placeholder="e.g. What are your opening hours?" required style="width: 100%; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.8rem; border-radius: 10px;">
            </div>
            <div class="input-group">
                <label style="display: block; margin-bottom: 0.5rem; color: #94a3b8;">Answer</label>
                <textarea name="answer" id="faq_answer" rows="4" placeholder="Enter the automated response..." required style="width: 100%; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.8rem; border-radius: 10px; resize: vertical;"></textarea>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button type="submit" class="btn-primary" style="padding: 0.8rem 2rem;">Save FAQ</button>
                <button type="button" onclick="resetFaqForm()" class="btn-secondary" style="padding: 0.8rem 2rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 10px;">Reset</button>
            </div>
        </form>
    </div>

    <!-- FAQs Table -->
    <div class="view-section" style="padding: 2rem; background: rgba(30, 41, 59, 0.4); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05);">
        <h3>Existing FAQs</h3>
        <div class="admin-table-wrapper" style="overflow-x: auto;">
            <table class="admin-table" style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
                <thead>
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); text-align: left;">
                        <th style="padding: 1rem;">Question</th>
                        <th style="padding: 1rem;">Answer</th>
                        <th style="padding: 1rem; width: 120px;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($faqs as $faq): ?>
                        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                            <td style="padding: 1rem; color: #f8fafc;"><?= htmlspecialchars($faq['question']) ?></td>
                            <td style="padding: 1rem; color: #94a3b8; font-size: 0.9rem;"><?= nl2br(htmlspecialchars($faq['answer'])) ?></td>
                            <td style="padding: 1rem; display: flex; gap: 0.5rem;">
                                <button onclick='editFaq(<?= json_encode($faq) ?>)' class="icon-btn edit" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: none; padding: 0.5rem; border-radius: 5px; cursor: pointer;">✏️</button>
                                <form action="<?= BASE_URL ?>/admin/chatbot/delete" method="POST" data-confirm-message="Delete this FAQ?">
                                    <input type="hidden" name="id" value="<?= $faq['id'] ?>">
                                    <button type="submit" class="icon-btn delete" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; padding: 0.5rem; border-radius: 5px; cursor: pointer;">🗑️</button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    <?php if (empty($faqs)): ?>
                        <tr><td colspan="3" style="padding: 2rem; text-align: center; color: #64748b;">No FAQs created yet.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
function editFaq(faq) {
    document.getElementById('faq_id').value = faq.id;
    document.getElementById('faq_question').value = faq.question;
    document.getElementById('faq_answer').value = faq.answer;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFaqForm() {
    document.getElementById('faq_id').value = '';
    document.getElementById('faq_question').value = '';
    document.getElementById('faq_answer').value = '';
}
</script>

<?php include __DIR__ . '/layout_footer.php'; ?>
