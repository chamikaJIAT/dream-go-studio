import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, deleteDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../firebase';
import './AdminGallery.css';

export default function AdminGallery() {
    const [photos, setPhotos] = useState([]);
    const [preview, setPreview] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);
    const [newCategory, setNewCategory] = useState('Wedding');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch real-time gallery data
    useEffect(() => {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const gData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPhotos(gData);
        });
        return () => unsub();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileToUpload(file);
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const submitUpload = async () => {
        if (fileToUpload) {
            setIsUploading(true);
            try {
                // Upload image to Firebase Storage
                const fileRef = storageRef(storage, `gallery/${Date.now()}_${fileToUpload.name}`);
                await uploadBytes(fileRef, fileToUpload);
                const downloadUrl = await getDownloadURL(fileRef);

                // Save URL and metadata to Firestore
                await addDoc(collection(db, 'gallery'), {
                    url: downloadUrl,
                    category: newCategory,
                    storagePath: fileRef.fullPath,
                    createdAt: serverTimestamp()
                });

                setPreview(null);
                setFileToUpload(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } catch (err) {
                console.error("Upload failed", err);
                alert("Upload failed. Make sure Storage rules allow writes.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const cancelUpload = () => {
        setPreview(null);
        setFileToUpload(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDelete = async (photo) => {
        if (window.confirm('Are you sure you want to remove this photo from the gallery?')) {
            try {
                // Delete from Firestore
                await deleteDoc(doc(db, 'gallery', photo.id));
                // Delete from Storage if it exists
                if (photo.storagePath) {
                    const fileRef = storageRef(storage, photo.storagePath);
                    await deleteObject(fileRef).catch(e => console.log('Storage obj not found or already deleted'));
                }
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
    };

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>Gallery Management</h2>
                <p>Upload new masterpieces or remove older ones from the public portfolio.</p>
            </div>

            <div className="gallery-management-content">

                {/* Upload Section */}
                <div className="upload-section">
                    <h3>Upload New Photo</h3>
                    <div className="upload-box" onClick={!preview ? handleUploadClick : undefined}>
                        {!preview ? (
                            <>
                                <div className="upload-icon">☁️</div>
                                <p>Click to browse or drag and drop</p>
                                <span className="upload-hint">JPG, PNG, WEBP (Max 5MB)</span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    hidden
                                />
                            </>
                        ) : (
                            <div className="preview-container">
                                <img src={preview} alt="Upload Preview" className="preview-image" />
                            </div>
                        )}
                    </div>

                    {preview && (
                        <div className="upload-actions-panel">
                            <div className="input-group">
                                <label>Tag Category</label>
                                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                                    <option value="Wedding">Wedding</option>
                                    <option value="Homecoming">Homecoming</option>
                                    <option value="Pre-Shoot">Pre-Shoot</option>
                                </select>
                            </div>
                            <div className="upload-buttons">
                                <button className="btn-primary" onClick={submitUpload} disabled={isUploading}>
                                    {isUploading ? 'Uploading...' : 'Confirm Upload'}
                                </button>
                                <button className="btn-secondary" onClick={cancelUpload} disabled={isUploading}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Existing Gallery Grid */}
                <div className="gallery-admin-grid">
                    {photos.map(photo => (
                        <div key={photo.id} className="admin-gallery-item">
                            <img src={photo.url} alt="Gallery item" />
                            <div className="item-overlay-admin">
                                <span className="category-tag">{photo.category}</span>
                                <button className="delete-photo-btn" onClick={() => handleDelete(photo)} title="Delete Photo">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    {photos.length === 0 && (
                        <div className="empty-state">No photos in the gallery.</div>
                    )}
                </div>

            </div>
        </div>
    );
}
