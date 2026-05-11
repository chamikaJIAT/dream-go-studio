<?php
namespace Models;

use Core\Database;
use PDO;

class Package {
    public static function getAll() {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT p.*, c.category_name FROM packages p LEFT JOIN package_categories c ON p.category_id = c.id");
        return $stmt->fetchAll();
    }

    public static function getCategories() {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM package_categories");
        return $stmt->fetchAll();
    }

    public static function findById($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT p.*, c.category_name FROM packages p LEFT JOIN package_categories c ON p.category_id = c.id WHERE p.id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
}
