import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import './AdminUsers.css';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const userData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userData);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const toggleStatus = async (user) => {
        const newStatus = user.status === 'Inactive' ? 'Active' : 'Inactive';
        try {
            await updateDoc(doc(db, 'clients', user.id), {
                status: newStatus
            });
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Failed to update status.");
        }
    };

    const filteredUsers = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile?.includes(searchTerm) ||
        user.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
                            placeholder="Search by name, mobile, nic, or username..." 
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
                                <th>NIC</th>
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
                                    <td>{user.nic}</td>
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
                                    <td colSpan="7" className="empty-state">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
