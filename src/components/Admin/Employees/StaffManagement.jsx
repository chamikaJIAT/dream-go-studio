import { useState, useEffect } from 'react';
import { apiCall } from '../../../api';
import './AdminEmployees.css'; // Reusing styling for consistency

export default function StaffManagement() {
    const [staff, setStaff] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    
    const initialFormState = {
        fullName: '',
        position: '',
        email: '',
        phone: '',
        joinDate: '',
        status: 'Active',
        role: 'Staff'
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);

    const fetchStaff = async () => {
        try {
            const data = await apiCall('/employees');
            setStaff(data.employees || data || []);
        } catch (err) {
            console.error('Failed to fetch staff directory', err);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing && editingId) {
                await apiCall(`/employees/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                // Ensure a temporary password if not provided
                await apiCall('/employees', {
                    method: 'POST',
                    body: JSON.stringify({ ...formData, password: 'temporary_password' })
                });
            }
            resetForm();
            fetchStaff();
        } catch (error) {
            console.error("Error saving staff:", error);
            alert("Failed to save staff member: " + error.message);
        }
    };

    const handleEdit = (member) => {
        setFormData({
            fullName: member.fullName || '',
            position: member.position || '',
            email: member.email || '',
            phone: member.phone || '',
            joinDate: member.joinDate || '',
            status: member.status || 'Active',
            role: member.role || 'Staff'
        });
        setEditingId(member.id);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this staff record?")) {
            try {
                await apiCall(`/employees/${id}`, {
                    method: 'DELETE'
                });
                fetchStaff();
            } catch (error) {
                console.error("Error deleting:", error);
                alert("Failed to delete staff record: " + error.message);
            }
        }
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setEditingId(null);
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>Staff Directory Management</h2>
                <p>Manage the full staff directory.</p>
            </div>

            <div className="employee-content-split">
                
                {/* Form Section */}
                <div className="employee-form-container">
                    <h3>{isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="input-group">
                            <label>Full Name</label>
                            <input 
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Full name of employee"
                                required
                            />
                        </div>
                        
                        <div className="input-row">
                            <div className="input-group">
                                <label>Position</label>
                                <input 
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    placeholder="Position (e.g., Photographer)"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Join Date</label>
                                <input 
                                    type="date"
                                    name="joinDate"
                                    value={formData.joinDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <input 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email address"
                            />
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Phone Number</label>
                                <input 
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Contact phone"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="Active">Active</option>
                                    <option value="On Leave">On Leave</option>
                                    <option value="Resigned">Resigned</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions" style={{ marginTop: '1rem' }}>
                            <button type="submit" className="btn-primary">
                                {isEditing ? 'Save Changes' : 'Add Member'}
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
                    <h3>Staff List</h3>
                    <div className="employee-cards">
                        {staff.length === 0 ? (
                            <p style={{color: '#94a3b8'}}>No staff members added yet.</p>
                        ) : (
                            staff.map(member => (
                                <div key={member.id} className="employee-card">
                                    <div className="emp-header">
                                        <h4>{member.fullName}</h4>
                                        <span className={`role-badge ${member.status.toLowerCase().replace(' ', '-')}`}>
                                            {member.status}
                                        </span>
                                    </div>
                                    <div className="emp-details">
                                        <p><strong>Position:</strong> {member.position}</p>
                                        <p><strong>Phone:</strong> {member.phone}</p>
                                        <p><strong>Joined:</strong> {member.joinDate || 'N/A'}</p>
                                    </div>
                                    <div className="emp-actions">
                                        <button className="action-btn text-btn" onClick={() => handleEdit(member)}>Edit</button>
                                        <button className="action-btn text-btn text-danger" onClick={() => handleDelete(member.id)}>Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
