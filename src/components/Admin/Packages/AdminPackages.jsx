import { useState, useEffect } from 'react';
import { apiCall } from '../../../api';
import './AdminPackages.css';

export default function AdminPackages() {
    const [packages, setPackages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPackage, setCurrentPackage] = useState({ id: '', title: '', price: '', category: 'Wedding', description: '' });
    const admin = JSON.parse(localStorage.getItem('user') || '{}');

    // Fetch real-time data from API
    const fetchPackages = async () => {
        try {
            const res = await apiCall('/packages');
            setPackages(res.packages);
        } catch (err) {
            console.error('Failed to fetch packages', err);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPackage({ ...currentPackage, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const pkgDataToSave = {
            title: currentPackage.title,
            price: currentPackage.price,
            category: currentPackage.category,
            description: currentPackage.description,
            adminId: admin.id,
            adminName: admin.name,
            adminRole: admin.role
        };

        try {
            if (isEditing) {
                await apiCall(`/packages/${currentPackage.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(pkgDataToSave)
                });
            } else {
                await apiCall('/packages', {
                    method: 'POST',
                    body: JSON.stringify(pkgDataToSave)
                });
            }
            resetForm();
            fetchPackages();
        } catch (err) {
            console.error('Error saving package: ', err);
            alert('Failed to save package.');
        }
    };

    const handleEdit = (pkg) => {
        setCurrentPackage(pkg);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                await apiCall(`/packages/${id}?adminId=${admin.id}&adminName=${encodeURIComponent(admin.name)}`, { method: 'DELETE' });
                fetchPackages();
            } catch (err) {
                console.error('Error deleting package:', err);
                alert('Failed to delete package.');
            }
        }
    };

    const resetForm = () => {
        setCurrentPackage({ id: '', title: '', price: '', category: 'Wedding', description: '' });
        setIsEditing(false);
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>Package Management</h2>
                <p>Add, edit, or remove photography packages shown to customers.</p>
            </div>

            <div className="packages-content">
                {/* Left Side: Package Form */}
                <div className="package-editor">
                    <h3>{isEditing ? 'Edit Package' : 'Add New Package'}</h3>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="input-group">
                            <label>Package Title</label>
                            <input
                                type="text"
                                name="title"
                                value={currentPackage.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Birthday Party"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Price</label>
                            <input
                                type="text"
                                name="price"
                                value={currentPackage.price}
                                onChange={handleInputChange}
                                placeholder="e.g. LKR 40,000"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={currentPackage.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="Wedding">Wedding</option>
                                <option value="Videography">Videography</option>
                                <option value="Engagement">Engagement</option>
                                <option value="Pre-Shoot">Pre-Shoot</option>
                                <option value="Birthday Party">Birthday Party</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Description (Features)</label>
                            <textarea
                                name="description"
                                value={currentPackage.description}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="List features..."
                                required
                            ></textarea>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {isEditing ? 'Save Changes' : 'Add Package'}
                            </button>
                            {isEditing && (
                                <button type="button" className="btn-secondary" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right Side: Packages List */}
                <div className="packages-list">
                    {packages.map(pkg => (
                        <div key={pkg.id} className="package-card-admin">
                            <div className="package-info">
                                <h4>{pkg.title} <span className="price-badge">{pkg.price}</span></h4>
                                <span className="category-badge">{pkg.category || 'Uncategorized'}</span>
                                <p>{pkg.description}</p>
                            </div>
                            <div className="package-actions">
                                <button className="action-btn edit" onClick={() => handleEdit(pkg)}>✏️</button>
                                <button className="action-btn delete" onClick={() => handleDelete(pkg.id)}>🗑️</button>
                            </div>
                        </div>
                    ))}

                    {packages.length === 0 && (
                        <div className="empty-state">No packages created yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
