<?php
namespace Controllers;

use Models\Booking;

class ClientBookingController {
    public function track() {
        $bookings = [];
        $messages = [];
        $searched = false;

        $db = \Core\Database::getConnection();

        // 1. If logged in, show their bookings and messages
        if (isset($_SESSION['user'])) {
            $userId = $_SESSION['user']['id'];
            $bookings = Booking::getUserBookings($userId);
            
            $stmt = $db->prepare("SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$userId]);
            $messages = $stmt->fetchAll();
            $searched = true;
        } 
        // 2. If mobile number is provided, search for bookings and messages
        else if (!empty($_REQUEST['mobile'])) {
            $mobile = $_REQUEST['mobile'];
            $bookings = Booking::findByMobile($mobile);
            
            if (!empty($bookings)) {
                // Fetch messages for any of the guest emails found in the bookings
                $emails = array_unique(array_column($bookings, 'email'));
                if (!empty($emails)) {
                    $placeholders = str_repeat('?,', count($emails) - 1) . '?';
                    $stmt = $db->prepare("SELECT * FROM messages WHERE guest_email IN ($placeholders) ORDER BY created_at DESC");
                    $stmt->execute($emails);
                    $messages = $stmt->fetchAll();
                }
            }
            $searched = true;
        }

        require __DIR__ . '/../Views/track_booking.php';
    }

    public function uploadReceipt() {
        // Receipt upload requires login for security or we can use booking ID + mobile check
        // For now, let's keep it restricted or add a check
        $bookingId = $_POST['booking_id'] ?? null;
        $amount = $_POST['amount'] ?? 0;

        if ($bookingId && !empty($_FILES['receipt']['name'])) {
            $uploadDir = __DIR__ . '/../../public/uploads/receipts/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $name = "receipt_" . $bookingId . "_" . time() . "_" . basename($_FILES['receipt']['name']);
            if (move_uploaded_file($_FILES['receipt']['tmp_name'], $uploadDir . $name)) {
                $url = "/uploads/receipts/" . $name;
                $db = \Core\Database::getConnection();
                $stmt = $db->prepare("UPDATE bookings SET payment_receipt_url = ?, receipt_amount = ?, payment_status = 'Pending Verification' WHERE id = ?");
                $stmt->execute([$url, $amount, $bookingId]);
            }
        }
        header("Location: " . BASE_URL . "/my-bookings");
        exit;
    }
}
