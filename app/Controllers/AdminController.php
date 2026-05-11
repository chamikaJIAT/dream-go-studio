<?php
namespace Controllers;

use Core\Database;
use Models\ActivityLog;
use Models\Booking;
use Models\User;
use Models\Package;
use PDO;

class AdminController {
    public function dashboard() {
        $db = Database::getConnection();
        
        // 1. Total Bookings
        $stmt = $db->query("SELECT COUNT(*) as count FROM bookings");
        $totalBookings = $stmt->fetch()['count'];
        
        // 2. Pending Approvals (Status ID 1 is Pending)
        $stmt = $db->query("SELECT COUNT(*) as count FROM bookings WHERE status_id = 1");
        $pendingCount = $stmt->fetch()['count'];

        // 3. Gallery Photos
        $stmt = $db->query("SELECT COUNT(*) as count FROM gallery_images");
        $photosCount = $stmt->fetch()['count'];

        // 4. Total Revenue
        $stmt = $db->query("SELECT SUM(total_amount) as total FROM bookings WHERE payment_status = 'Paid'");
        $totalRevenue = $stmt->fetch()['total'] ?? 0;

        // Group statistics for the view
        $stats = [
            ['label' => 'Total Bookings', 'value' => $totalBookings, 'icon' => '📅', 'color' => 'blue'],
            ['label' => 'Pending Approvals', 'value' => $pendingCount, 'icon' => '⏳', 'color' => 'orange'],
            ['label' => 'Gallery Photos', 'value' => $photosCount, 'icon' => '🖼️', 'color' => 'purple'],
            ['label' => 'Total Revenue', 'value' => 'LKR ' . number_format($totalRevenue, 2), 'icon' => '💰', 'color' => 'green']
        ];

        require __DIR__ . '/../Views/admin/dashboard.php';
    }

    public function bookings() {
        $bookings = Booking::getAll();
        $db = Database::getConnection();
        $statuses = $db->query("SELECT * FROM booking_statuses")->fetchAll();
        $allPackages = Package::getAll();
        require __DIR__ . '/../Views/admin/bookings.php';
    }

    public function updateBookingStatus() {
        $id = $_POST['id'] ?? null;
        $statusId = $_POST['status_id'] ?? null;
        if ($id && $statusId) {
            Booking::updateStatus($id, $statusId);
            ActivityLog::log("Updated Booking Status", "Booking", $id, "Status ID changed to: " . $statusId);
        }
        header("Location: " . BASE_URL . "/admin/bookings");
        exit;
    }

    public function updatePaymentStatus() {
        $id = $_POST['id'] ?? null;
        $status = $_POST['status'] ?? ''; // 'Paid' means verified

        if ($id && $status === 'Paid') {
            $db = \Core\Database::getConnection();
            
            // 1. Get current amounts and receipt info
            $stmt = $db->prepare("SELECT total_amount, paid_amount, receipt_amount FROM bookings WHERE id = ?");
            $stmt->execute([$id]);
            $booking = $stmt->fetch();

            if ($booking) {
                $newPaidAmount = (float)$booking['paid_amount'] + (float)$booking['receipt_amount'];
                
                // 2. Determine new payment status
                $newPaymentStatus = 'Partial';
                if ($newPaidAmount >= (float)$booking['total_amount']) {
                    $newPaymentStatus = 'Paid';
                } elseif ($newPaidAmount <= 0) {
                    $newPaymentStatus = 'Unpaid';
                }

                // 3. Update booking: add to paid_amount, clear receipt info
                $stmt = $db->prepare("UPDATE bookings SET 
                    paid_amount = ?, 
                    payment_status = ?, 
                    payment_receipt_url = NULL, 
                    receipt_amount = 0 
                    WHERE id = ?");
                $stmt->execute([$newPaidAmount, $newPaymentStatus, $id]);

                ActivityLog::log("Verified Payment Receipt", "Booking", $id, "Added LKR " . number_format($booking['receipt_amount'], 2));
            }
        }
        header("Location: " . BASE_URL . "/admin/bookings");
        exit;
    }

    public function addPackageToBooking() {
        $bookingId = $_POST['booking_id'] ?? null;
        $packageId = $_POST['package_id'] ?? null;

        if ($bookingId && $packageId) {
            $db = \Core\Database::getConnection();
            
            // 1. Get package price
            $stmt = $db->prepare("SELECT title, price FROM packages WHERE id = ?");
            $stmt->execute([$packageId]);
            $package = $stmt->fetch();

            if ($package) {
                // 2. Add to booking_items
                $stmt = $db->prepare("INSERT INTO booking_items (booking_id, package_id, unit_price) VALUES (?, ?, ?)");
                $stmt->execute([$bookingId, $packageId, $package['price']]);

                // 3. Update total_amount in bookings
                $stmt = $db->prepare("UPDATE bookings SET total_amount = total_amount + ? WHERE id = ?");
                $stmt->execute([$package['price'], $bookingId]);

                ActivityLog::log("Added Extra Package to Booking", "Booking", $bookingId, "Added: " . $package['title']);
            }
        }
        header("Location: " . BASE_URL . "/admin/bookings");
        exit;
    }

    public function packages() {
        $editId = $_GET['edit'] ?? null;
        $editPkg = null;
        if ($editId) {
            $editPkg = Package::findById($editId);
        }

        $packages = Package::getAll();
        $categories = Package::getCategories();
        require __DIR__ . '/../Views/admin/packages.php';
    }

    public function savePackage() {
        $id = $_POST['id'] ?? null;
        $categoryId = $_POST['category_id'] ?? null;
        $title = $_POST['title'] ?? '';
        $price = $_POST['price'] ?? 0;
        $description = $_POST['description'] ?? '';
        $duration = $_POST['duration'] ?? '';

        $db = Database::getConnection();
        if ($id) {
            $stmt = $db->prepare("UPDATE packages SET category_id = ?, title = ?, price = ?, description = ?, duration = ? WHERE id = ?");
            $stmt->execute([$categoryId, $title, $price, $description, $duration, $id]);
            ActivityLog::log("Updated Package", "Package", $id);
        } else {
            $stmt = $db->prepare("INSERT INTO packages (category_id, title, price, description, duration) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$categoryId, $title, $price, $description, $duration]);
            ActivityLog::log("Created Package", "Package", $db->lastInsertId());
        }
        header("Location: " . BASE_URL . "/admin/packages");
        exit;
    }

    public function deletePackage() {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $db = Database::getConnection();
            $db->prepare("DELETE FROM packages WHERE id = ?")->execute([$id]);
            ActivityLog::log("Deleted Package", "Package", $id);
        }
        header("Location: " . BASE_URL . "/admin/packages");
        exit;
    }

    public function savePackageCategory() {
        $id = $_POST['id'] ?? null;
        $name = $_POST['category_name'] ?? '';
        
        if ($name) {
            $db = Database::getConnection();
            if ($id) {
                $stmt = $db->prepare("UPDATE package_categories SET category_name = ? WHERE id = ?");
                $stmt->execute([$name, $id]);
                ActivityLog::log("Updated Package Category", "PackageCategory", $id);
            } else {
                $stmt = $db->prepare("INSERT INTO package_categories (category_name) VALUES (?)");
                $stmt->execute([$name]);
                ActivityLog::log("Created Package Category", "PackageCategory", $db->lastInsertId());
            }
        }
        header("Location: " . BASE_URL . "/admin/packages");
        exit;
    }

    public function deletePackageCategory() {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $db = Database::getConnection();
            // Check if there are packages in this category
            $stmt = $db->prepare("SELECT COUNT(*) FROM packages WHERE category_id = ?");
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() > 0) {
                $_SESSION['flash_message'] = 'Cannot delete category. There are packages assigned to it.';
                $_SESSION['flash_type'] = 'error';
                header("Location: " . ($_SERVER['HTTP_REFERER'] ?? BASE_URL . "/admin/packages"));
                exit;
            }


            $db->prepare("DELETE FROM package_categories WHERE id = ?")->execute([$id]);
            ActivityLog::log("Deleted Package Category", "PackageCategory", $id);
        }
        header("Location: " . BASE_URL . "/admin/packages");
        exit;
    }

    public function gallery() {
        $db = Database::getConnection();
        $categories = $db->query("SELECT * FROM gallery_categories ORDER BY id DESC")->fetchAll();
        $carouselImages = $db->query("SELECT * FROM carousel_images ORDER BY created_at DESC")->fetchAll();
        
        $settingsFile = __DIR__ . '/../../config/carousel_settings.json';
        $carouselSettings = file_exists($settingsFile) ? json_decode(file_get_contents($settingsFile), true) : ['speed' => 5000, 'effect' => 'fade'];
        
        require __DIR__ . '/../Views/admin/gallery.php';
    }

    public function galleryCategory($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM gallery_categories WHERE id = ?");
        $stmt->execute([$id]);
        $category = $stmt->fetch();

        $stmt = $db->prepare("SELECT * FROM gallery_events WHERE category_id = ? ORDER BY id DESC");
        $stmt->execute([$id]);
        $events = $stmt->fetchAll();

        require __DIR__ . '/../Views/admin/gallery_category.php';
    }

    public function galleryEvent($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM gallery_events WHERE id = ?");
        $stmt->execute([$id]);
        $event = $stmt->fetch();

        $stmt = $db->prepare("SELECT * FROM gallery_images WHERE event_id = ? ORDER BY uploaded_at DESC");
        $stmt->execute([$id]);
        $images = $stmt->fetchAll();

        require __DIR__ . '/../Views/admin/gallery_event.php';
    }

    public function saveGalleryCategory() {
        $name = $_POST['name'] ?? '';
        $desc = $_POST['description'] ?? '';
        if ($name) {
            $db = Database::getConnection();
            $stmt = $db->prepare("INSERT INTO gallery_categories (name, description) VALUES (?, ?)");
            $stmt->execute([$name, $desc]);
            ActivityLog::log("Created Gallery Category", "GalleryCategory", $db->lastInsertId());
        }
        header("Location: " . BASE_URL . "/admin/gallery");
        exit;
    }

    public function deleteGalleryCategory() {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $db = Database::getConnection();
            $db->prepare("DELETE FROM gallery_categories WHERE id = ?")->execute([$id]);
            ActivityLog::log("Deleted Gallery Category", "GalleryCategory", $id);
        }
        header("Location: " . BASE_URL . "/admin/gallery");
        exit;
    }

    public function saveGalleryEvent() {
        $categoryId = $_POST['category_id'] ?? null;
        $title = $_POST['title'] ?? '';
        if ($categoryId && $title) {
            $db = Database::getConnection();
            $stmt = $db->prepare("INSERT INTO gallery_events (category_id, title) VALUES (?, ?)");
            $stmt->execute([$categoryId, $title]);
            ActivityLog::log("Created Gallery Event", "GalleryEvent", $db->lastInsertId());
        }
        header("Location: " . BASE_URL . "/admin/gallery/category/" . $categoryId);
        exit;
    }

    public function deleteGalleryEvent() {
        $id = $_POST['id'] ?? null;
        $categoryId = $_POST['category_id'] ?? '';
        if ($id) {
            $db = Database::getConnection();
            $db->prepare("DELETE FROM gallery_events WHERE id = ?")->execute([$id]);
            ActivityLog::log("Deleted Gallery Event", "GalleryEvent", $id);
        }
        header("Location: " . BASE_URL . "/admin/gallery/category/" . $categoryId);
        exit;
    }

    public function uploadGalleryImages() {
        $eventId = $_POST['event_id'] ?? null;
        if ($eventId && !empty($_FILES['photos']['name'][0])) {
            $db = Database::getConnection();
            $uploadDir = __DIR__ . '/../../public/uploads/gallery/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            foreach ($_FILES['photos']['tmp_name'] as $key => $tmpName) {
                $name = time() . "_" . basename($_FILES['photos']['name'][$key]);
                if (move_uploaded_file($tmpName, $uploadDir . $name)) {
                    $url = "/uploads/gallery/" . $name;
                    $stmt = $db->prepare("INSERT INTO gallery_images (event_id, url) VALUES (?, ?)");
                    $stmt->execute([$eventId, $url]);
                }
            }
            ActivityLog::log("Uploaded Gallery Images", "GalleryEvent", $eventId);
        }
        header("Location: " . BASE_URL . "/admin/gallery/event/" . $eventId);
        exit;
    }

    public function deleteGalleryImage() {
        $id = $_POST['id'] ?? null;
        $eventId = $_POST['event_id'] ?? '';
        if ($id) {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT url FROM gallery_images WHERE id = ?");
            $stmt->execute([$id]);
            $img = $stmt->fetch();
            if ($img) {
                $file = __DIR__ . '/../../public' . $img['url'];
                if (file_exists($file)) unlink($file);
            }
            $db->prepare("DELETE FROM gallery_images WHERE id = ?")->execute([$id]);
            ActivityLog::log("Deleted Gallery Image", "GalleryImage", $id);
        }
        header("Location: " . BASE_URL . "/admin/gallery/event/" . $eventId);
        exit;
    }

    public function messages() {
        $db = Database::getConnection();
        
        $selectedMsg = null;
        if (isset($_GET['id'])) {
            $stmt = $db->prepare("SELECT m.*, u.full_name as user_name FROM messages m LEFT JOIN user_profiles u ON m.user_id = u.id WHERE m.id = ?");
            $stmt->execute([$_GET['id']]);
            $selectedMsg = $stmt->fetch();

            if ($selectedMsg && $selectedMsg['status'] === 'Unread') {
                $db->prepare("UPDATE messages SET status = 'Read' WHERE id = ?")->execute([$_GET['id']]);
                $selectedMsg['status'] = 'Read'; // Update local copy for view
            }
        }

        $messages = $db->query("SELECT m.*, u.full_name as user_name FROM messages m LEFT JOIN user_profiles u ON m.user_id = u.id ORDER BY m.created_at DESC")->fetchAll();
        require __DIR__ . '/../Views/admin/messages.php';
    }

    public function replyMessage() {
        $id = $_POST['id'] ?? null;
        $reply = $_POST['reply'] ?? '';
        if ($id && $reply) {
            $db = Database::getConnection();
            $stmt = $db->prepare("UPDATE messages SET reply_message = ?, replied_at = CURRENT_TIMESTAMP, status = 'Replied' WHERE id = ?");
            $stmt->execute([$reply, $id]);
            ActivityLog::log("Replied to Message", "Message", $id);
        }

        header("Location: " . BASE_URL . "/admin/messages?id=" . $id);
        exit;
    }

    public function deleteMessage() {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $db = Database::getConnection();
            $stmt = $db->prepare("DELETE FROM messages WHERE id = ?");
            $stmt->execute([$id]);
            ActivityLog::log("Deleted Message", "Message", $id);
        }
        header("Location: " . BASE_URL . "/admin/messages");
        exit;
    }

    public function users() {
        $db = Database::getConnection();
        $q = $_GET['q'] ?? '';
        
        if (!empty($q)) {
            $stmt = $db->prepare("SELECT a.*, p.full_name, p.mobile, p.email FROM user_accounts a JOIN user_profiles p ON a.profile_id = p.id WHERE a.role_id = 4 AND (p.full_name LIKE ? OR p.mobile LIKE ? OR a.username LIKE ?) ORDER BY a.created_at DESC");
            $stmt->execute(["%$q%", "%$q%", "%$q%"]);
            $users = $stmt->fetchAll();
        } else {
            $users = $db->query("SELECT a.*, p.full_name, p.mobile, p.email FROM user_accounts a JOIN user_profiles p ON a.profile_id = p.id WHERE a.role_id = 4 ORDER BY a.created_at DESC")->fetchAll();
        }
        
        require __DIR__ . '/../Views/admin/users.php';
    }

    public function toggleUserStatus() {
        $id = $_POST['id'] ?? null;
        $status = isset($_POST['status']) ? (int)$_POST['status'] : 1;
        
        if ($id) {
            $db = Database::getConnection();
            $stmt = $db->prepare("UPDATE user_accounts SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            ActivityLog::log("Updated User Status", "User", $id, "Status changed to: " . ($status == 1 ? 'Active' : 'Inactive'));
        }
        header("Location: " . BASE_URL . "/admin/users");
        exit;
    }

    public function staff() {
        $db = Database::getConnection();
        $editId = $_GET['edit'] ?? null;
        $editStaff = null;
        if ($editId) {
            $stmt = $db->prepare("SELECT e.id, p.full_name, p.email, p.mobile, e.position, e.created_at, e.status, p.id as profile_id FROM employee_details e JOIN user_profiles p ON e.profile_id = p.id WHERE e.id = ?");
            $stmt->execute([$editId]);
            $editStaff = $stmt->fetch(\PDO::FETCH_ASSOC);
        }

        $staff = $db->query("SELECT e.id, p.full_name, p.mobile, p.email, e.position, e.created_at, e.status FROM employee_details e JOIN user_profiles p ON e.profile_id = p.id ORDER BY e.created_at DESC")->fetchAll();
        require __DIR__ . '/../Views/admin/staff.php';
    }

    public function saveStaff() {
        $id = $_POST['id'] ?? null;
        $fullName = $_POST['name'] ?? '';
        $position = $_POST['position'] ?? '';
        $email = $_POST['email'] ?? '';
        $mobile = $_POST['phone'] ?? '';
        $joinDate = $_POST['joinDate'] ?? null;
        $status = isset($_POST['status']) ? (int)$_POST['status'] : 1;

        $db = Database::getConnection();
        try {
            $db->beginTransaction();

            if ($id) {
                $stmt = $db->prepare("SELECT profile_id FROM employee_details WHERE id = ?");
                $stmt->execute([$id]);
                $profileId = $stmt->fetchColumn();

                $db->prepare("UPDATE user_profiles SET full_name = ?, email = ?, mobile = ? WHERE id = ?")->execute([$fullName, $email ?: null, $mobile ?: null, $profileId]);
                $db->prepare("UPDATE employee_details SET position = ?, join_date = ?, status = ? WHERE id = ?")->execute([$position ?: null, $joinDate ?: null, $status, $id]);
                ActivityLog::log("Updated Staff Member", "Staff", $id);
            } else {
                $stmt = $db->prepare("SELECT id FROM user_profiles WHERE (mobile = ? AND mobile != '') OR (email = ? AND email != '')");
                $stmt->execute([$mobile, $email]);
                $profileId = $stmt->fetchColumn();
                
                if (!$profileId) {
                    $db->prepare("INSERT INTO user_profiles (full_name, email, mobile) VALUES (?, ?, ?)")->execute([$fullName, $email ?: null, $mobile ?: null]);
                    $profileId = $db->lastInsertId();
                } else {
                    $db->prepare("UPDATE user_profiles SET full_name = ? WHERE id = ?")->execute([$fullName, $profileId]);
                }

                $db->prepare("INSERT INTO employee_details (profile_id, position, join_date, status) VALUES (?, ?, ?, ?)")->execute([$profileId, $position ?: null, $joinDate ?: null, $status]);
                $newId = $db->lastInsertId();
                ActivityLog::log("Added Staff Member", "Staff", $newId);
            }
            $db->commit();
        } catch (\PDOException $e) {
            if ($db->inTransaction()) $db->rollBack();
            if ($e->getCode() == 23000) {
                $_SESSION['flash_message'] = "Error: Mobile number or Email already exists!";
                $_SESSION['flash_type'] = 'error';
            } else {
                throw $e;
            }
        }

        header("Location: " . BASE_URL . "/admin/staff");
        exit;
    }

    public function deleteStaff() {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $db = Database::getConnection();
            $db->prepare("DELETE FROM employee_details WHERE id = ?")->execute([$id]);
            ActivityLog::log("Deleted Staff Member", "Staff", $id);
        }
        header("Location: " . BASE_URL . "/admin/staff");
        exit;
    }

    public function employees() {
        $db = Database::getConnection();
        $editId = $_GET['edit'] ?? null;
        $editEmp = null;
        if ($editId) {
            $editEmp = \Models\User::findById($editId);
            if ($editEmp && $editEmp['permissions']) {
                $editEmp['permissions'] = json_decode($editEmp['permissions'], true);
            } else {
                $editEmp['permissions'] = [];
            }
        }

        // Role IDs 1 and 2 are Super Admin and Admin
        $employees = $db->query("SELECT a.*, p.full_name, p.mobile, p.email, r.role_name as role FROM user_accounts a JOIN user_profiles p ON a.profile_id = p.id JOIN roles r ON a.role_id = r.id WHERE a.role_id IN (1, 2) ORDER BY a.created_at DESC")->fetchAll();
        
        // Decode permissions for all employees
        foreach ($employees as &$emp) {
            if ($emp['role_id'] == 2) {
                $stmt = $db->prepare("SELECT sp.page_slug FROM account_permissions ap JOIN system_pages sp ON ap.page_id = sp.id WHERE ap.account_id = ?");
                $stmt->execute([$emp['id']]);
                $emp['permissions'] = $stmt->fetchAll(\PDO::FETCH_COLUMN);
            } else {
                $emp['permissions'] = [];
            }
        }
        unset($emp); // Crucial to prevent reference bug in the view loop
        
        $availablePages = $db->query("SELECT id, page_slug, page_name FROM system_pages")->fetchAll();

        // Fetch staff members who do not have an account yet
        $availableStaff = $db->query("SELECT p.id as profile_id, p.full_name, e.position FROM employee_details e JOIN user_profiles p ON e.profile_id = p.id LEFT JOIN user_accounts a ON p.id = a.profile_id WHERE a.id IS NULL")->fetchAll();

        require __DIR__ . '/../Views/admin/employees.php';
    }

    public function saveUser() {
        $id = $_POST['id'] ?? null;
        $roleId = $_POST['role_id'] ?? 3;
        // If coming from employees page, role might be 'admin' or 'superadmin'
        if (isset($_POST['role'])) {
            $roleId = ($_POST['role'] === 'superadmin') ? 1 : 2;
        }

        $fullName = $_POST['full_name'] ?? $_POST['name'] ?? '';
        $position = $_POST['position'] ?? '';
        $email = $_POST['email'] ?? '';
        $mobile = $_POST['mobile'] ?? $_POST['phone'] ?? '';
        $status = isset($_POST['status']) ? (int)$_POST['status'] : 1;
        $username = $_POST['username'] ?? '';
        $permissions = $_POST['permissions'] ?? [];

        $db = Database::getConnection();
        try {
            $db->beginTransaction();

            if ($id) {
                // Update profile
                $profileId = $_POST['profile_id'] ?? null;
                if (!$profileId) {
                    $stmt = $db->prepare("SELECT profile_id FROM user_accounts WHERE id = ?");
                    $stmt->execute([$id]);
                    $profileId = $stmt->fetchColumn();
                }
                
                // Only update full_name if it was submitted
                if (!empty($fullName)) {
                    $db->prepare("UPDATE user_profiles SET full_name = ?, email = ?, mobile = ? WHERE id = ?")->execute([$fullName, $email ?: null, $mobile ?: null, $profileId]);
                }
                
                // Update account
                $sql = "UPDATE user_accounts SET role_id = ?, status = ?, username = ?";
                $params = [$roleId, $status, $username ?: null];
                
                if (!empty($_POST['password'])) {
                    $sql .= ", password = ?";
                    $params[] = password_hash($_POST['password'], PASSWORD_DEFAULT);
                }
                
                $sql .= " WHERE id = ?";
                $params[] = $id;
                
                $stmt = $db->prepare($sql);
                $stmt->execute($params);

                // Update Employee details
                if (in_array($roleId, [1, 2, 3])) {
                    $checkEmp = $db->prepare("SELECT id FROM employee_details WHERE profile_id = ?");
                    $checkEmp->execute([$profileId]);
                    if ($checkEmp->fetch()) {
                        $db->prepare("UPDATE employee_details SET position = ? WHERE profile_id = ?")->execute([$position ?: null, $profileId]);
                    } else {
                        $db->prepare("INSERT INTO employee_details (profile_id, position) VALUES (?, ?)")->execute([$profileId, $position ?: null]);
                    }
                }

                // Update Permissions
                $db->prepare("DELETE FROM account_permissions WHERE account_id = ?")->execute([$id]);
                if ($roleId == 2 && !empty($permissions)) {
                    $stmtPerm = $db->prepare("INSERT INTO account_permissions (account_id, page_id) VALUES (?, ?)");
                    foreach ($permissions as $pageId) {
                        $stmtPerm->execute([$id, $pageId]);
                    }
                }

                ActivityLog::log("Updated User Account", "User", $id);
            } else {
                $password = password_hash($_POST['password'] ?? $mobile ?: '123456', PASSWORD_DEFAULT);
                if (empty($username)) $username = 'user' . time();
                
                // Profile logic
                $profileId = $_POST['profile_id'] ?? null;
                
                if (!$profileId) {
                    $stmt = $db->prepare("SELECT id FROM user_profiles WHERE (mobile = ? AND mobile != '') OR (email = ? AND email != '')");
                    $stmt->execute([$mobile, $email]);
                    $profileId = $stmt->fetchColumn();
                    if (!$profileId) {
                        $db->prepare("INSERT INTO user_profiles (full_name, email, mobile) VALUES (?, ?, ?)")->execute([$fullName, $email ?: null, $mobile ?: null]);
                        $profileId = $db->lastInsertId();
                    }
                }

                $db->prepare("INSERT INTO user_accounts (profile_id, role_id, username, password, status) VALUES (?, ?, ?, ?, ?)")->execute([$profileId, $roleId, $username ?: null, $password, $status]);
                $accountId = $db->lastInsertId();

                if (in_array($roleId, [1, 2, 3])) {
                    $checkEmp = $db->prepare("SELECT id FROM employee_details WHERE profile_id = ?");
                    $checkEmp->execute([$profileId]);
                    if (!$checkEmp->fetch()) {
                        $db->prepare("INSERT INTO employee_details (profile_id, position) VALUES (?, ?)")->execute([$profileId, $position ?: null]);
                    }
                }

                if ($roleId == 2 && !empty($permissions)) {
                    $stmtPerm = $db->prepare("INSERT INTO account_permissions (account_id, page_id) VALUES (?, ?)");
                    foreach ($permissions as $pageId) {
                        $stmtPerm->execute([$accountId, $pageId]);
                    }
                }

                ActivityLog::log("Created User Account", "User", $accountId);
            }
            $db->commit();
        } catch (\PDOException $e) {
            if ($db->inTransaction()) $db->rollBack();
            if ($e->getCode() == 23000) {
                $_SESSION['flash_message'] = "Error: Mobile number, Email or Username already exists!";
                $_SESSION['flash_type'] = 'error';
                header("Location: " . ($_SERVER['HTTP_REFERER'] ?? BASE_URL . "/admin/users"));
                exit;
            }
            throw $e;
        }
        
        $redirect = ($roleId == 1 || $roleId == 2) ? 'employees' : (($roleId == 3) ? 'staff' : 'users');
        header("Location: " . BASE_URL . "/admin/" . $redirect);
        exit;
    }

    public function deleteUser() {
        $id = $_POST['id'] ?? null;
        $roleId = $_POST['role_id'] ?? 4;
        if ($id) {
            $db = Database::getConnection();
            $db->prepare("DELETE FROM user_accounts WHERE id = ?")->execute([$id]);
            ActivityLog::log("Deleted User Account", "User", $id);
        }
        $redirect = ($roleId == 1 || $roleId == 2) ? 'employees' : (($roleId == 3) ? 'staff' : 'users');
        header("Location: " . BASE_URL . "/admin/" . $redirect);
        exit;
    }

    public function logs() {
        $db = Database::getConnection();
        $logs = $db->query("SELECT a.*, p.full_name as actor_name FROM activity_logs a LEFT JOIN user_accounts ua ON a.user_id = ua.id LEFT JOIN user_profiles p ON ua.profile_id = p.id ORDER BY a.created_at DESC LIMIT 500")->fetchAll();
        require __DIR__ . '/../Views/admin/logs.php';
    }

    public function uploadCarouselImages() {
        if (!empty($_FILES['photos']['name'][0])) {
            $db = Database::getConnection();
            $uploadDir = __DIR__ . '/../../public/uploads/carousel/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            foreach ($_FILES['photos']['tmp_name'] as $key => $tmpName) {
                $name = "carousel_" . time() . "_" . basename($_FILES['photos']['name'][$key]);
                if (move_uploaded_file($tmpName, $uploadDir . $name)) {
                    $url = "/uploads/carousel/" . $name;
                    $db->prepare("INSERT INTO carousel_images (url) VALUES (?)")->execute([$url]);
                }
            }
            ActivityLog::log("Uploaded Carousel Images");
        }
        header("Location: " . BASE_URL . "/admin/gallery");
        exit;
    }

    public function deleteCarouselImage() {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT url FROM carousel_images WHERE id = ?");
            $stmt->execute([$id]);
            $img = $stmt->fetch();
            if ($img) {
                $file = __DIR__ . '/../../public' . $img['url'];
                if (file_exists($file)) unlink($file);
            }
            $db->prepare("DELETE FROM carousel_images WHERE id = ?")->execute([$id]);
            ActivityLog::log("Deleted Carousel Image");
        }
        header("Location: " . BASE_URL . "/admin/gallery");
        exit;
    }

    public function saveCarouselSettings() {
        $speed = (int)($_POST['speed'] ?? 5000);
        $effect = $_POST['effect'] ?? 'fade';
        
        $settings = [
            'speed' => $speed,
            'effect' => $effect
        ];
        
        $file = __DIR__ . '/../../config/carousel_settings.json';
        file_put_contents($file, json_encode($settings, JSON_PRETTY_PRINT));
        
        ActivityLog::log("Updated Carousel Settings", "Carousel");
        header("Location: " . BASE_URL . "/admin/gallery");
        exit;
    }

    // --- OLD BOOKINGS METHODS ---
    public function oldBookings() {
        $q = $_GET['q'] ?? '';
        $db = Database::getConnection();
        
        $sql = "SELECT b.*, u.full_name as profile_name, u.mobile as profile_mobile, s.status_label as status 
                FROM bookings b 
                LEFT JOIN user_profiles u ON b.customer_id = u.id 
                LEFT JOIN booking_statuses s ON b.status_id = s.id 
                WHERE JSON_EXTRACT(b.event_details, '$.is_old_booking') = true";
        
        $params = [];
        if (!empty($q)) {
            $sql .= " AND (u.full_name LIKE ? OR u.mobile LIKE ? OR JSON_EXTRACT(b.event_details, '$.customerName') LIKE ? OR JSON_EXTRACT(b.event_details, '$.mobile') LIKE ?)";
            $params = ["%$q%", "%$q%", "%$q%", "%$q%"];
        }
        $sql .= " ORDER BY b.created_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        foreach ($bookings as &$booking) {
            $details = json_decode($booking['event_details'], true);
            $booking['booking_details'] = $details['bookingDetails'] ?? '';
            $booking['customer_name'] = $booking['profile_name'] ?? $details['customerName'] ?? 'Unknown';
            $booking['mobile'] = $booking['profile_mobile'] ?? $details['mobile'] ?? 'Unknown';
        }
        
        $editBooking = null;
        if (isset($_GET['edit'])) {
            $stmt = $db->prepare("SELECT b.*, u.full_name as profile_name, u.mobile as profile_mobile, s.status_label as status FROM bookings b LEFT JOIN user_profiles u ON b.customer_id = u.id LEFT JOIN booking_statuses s ON b.status_id = s.id WHERE b.id = ?");
            $stmt->execute([$_GET['edit']]);
            $editBooking = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($editBooking) {
                $details = json_decode($editBooking['event_details'], true);
                $editBooking['booking_details'] = $details['bookingDetails'] ?? '';
                $editBooking['customer_name'] = $editBooking['profile_name'] ?? $details['customerName'] ?? '';
                $editBooking['mobile'] = $editBooking['profile_mobile'] ?? $details['mobile'] ?? '';
            }
        }
        
        require __DIR__ . '/../Views/admin/old_bookings.php';
    }

    public function saveOldBooking() {
        $id = $_POST['id'] ?? null;
        $customerName = $_POST['customerName'] ?? '';
        $mobile = $_POST['mobile'] ?? '';
        $date = $_POST['date'] ?? '';
        $statusStr = $_POST['status'] ?? 'Pending';
        $bookingDetails = $_POST['bookingDetails'] ?? '';
        $totalAmount = (float)($_POST['totalAmount'] ?? 0);
        $paidAmount = (float)($_POST['paidAmount'] ?? 0);
        
        $db = Database::getConnection();
        $db->beginTransaction();
        
        try {
            $statusMap = ['Pending' => 1, 'Confirmed' => 2, 'Rejected' => 3, 'Completed' => 4, 'Cancelled' => 5];
            $statusId = $statusMap[$statusStr] ?? 1;
            
            $paymentStatus = 'Unpaid';
            if ($paidAmount >= $totalAmount && $totalAmount > 0) $paymentStatus = 'Paid';
            elseif ($paidAmount > 0) $paymentStatus = 'Partial';
            
            $eventDetails = json_encode([
                'is_old_booking' => true,
                'bookingDetails' => $bookingDetails,
                'customerName' => $customerName,
                'mobile' => $mobile
            ]);
            
            if ($id) {
                // Determine if we need to keep customer_id or nullify it
                // We'll keep existing customer_id if it exists, otherwise leave it NULL
                $stmt = $db->prepare("UPDATE bookings SET status_id = ?, booking_date = ?, total_amount = ?, paid_amount = ?, payment_status = ?, event_details = ? WHERE id = ?");
                $stmt->execute([$statusId, $date, $totalAmount, $paidAmount, $paymentStatus, $eventDetails, $id]);
                ActivityLog::log("Updated Old Booking Record", "Booking", $id);
            } else {
                // Ensure all standard columns are present to avoid NOT NULL constraints
                $stmt = $db->prepare("INSERT INTO bookings (customer_id, status_id, booking_date, hotel_name, couple_name, total_amount, paid_amount, payment_status, event_details) VALUES (NULL, ?, ?, '', '', ?, ?, ?, ?)");
                $stmt->execute([$statusId, $date, $totalAmount, $paidAmount, $paymentStatus, $eventDetails]);
                ActivityLog::log("Created Old Booking Record", "Booking", $db->lastInsertId());
            }

            $db->commit();
            $_SESSION['flash_message'] = 'Old booking record saved successfully!';
            $_SESSION['flash_type'] = 'success';
        } catch (\Exception $e) {
            $db->rollBack();
            $_SESSION['flash_message'] = 'Error saving record: ' . $e->getMessage();
            $_SESSION['flash_type'] = 'error';
        }

        
        header("Location: " . BASE_URL . "/admin/old-bookings");
        exit;
    }

    public function deleteOldBooking() {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $db = Database::getConnection();
            $stmt = $db->prepare("DELETE FROM bookings WHERE id = ?");
            $stmt->execute([$id]);
            ActivityLog::log("Deleted Old Booking Record", "Booking", $id);
        }
        header("Location: " . BASE_URL . "/admin/old-bookings");
        exit;
    }

    public function saveOldPayment() {
        $id = $_POST['id'] ?? null;
        $amount = (float)($_POST['amount'] ?? 0);
        $statusStr = $_POST['status'] ?? null;
        
        if ($id && $amount > 0) {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT total_amount, paid_amount FROM bookings WHERE id = ?");
            $stmt->execute([$id]);
            $booking = $stmt->fetch(\PDO::FETCH_ASSOC);
            
            if ($booking) {
                $newPaidAmount = $booking['paid_amount'] + $amount;
                $paymentStatus = 'Partial';
                if ($newPaidAmount >= $booking['total_amount'] && $booking['total_amount'] > 0) {
                    $paymentStatus = 'Paid';
                }
                
                $updateSql = "UPDATE bookings SET paid_amount = ?, payment_status = ?";
                $params = [$newPaidAmount, $paymentStatus];
                
                if ($statusStr) {
                    $statusMap = ['Pending' => 1, 'Confirmed' => 2, 'Rejected' => 3, 'Completed' => 4, 'Cancelled' => 5];
                    if (isset($statusMap[$statusStr])) {
                        $updateSql .= ", status_id = ?";
                        $params[] = $statusMap[$statusStr];
                    }
                }
                
                $updateSql .= " WHERE id = ?";
                $params[] = $id;
                
                $stmt = $db->prepare($updateSql);
                $stmt->execute($params);
                
                ActivityLog::log("Added Payment to Old Booking", "Booking", $id);
            }
        }
        header("Location: " . BASE_URL . "/admin/old-bookings");
        exit;
    }

    public function chatbot() {
        $db = Database::getConnection();
        $faqs = $db->query("SELECT * FROM chatbot_faqs ORDER BY id DESC")->fetchAll();
        require __DIR__ . '/../Views/admin/chatbot.php';
    }

    public function saveFaq() {
        $id = $_POST['id'] ?? null;
        $question = $_POST['question'] ?? '';
        $answer = $_POST['answer'] ?? '';

        if ($question && $answer) {
            $db = Database::getConnection();
            if ($id) {
                $stmt = $db->prepare("UPDATE chatbot_faqs SET question = ?, answer = ? WHERE id = ?");
                $stmt->execute([$question, $answer, $id]);
            } else {
                $stmt = $db->prepare("INSERT INTO chatbot_faqs (question, answer) VALUES (?, ?)");
                $stmt->execute([$question, $answer]);
            }
            ActivityLog::log("Updated Chatbot FAQ", "Chatbot");
        }
        header("Location: " . BASE_URL . "/admin/chatbot");
        exit;
    }

    public function deleteFaq() {
        $id = $_POST['id'] ?? null;
        if ($id) {
            $db = Database::getConnection();
            $db->prepare("DELETE FROM chatbot_faqs WHERE id = ?")->execute([$id]);
            ActivityLog::log("Deleted Chatbot FAQ", "Chatbot");
        }
        header("Location: " . BASE_URL . "/admin/chatbot");
        exit;
    }
}
