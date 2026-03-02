import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import './AdminPackages.css';

export default function AdminPackages() {
    const [packages, setPackages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPackage, setCurrentPackage] = useState({ id: '', title: '', price: '', description: '' });

    // Fetch real-time data from Firestore
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'packages'), (snapshot) => {
            const pData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPackages(pData);
        });
        return () => unsub();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPackage({ ...currentPackage, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Optimistic UI update
        const pkgDataToSave = {
            title: currentPackage.title,
            price: currentPackage.price,
            description: currentPackage.description,
            createdAt: new Date().toISOString()
        };

        try {
            if (isEditing) {
                // Optimistic Local State Update
                setPackages(prev => prev.map(p => p.id === currentPackage.id ? { id: currentPackage.id, ...pkgDataToSave } : p));

                // Firestore Async Update
                const pkgRef = doc(db, 'packages', currentPackage.id);
                updateDoc(pkgRef, pkgDataToSave).catch(err => console.error('Silent Update Error:', err));
            } else {
                // Optimistic Local State Update
                const tempId = 'temp-' + Date.now();
                setPackages(prev => [...prev, { id: tempId, ...pkgDataToSave }]);

                // Firestore Async Add
                addDoc(collection(db, 'packages'), pkgDataToSave)
                    .then(docRef => {
                        console.log("Written successfully to Firestore with ID: " + docRef.id);
                        // Replace temp ID with real ID
                        setPackages(prev => prev.map(p => p.id === tempId ? { id: docRef.id, ...pkgDataToSave } : p));
                    })
                    .catch(err => console.error('Silent Add Error:', err));
            }
            resetForm();
        } catch (err) {
            console.error('Error in handle submit block: ', err);
            alert('Failed to save package logic.');
        }
    };

    const handleEdit = (pkg) => {
        setCurrentPackage(pkg);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this package?')) {
            try {
                await deleteDoc(doc(db, 'packages', id));
            } catch (err) {
                console.error('Error deleting package:', err);
            }
        }
    };

    const resetForm = () => {
        setCurrentPackage({ id: '', title: '', price: '', description: '' });
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
