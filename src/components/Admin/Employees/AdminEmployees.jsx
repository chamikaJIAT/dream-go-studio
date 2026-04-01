import { useState, useEffect } from 'react';
import { apiCall } from '../../../api';
import './AdminEmployees.css';

export default function AdminEmployees() {
    const [employees, setEmployees] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    
    const initialFormState = {
        name: '',
        username: '',
        password: '',
        role: 'admin',
        permissions: [] // e.g., ['bookings', 'packages', 'users', 'messages', 'dashboard', 'gallery', 'old-bookings']
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [isAdminValid, setIsAdminValid] = useState(false);
    const performingAdmin = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const adminStr = localStorage.getItem('adminUser');
        if (adminStr) {
            const adminUser = JSON.parse(adminStr);
            if (adminUser.role !== 'superadmin') {
                window.location.hash = '#/admin/dashboard'; // redirect if not super admin
            } else {
                setIsAdminValid(true);
            }
        }
    }, []);

    const availablePages = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'bookings', label: 'Bookings' },
        { id: 'old-bookings', label: 'Old Bookings' },
        { id: 'gallery', label: 'Gallery' },
        { id: 'packages', label: 'Packages' },
        { id: 'messages', label: 'Messages' },
        { id: 'users', label: 'Users' }
    ];

    const fetchEmployees = async () => {
        try {
            const res = await apiCall('/admins');
            setEmployees(res.admins);
        } catch (err) {
            console.error('Failed to fetch admins', err);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionToggle = (pageId) => {
        setFormData(prev => {
            const currentPerms = prev.permissions || [];
            if (currentPerms.includes(pageId)) {
                return { ...prev, permissions: currentPerms.filter(p => p !== pageId) };
            } else {
                return { ...prev, permissions: [...currentPerms, pageId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing && editingId) {
                await apiCall(`/admins/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: formData.name,
                        username: formData.username,
                        password: formData.password,
                        role: formData.role,
                        permissions: formData.permissions,
                        performingAdminId: performingAdmin.id,
                        performingAdminName: performingAdmin.name
                    })
                });
            } else {
                await apiCall('/admins', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: formData.name,
                        username: formData.username,
                        password: formData.password,
                        role: formData.role,
                        permissions: formData.permissions,
                        performingAdminId: performingAdmin.id,
                        performingAdminName: performingAdmin.name
                    })
                });
            }
            resetForm();
            fetchEmployees();
        } catch (error) {
            console.error("Error saving employee:", error);
            alert("Failed to save employee.");
        }
    };

    const handleEdit = (emp) => {
        setFormData({
            name: emp.name || '',
            username: emp.username || '',
            password: emp.password || '',
            role: emp.role || 'admin',
            permissions: emp.permissions || []
        });
        setEditingId(emp.id);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this account?")) {
            try {
                await apiCall(`/admins/${id}?performingAdminId=${performingAdmin.id}&performingAdminName=${encodeURIComponent(performingAdmin.name)}`, { method: 'DELETE' });
                fetchEmployees();
            } catch (error) {
                console.error("Error deleting:", error);
                alert("Failed to delete account");
            }
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setEditingId(null);
    };

    if (!isAdminValid) return <div style={{padding: '2rem', color:'white'}}>Checking permissions...</div>;

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>Employee Management</h2>
                <p>Add and manage admin accounts with localized access permissions.</p>
            </div>

            <div className="employee-content-split">
                
                {/* Form Section */}
                <div className="employee-form-container">
                    <h3>{isEditing ? 'Edit Employee Account' : 'Register New Employee'}</h3>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="input-group">
                            <label>Full Name</label>
                            <input 
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter employee name"
                                required
                            />
                        </div>
                        <div className="input-row">
                            <div className="input-group">
                                <label>Username</label>
                                <input 
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Login Username"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <input 
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Login Password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Role</label>
                            <select name="role" value={formData.role} onChange={handleChange}>
                                <option value="admin">Admin (Employee)</option>
                                <option value="superadmin">Super Admin (Owner)</option>
                            </select>
                        </div>

                        {formData.role === 'admin' && (
                            <div className="permissions-section">
                                <label className="permissions-label">Select Granted Pages</label>
                                <div className="permissions-grid">
                                    {availablePages.map(page => (
                                        <label key={page.id} className="permission-cb">
                                            <input 
                                                type="checkbox"
                                                checked={formData.permissions.includes(page.id)}
                                                onChange={() => handlePermissionToggle(page.id)}
                                            />
                                            {page.label}
                                        </label>
                                    ))}
                                </div>
                                <p className="perm-hint">*Super Admin has access to all pages by default.</p>
                            </div>
                        )}

                        <div className="form-actions" style={{ marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">
                                {isEditing ? 'Save Changes' : 'Create Account'}
                            </button>
                            {isEditing && (
                                <button type="button" className="btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List Section */}
                <div className="employee-list-container">
                    <h3>Registered Accounts</h3>
                    <div className="employee-cards">
                        {employees.map(emp => (
                            <div key={emp.id} className="employee-card">
                                <div className="emp-header">
                                    <h4>{emp.name}</h4>
                                    <span className={`role-badge ${emp.role === 'superadmin' ? 'super' : 'admin'}`}>
                                        {emp.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                    </span>
                                </div>
                                <div className="emp-details">
                                    <p><strong>Username:</strong> {emp.username}</p>
                                    {emp.role === 'admin' && (
                                        <p className="emp-perms">
                                            <strong>Access:</strong> {emp.permissions?.join(', ') || 'None'}
                                        </p>
                                    )}
                                </div>
                                <div className="emp-actions">
                                    <button className="action-btn text-btn" onClick={() => handleEdit(emp)}>Edit</button>
                                    <button className="action-btn text-btn text-danger" onClick={() => handleDelete(emp.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
