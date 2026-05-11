<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

session_start();

// Define Base URL for asset loading
$baseDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
define('BASE_URL', rtrim($baseDir, '/'));

// Simple Autoloader
spl_autoload_register(function ($class) {
    // Convert namespace to full file path
    $file = __DIR__ . '/../app/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

use Core\Router;

$router = new Router();

// Routes definition
$router->get('/', 'HomeController@index');

// Auth Routes
$router->get('/login', 'AuthController@showLogin');
$router->post('/login', 'AuthController@login');
$router->get('/register', 'AuthController@showRegister');
$router->post('/register', 'AuthController@register');
$router->get('/logout', 'AuthController@logout');

// Booking Routes
$router->post('/booking/submit', 'BookingController@submit');
$router->get('/my-bookings', 'ClientBookingController@track');
$router->post('/my-bookings', 'ClientBookingController@track');
$router->post('/my-bookings/upload-receipt', 'ClientBookingController@uploadReceipt');

// Admin Auth Routes
$router->get('/admin/login', 'AuthController@showAdminLogin');
$router->post('/admin/login', 'AuthController@adminLogin');
$router->get('/admin/logout', 'AuthController@adminLogout');

// Admin Protected Routes
$router->get('/admin', function() { header("Location: /admin/dashboard"); exit; });
$router->get('/admin/dashboard', 'AdminController@dashboard');
$router->get('/admin/bookings', 'AdminController@bookings');

// Chatbot API
$router->get('/api/chatbot/faqs', 'HomeController@getChatbotFaqs');

$router->post('/admin/bookings/status', 'AdminController@updateBookingStatus');
$router->post('/admin/bookings/payment', 'AdminController@updatePaymentStatus');
$router->post('/admin/bookings/add-package', 'AdminController@addPackageToBooking');
$router->get('/admin/packages', 'AdminController@packages');
$router->post('/admin/packages/save', 'AdminController@savePackage');
$router->post('/admin/packages/delete', 'AdminController@deletePackage');
$router->post('/admin/packages/category/save', 'AdminController@savePackageCategory');
$router->post('/admin/packages/category/delete', 'AdminController@deletePackageCategory');

$router->get('/admin/gallery', 'AdminController@gallery');
$router->post('/admin/gallery/category/save', 'AdminController@saveGalleryCategory');
$router->post('/admin/gallery/category/delete', 'AdminController@deleteGalleryCategory');

$router->get('/admin/gallery/category/:id', 'AdminController@galleryCategory');
$router->post('/admin/gallery/event/save', 'AdminController@saveGalleryEvent');
$router->post('/admin/gallery/event/delete', 'AdminController@deleteGalleryEvent');

$router->get('/admin/gallery/event/:id', 'AdminController@galleryEvent');
$router->post('/admin/gallery/upload', 'AdminController@uploadGalleryImages');
$router->post('/admin/gallery/image/delete', 'AdminController@deleteGalleryImage');

// Homepage Carousel Routes
$router->post('/admin/carousel/upload', 'AdminController@uploadCarouselImages');
$router->post('/admin/carousel/delete', 'AdminController@deleteCarouselImage');
$router->post('/admin/carousel/settings', 'AdminController@saveCarouselSettings');

// Chatbot Management Routes
$router->get('/admin/chatbot', 'AdminController@chatbot');
$router->post('/admin/chatbot/save', 'AdminController@saveFaq');
$router->post('/admin/chatbot/delete', 'AdminController@deleteFaq');

$router->get('/admin/messages', 'AdminController@messages');
$router->post('/admin/messages/reply', 'AdminController@replyMessage');
$router->post('/admin/messages/delete', 'AdminController@deleteMessage');

$router->get('/admin/employees', 'AdminController@employees');
$router->post('/admin/employees/save', 'AdminController@saveUser');
$router->post('/admin/employees/delete', 'AdminController@deleteUser');

$router->get('/admin/staff', 'AdminController@staff');
$router->post('/admin/staff/save', 'AdminController@saveStaff');
$router->post('/admin/staff/delete', 'AdminController@deleteStaff');
$router->get('/admin/logs', 'AdminController@logs');

$router->get('/admin/users', 'AdminController@users');
$router->post('/admin/users/status', 'AdminController@toggleUserStatus');

$router->get('/admin/old-bookings', 'AdminController@oldBookings');
$router->post('/admin/old-bookings/save', 'AdminController@saveOldBooking');
$router->post('/admin/old-bookings/delete', 'AdminController@deleteOldBooking');
$router->post('/admin/old-bookings/payment', 'AdminController@saveOldPayment');

$router->get('/about', 'PageController@about');
$router->get('/contact', 'PageController@contact');
$router->get('/gallery', 'PageController@gallery');
$router->get('/gallery/category/:categoryId', 'PageController@galleryCategory');
$router->get('/gallery/category/:categoryId/event/:eventId', 'PageController@galleryEvent');

// API Routes
$router->post('/api/auth/login', 'AuthController@apiLogin');
$router->post('/api/auth/register', 'AuthController@apiRegister');
$router->post('/api/messages', 'MessageController@store');

// Dispatch the request
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Basic RBAC Middleware for /admin/*
$path = parse_url($uri, PHP_URL_PATH);
if (strpos($path, '/admin') !== false && strpos($path, '/admin/login') === false && strpos($path, '/admin/logout') === false) {
    if (!isset($_SESSION['user']) || !in_array($_SESSION['user']['role_id'], [1, 2])) {
        header("Location: " . BASE_URL . "/admin/login");
        exit;
    }
}

$router->dispatch($method, $uri);
