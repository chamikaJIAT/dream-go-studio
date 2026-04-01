import { useState, useEffect } from 'react';
import { apiCall } from '../../../api';
import './AdminUsers.css';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await apiCall('/auth/users');
            setUsers(res.users);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch users', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (user) => {
        const newStatus = user.status === 'Inactive' ? 'Active' : 'Inactive';
        try {
            await apiCall(`/auth/users/${user.id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            fetchUsers();
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status.");
        }
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile?.includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>User Management</h2>
                <p>View and manage registered clients.</p>
            </div>

            <div className="users-content">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search by name, mobile, or username..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Joined Date</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Username</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="empty-state">Loading users...</td></tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td><strong>{user.name}</strong></td>
                                    <td>{user.mobile}</td>
                                    <td><code className="username-tag">{user.username}</code></td>
                                    <td>
                                        <span className={`status-badge ${user.status === 'Inactive' ? 'badge-danger' : 'badge-success'}`}>
                                            <span className="badge-icon">{user.status === 'Inactive' ? '✕' : '✓'}</span>
                                            {user.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button 
                                            className={`action-btn ${user.status === 'Inactive' ? 'activate' : 'deactivate'}`}
                                            onClick={() => toggleStatus(user)}
                                            title={user.status === 'Inactive' ? 'Activate User' : 'Deactivate User'}
                                        >
                                            {user.status === 'Inactive' ? '🔓 Activate' : '🔒 Deactivate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="empty-state">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
