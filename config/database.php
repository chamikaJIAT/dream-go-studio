<?php
declare(strict_types=1);

// Application Constants
const APP_NAME = 'Dream Go Studio';
// const APP_URL = 'http://localhost:8080';

const APP_URL = 'https://dreamgostudio.lk';

// Localhost Database Configuration

const DB_HOST = '127.0.0.1';
const DB_PORT = '3306';
const DB_NAME = 'dream_go_studio';
const DB_USER = 'root';
const DB_PASS = '1234';


// Host Database Configuration

// const DB_HOST = 'mysql.dreamgostudio.lk';
// const DB_PORT = '3306';
// const DB_NAME = 'dream_go_studio_db';
// const DB_USER = 'dgs_db_admin';
// const DB_PASS = 'Zb!Nn.AX9$n';


date_default_timezone_set('Asia/Colombo');

class Database {
    private static ?PDO $pdo = null;

    public static function setUpConnection(): void {
        if (self::$pdo === null) {
            $charset = 'utf8mb4';
            
          
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . $charset;
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
                // Set timezone to Sri Lanka
                self::$pdo->exec("SET time_zone = '+05:30'");
            } catch (PDOException $e) {
                die("Database Connection Failed: " . $e->getMessage());
            }
        }
    }

    public static function iud(string $query, array $params = []): void {
        self::setUpConnection();
        $stmt = self::$pdo->prepare($query);
        $stmt->execute($params);
    }

    public static function search(string $query, array $params = []): array {
        self::setUpConnection();
        $stmt = self::$pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function getLastInsertId(): string {
        self::setUpConnection();
        return self::$pdo->lastInsertId();
    }

    public static function getConnection(): PDO {
        self::setUpConnection();
        return self::$pdo;
    }
}





















