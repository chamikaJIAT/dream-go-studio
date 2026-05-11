<?php
namespace Controllers;

use Core\Database;
use PDO;

class HomeController {
    public function index() {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM package_categories");
        $categories = $stmt->fetchAll();

        // Fetch all packages for the dynamic service selection
        $stmt = $db->query("SELECT p.*, c.category_name FROM packages p JOIN package_categories c ON p.category_id = c.id");
        $allPackages = $stmt->fetchAll();

        // Fetch carousel images
        $stmt = $db->query("SELECT * FROM carousel_images ORDER BY created_at DESC");
        $carouselImages = $stmt->fetchAll();

        // Load carousel settings
        $settingsFile = __DIR__ . '/../../config/carousel_settings.json';
        $carouselSettings = file_exists($settingsFile) ? json_decode(file_get_contents($settingsFile), true) : ['speed' => 5000, 'effect' => 'fade'];

        require __DIR__ . '/../Views/home.php';
    }

    public function getChatbotFaqs() {
        $db = \Core\Database::getConnection();
        $stmt = $db->query("SELECT question, answer FROM chatbot_faqs ORDER BY id ASC");
        $faqs = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        header('Content-Type: application/json');
        echo json_encode($faqs);
        exit;
    }
}
