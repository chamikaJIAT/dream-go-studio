<?php
namespace Models;

use Core\Database;
use PDO;

class Booking {
    public static function create($data) {
        $db = Database::getConnection();
        $db->beginTransaction();
        try {
            $stmt = $db->prepare("INSERT INTO bookings (customer_id, status_id, booking_date, hotel_name, couple_name, latitude, longitude, total_amount, event_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['customer_id'],
                1, // Default to Pending
                $data['booking_date'],
                $data['hotel_name'] ?? null,
                $data['couple_name'] ?? null,
                $data['latitude'] ?? null,
                $data['longitude'] ?? null,
                $data['total_amount'] ?? 0,
                json_encode($data['event_details'] ?? [])
            ]);
            $bookingId = $db->lastInsertId();

            if (!empty($data['package_ids'])) {
                $stmtItem = $db->prepare("INSERT INTO booking_items (booking_id, package_id, unit_price) VALUES (?, ?, ?)");
                foreach ($data['package_ids'] as $pkgId) {
                    // Fetch current price
                    $pkgStmt = $db->prepare("SELECT price FROM packages WHERE id = ?");
                    $pkgStmt->execute([$pkgId]);
                    $price = $pkgStmt->fetchColumn();
                    $stmtItem->execute([$bookingId, $pkgId, $price]);
                }
            }

            $db->commit();
            return $bookingId;
        } catch (\Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public static function getUserBookings($userId) {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT b.*, s.status_label, 
            GROUP_CONCAT(p.title SEPARATOR ', ') as package_titles 
            FROM bookings b 
            JOIN booking_statuses s ON b.status_id = s.id 
            LEFT JOIN booking_items bi ON b.id = bi.booking_id
            LEFT JOIN packages p ON bi.package_id = p.id
            WHERE b.customer_id = ? 
            GROUP BY b.id
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function getAll() {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT b.*, u.full_name as customer_name, u.mobile, s.status_label,
            GROUP_CONCAT(p.title SEPARATOR ', ') as package_titles 
            FROM bookings b 
            JOIN user_profiles u ON b.customer_id = u.id 
            JOIN booking_statuses s ON b.status_id = s.id 
            LEFT JOIN booking_items bi ON b.id = bi.booking_id
            LEFT JOIN packages p ON bi.package_id = p.id
            GROUP BY b.id
            ORDER BY b.created_at DESC
        ");
        return $stmt->fetchAll();
    }

    public static function getDetails($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT b.*, u.full_name as customer_name, u.email, u.mobile, s.status_label FROM bookings b JOIN user_profiles u ON b.customer_id = u.id JOIN booking_statuses s ON b.status_id = s.id WHERE b.id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();
        
        if ($booking) {
            $stmtItems = $db->prepare("SELECT bi.*, p.title FROM booking_items bi JOIN packages p ON bi.package_id = p.id WHERE bi.booking_id = ?");
            $stmtItems->execute([$id]);
            $booking['items'] = $stmtItems->fetchAll();
        }
        
        return $booking;
    }

    public static function updateStatus($id, $statusId) {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE bookings SET status_id = ? WHERE id = ?");
        return $stmt->execute([$statusId, $id]);
    }
    
    public static function findByMobile($mobile) {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT b.*, s.status_label, u.full_name as customer_name,
            GROUP_CONCAT(p.title SEPARATOR ', ') as package_titles 
            FROM bookings b 
            JOIN user_profiles u ON b.customer_id = u.id 
            JOIN booking_statuses s ON b.status_id = s.id 
            LEFT JOIN booking_items bi ON b.id = bi.booking_id
            LEFT JOIN packages p ON bi.package_id = p.id
            WHERE u.mobile = ? 
            GROUP BY b.id
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$mobile]);
        return $stmt->fetchAll();
    }
}
