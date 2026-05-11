<?php
namespace Controllers;

use Core\Database;

class PageController {
    public function about() {
        require __DIR__ . '/../Views/about.php';
    }

    public function contact() {
        require __DIR__ . '/../Views/contact.php';
    }

    public function gallery() {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM gallery_categories ORDER BY id DESC");
        $categories = $stmt->fetchAll();
        require __DIR__ . '/../Views/gallery.php';
    }

    public function galleryCategory($categoryId) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM gallery_categories WHERE id = ?");
        $stmt->execute([$categoryId]);
        $category = $stmt->fetch();

        $stmt = $db->prepare("SELECT * FROM gallery_events WHERE category_id = ? ORDER BY id DESC");
        $stmt->execute([$categoryId]);
        $events = $stmt->fetchAll();

        require __DIR__ . '/../Views/gallery_category.php';
    }

    public function galleryEvent($categoryId, $eventId) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM gallery_events WHERE id = ?");
        $stmt->execute([$eventId]);
        $event = $stmt->fetch();

        $stmt = $db->prepare("SELECT * FROM gallery_images WHERE event_id = ? ORDER BY uploaded_at DESC");
        $stmt->execute([$eventId]);
        $images = $stmt->fetchAll();

        require __DIR__ . '/../Views/gallery_event.php';
    }
}
