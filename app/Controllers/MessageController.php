<?php
namespace Controllers;

use Core\Database;
use Models\ActivityLog;

class MessageController {
    public function store() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $db = Database::getConnection();
            
            // Check if content-type is application/json
            $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
            if (strpos($contentType, "application/json") !== false) {
                $input = json_decode(file_get_contents("php://input"), true);
                $guestName = $input['name'] ?? null;
                $guestEmail = $input['email'] ?? null;
                $guestPhone = $input['phone'] ?? null;
                $subject = $input['subject'] ?? 'New Inquiry';
                $message = $input['message'] ?? '';
            } else {
                $guestName = $_POST['name'] ?? null;
                $guestEmail = $_POST['email'] ?? null;
                $guestPhone = $_POST['phone'] ?? null;
                $subject = $_POST['subject'] ?? 'New Inquiry';
                $message = $_POST['message'] ?? '';
            }

            $userId = $_SESSION['user']['id'] ?? null;

            $stmt = $db->prepare("INSERT INTO messages (user_id, guest_name, guest_email, guest_phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)");
            $result = $stmt->execute([$userId, $guestName, $guestEmail, $guestPhone, $subject, $message]);

            if ($result) {
                ActivityLog::log("Sent Contact Message", "Message", $db->lastInsertId());
                
                if (strpos($contentType, "application/json") !== false) {
                    header('Content-Type: application/json');
                    echo json_encode(['status' => 'success', 'message' => 'Message sent successfully!']);
                    exit;
                }
                
                $_SESSION['flash_message'] = 'Message sent successfully!';
                $_SESSION['flash_type'] = 'success';
                header("Location: " . ($_SERVER['HTTP_REFERER'] ?? BASE_URL . "/"));
                exit;
            } else {
                if (strpos($contentType, "application/json") !== false) {
                    header('Content-Type: application/json');
                    http_response_code(500);
                    echo json_encode(['status' => 'error', 'message' => 'Failed to send message.']);
                    exit;
                }
                $_SESSION['flash_message'] = 'Failed to send message.';
                $_SESSION['flash_type'] = 'error';
                header("Location: " . ($_SERVER['HTTP_REFERER'] ?? BASE_URL . "/"));
                exit;
            }


        }
    }
}
