<?php
namespace Controllers;

use Models\User;
use Models\ActivityLog;

class AuthController {
    public function showLogin() {
        require __DIR__ . '/../Views/login.php';
    }

    public function login() {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        $isAdminLogin = (strpos($_SERVER['REQUEST_URI'], '/admin/login') !== false);
        $viewPath = $isAdminLogin ? __DIR__ . '/../Views/admin/login.php' : __DIR__ . '/../Views/login.php';

        $user = User::findByUsername($username);
        if (!$user) {
            $user = User::findByEmail($username);
        }

        if ($user && password_verify($password, $user['password'])) {
            // Check if user account is Active (1 = Active)
            if ($user['status'] != 1) {
                $error = "Your account has been deactivated. Please contact the administrator.";
                require $viewPath;
                return;
            }

            $permissions = [];
            if ($user['role_id'] == 2) {
                $db = \Core\Database::getConnection();
                $stmt = $db->prepare("SELECT sp.page_slug FROM account_permissions ap JOIN system_pages sp ON ap.page_id = sp.id WHERE ap.account_id = ?");
                $stmt->execute([$user['id']]);
                $permissions = $stmt->fetchAll(\PDO::FETCH_COLUMN);
            }

            $_SESSION['user'] = [
                'id' => $user['id'],
                'full_name' => $user['full_name'],
                'username' => $user['username'],
                'email' => $user['email'] ?? '',
                'mobile' => $user['mobile'],
                'role' => $user['role_name'],
                'role_id' => $user['role_id'],
                'permissions' => $permissions
            ];



            ActivityLog::log("User Logged In", "User", $user['id']);

            $adminRoles = ['Super Admin', 'Admin', 'Employee'];
            if (in_array($user['role_name'], $adminRoles)) {
                header("Location: " . BASE_URL . "/admin/dashboard");
            } else {
                header("Location: " . BASE_URL . "/");
            }
            exit;
        }

        $error = "Invalid credentials";
        require $viewPath;
    }

    public function showRegister() {
        require __DIR__ . '/../Views/register.php';
    }

    public function register() {
        $fullName = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $mobile = $_POST['mobile'] ?? '';
        $password = password_hash(trim($mobile), PASSWORD_DEFAULT);
        $username = explode('@', $email)[0] . rand(100, 999);

        if (empty($fullName) || empty($email) || empty($mobile)) {
            $error = "Please fill in all required fields.";
            require __DIR__ . '/../Views/register.php';
            return;
        }

        if (User::findByEmail($email)) {
            $error = "Email is already registered.";
            require __DIR__ . '/../Views/register.php';
            return;
        }

        if (User::findByMobile($mobile)) {
            $error = "Mobile number is already registered.";
            require __DIR__ . '/../Views/register.php';
            return;
        }

        $result = User::create([
            'role_id' => 4, // User (Customer)
            'full_name' => $fullName,
            'username' => $username,
            'email' => $email,
            'mobile' => $mobile,
            'password' => $password,
            'status' => 1
        ]);

        if ($result) {
            $success = "Account created successfully! Your Username is '{$username}' and your Password is your Mobile Number.";
            require __DIR__ . '/../Views/login.php';
        } else {
            $error = "Failed to create account. Please try again.";
            require __DIR__ . '/../Views/register.php';
        }
    }

    public function logout() {
        $user = $_SESSION['user'] ?? null;
        if ($user) {
            ActivityLog::log("User Logged Out", "User", $user['id'], "User '{$user['username']}' signed out.");
        }
        unset($_SESSION['user']);
        header("Location: " . BASE_URL . "/login");
        exit;
    }

    public function showAdminLogin() {
        // We use the same login page for both, but we can have a specific one if needed
        require __DIR__ . '/../Views/admin/login.php';
    }

    public function adminLogin() {
        $this->login(); // Re-use main login
    }

    public function adminLogout() {
        $this->logout();
    }
}
