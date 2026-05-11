<?php
namespace Models;

use Core\Database;

class ActivityLog {
    public static function log($action, $targetType = null, $targetId = null, $details = null, $targetName = null) {
        $db = Database::getConnection();
        
        $userId = $_SESSION['user']['id'] ?? null;
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;

        // Automatically fetch target name based on type if not provided
        if ($targetId && !$targetName) {
            if ($targetType === 'User') {
                $stmt = $db->prepare("SELECT username FROM user_accounts WHERE id = ?");
                $stmt->execute([$targetId]);
                $res = $stmt->fetch();
                $targetName = $res['username'] ?? null;
            } elseif ($targetType === 'Package') {
                $stmt = $db->prepare("SELECT title FROM packages WHERE id = ?");
                $stmt->execute([$targetId]);
                $res = $stmt->fetch();
                $targetName = $res['title'] ?? null;
            } elseif ($targetType === 'Booking') {
                $stmt = $db->prepare("SELECT u.full_name FROM bookings b JOIN user_profiles u ON b.customer_id = u.id WHERE b.id = ?");
                $stmt->execute([$targetId]);
                $res = $stmt->fetch();
                $targetName = $res['full_name'] ?? null;
            } elseif ($targetType === 'Gallery Category') {
                $stmt = $db->prepare("SELECT name FROM gallery_categories WHERE id = ?");
                $stmt->execute([$targetId]);
                $res = $stmt->fetch();
                $targetName = $res['name'] ?? null;
            } elseif ($targetType === 'Gallery Event') {
                $stmt = $db->prepare("SELECT title FROM gallery_events WHERE id = ?");
                $stmt->execute([$targetId]);
                $res = $stmt->fetch();
                $targetName = $res['title'] ?? null;
            }
        }
        
        $stmt = $db->prepare("INSERT INTO activity_logs (user_id, action, target_type, target_id, target_name, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        return $stmt->execute([
            $userId,
            $action,
            $targetType,
            $targetId,
            $targetName,
            $details,
            $ipAddress,
            date('Y-m-d H:i:s')
        ]);
    }
}
