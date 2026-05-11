<?php
namespace Models;

use Core\Database;
use PDO;

class User {
    public static function findByUsername($username) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT a.*, p.full_name, p.email, p.mobile, r.role_name FROM user_accounts a JOIN user_profiles p ON a.profile_id = p.id JOIN roles r ON a.role_id = r.id WHERE a.username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch();
    }

    public static function findByEmail($email) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT a.*, p.full_name, p.email, p.mobile, r.role_name FROM user_accounts a JOIN user_profiles p ON a.profile_id = p.id JOIN roles r ON a.role_id = r.id WHERE p.email = ? LIMIT 1");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public static function findByMobile($mobile) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT a.*, p.full_name, p.email, p.mobile, r.role_name FROM user_accounts a JOIN user_profiles p ON a.profile_id = p.id JOIN roles r ON a.role_id = r.id WHERE p.mobile = ? LIMIT 1");
        $stmt->execute([$mobile]);
        return $stmt->fetch();
    }

    public static function findById($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT a.*, p.full_name, p.email, p.mobile, r.role_name FROM user_accounts a JOIN user_profiles p ON a.profile_id = p.id JOIN roles r ON a.role_id = r.id WHERE a.id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create($data) {
        $db = Database::getConnection();
        try {
            $db->beginTransaction();
            $profileId = null;
            
            // Check if profile exists by mobile or email
            if (!empty($data['mobile'])) {
                $stmt = $db->prepare("SELECT id FROM user_profiles WHERE mobile = ?");
                $stmt->execute([$data['mobile']]);
                $profileId = $stmt->fetchColumn();
            }
            if (!$profileId && !empty($data['email'])) {
                $stmt = $db->prepare("SELECT id FROM user_profiles WHERE email = ?");
                $stmt->execute([$data['email']]);
                $profileId = $stmt->fetchColumn();
            }
            
            if (!$profileId) {
                $stmt = $db->prepare("INSERT INTO user_profiles (full_name, email, mobile) VALUES (?, ?, ?)");
                $stmt->execute([$data['full_name'], $data['email'] ?? null, $data['mobile'] ?? null]);
                $profileId = $db->lastInsertId();
            }

            $stmt = $db->prepare("INSERT INTO user_accounts (profile_id, role_id, username, password, status) VALUES (?, ?, ?, ?, ?)");
            $success = $stmt->execute([
                $profileId,
                $data['role_id'] ?? 4,
                $data['username'] ?? null,
                $data['password'],
                $data['status'] ?? 1
            ]);
            
            $db->commit();
            return $success;
        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            return false;
        }
    }

    public static function update($id, $data) {
        $db = Database::getConnection();
        try {
            $db->beginTransaction();
            
            // Update account status
            if (isset($data['status'])) {
                $stmt = $db->prepare("UPDATE user_accounts SET status = ? WHERE id = ?");
                $stmt->execute([$data['status'], $id]);
            }
            
            // Update profile
            $stmt = $db->prepare("SELECT profile_id FROM user_accounts WHERE id = ?");
            $stmt->execute([$id]);
            $profileId = $stmt->fetchColumn();
            
            if ($profileId) {
                $stmt = $db->prepare("UPDATE user_profiles SET full_name = ?, email = ?, mobile = ? WHERE id = ?");
                $stmt->execute([$data['full_name'], $data['email'] ?? null, $data['mobile'] ?? null, $profileId]);
            }
            
            $db->commit();
            return true;
        } catch (\Exception $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            return false;
        }
    }

    public static function delete($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM user_accounts WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
