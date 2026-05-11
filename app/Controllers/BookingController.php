<?php
namespace Controllers;

use Models\Booking;
use Models\ActivityLog;
use Models\Package;

class BookingController {
    public function submit() {
        if (!isset($_SESSION['user'])) {
            header("Location: " . BASE_URL . "/login");
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $customerId = $_SESSION['user']['id'];
            $bookingDate = $_POST['eventDate'] ?? null;
            $hotelName = $_POST['hotelName'] ?? null;
            $latitude = !empty($_POST['latitude']) ? $_POST['latitude'] : null;
            $longitude = !empty($_POST['longitude']) ? $_POST['longitude'] : null;
            $packageIds = $_POST['packageIds'] ?? [];
            
            // Collect dynamic details into a single array for JSON storage
            $eventDetails = [
                'category' => $_POST['selectedCategory'] ?? '',
                'coupleName' => $_POST['coupleName'] ?? null,
                'birthdayPersonName' => $_POST['birthdayPersonName'] ?? null,
                'specialRequests' => $_POST['specialRequests'] ?? null
            ];

            // Calculate total amount
            $totalAmount = 0;
            foreach ($packageIds as $pkgId) {
                $pkg = Package::findById($pkgId);
                if ($pkg) {
                    $totalAmount += (float)$pkg['price'];
                }
            }

            try {
                $bookingId = Booking::create([
                    'customer_id' => $customerId,
                    'booking_date' => $bookingDate,
                    'hotel_name' => $hotelName,
                    'couple_name' => $_POST['coupleName'] ?? null,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'total_amount' => $totalAmount,
                    'package_ids' => $packageIds,
                    'event_details' => $eventDetails
                ]);

                ActivityLog::log("Placed New Booking", "Booking", $bookingId);

                $_SESSION['flash_message'] = 'Booking submitted successfully! Our team will contact you shortly.';
                $_SESSION['flash_type'] = 'success';
                header("Location: " . BASE_URL . "/");
                exit;
            } catch (\Exception $e) {
                $_SESSION['flash_message'] = 'Error submitting booking: ' . $e->getMessage();
                $_SESSION['flash_type'] = 'error';
                header("Location: " . ($_SERVER['HTTP_REFERER'] ?? BASE_URL . "/"));
                exit;
            }


        }
    }
}
