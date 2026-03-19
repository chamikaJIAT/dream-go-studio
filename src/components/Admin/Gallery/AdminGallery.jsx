import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, deleteDoc, serverTimestamp, orderBy, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase';
import './AdminGallery.css';


export default function AdminGallery() {
    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/duw6bqdkh/image/upload";
    const UPLOAD_PRESET = "dream_uploads";

    const [categories, setCategories] = useState([]);
    const [events, setEvents] = useState([]);
    const [photos, setPhotos] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Form inputs
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newEventName, setNewEventName] = useState('');
    const [newEventDate, setNewEventDate] = useState('');

    const [filesToUpload, setFilesToUpload] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef(null);

    // Fetch Categories
    useEffect(() => {
        const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    // Fetch Events when Category selected
    useEffect(() => {
        if (!selectedCategory) {
            setEvents([]);
            return;
        }
        const q = query(collection(db, 'events'), where('categoryId', '==', selectedCategory.id));
        const unsub = onSnapshot(q, (snapshot) => {
            const evts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Order by createdAt on client side to avoid needing complex index for now
            evts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setEvents(evts);
        });
        return () => unsub();
    }, [selectedCategory]);

    // Fetch Photos when Event selected
    useEffect(() => {
        if (!selectedEvent) {
            setPhotos([]);
            return;
        }
        const q = query(collection(db, 'photos'), where('eventId', '==', selectedEvent.id));
        const unsub = onSnapshot(q, (snapshot) => {
            const pts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            pts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setPhotos(pts);
        });
        return () => unsub();
    }, [selectedEvent]);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            await addDoc(collection(db, 'categories'), {
                name: newCategoryName.trim(),
                createdAt: serverTimestamp(),
                coverUrl: ''
            });
            setNewCategoryName('');
        } catch (err) {
            console.error("Create category failed", err);
            alert("Failed to create category");
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!newEventName.trim() || !selectedCategory) return;
        try {
            await addDoc(collection(db, 'events'), {
                name: newEventName.trim(),
                date: newEventDate,
                categoryId: selectedCategory.id,
                createdAt: serverTimestamp(),
                coverUrl: ''
            });
            setNewEventName('');
            setNewEventDate('');
        } catch (err) {
            console.error("Create event failed", err);
            alert("Failed to create event");
        }
    };

    const handleDeleteCategory = async (cat) => {
        if (!window.confirm(`Delete category "${cat.name}"? This won't automatically delete nested events/photos yet.`)) return;
        try {
            await deleteDoc(doc(db, 'categories', cat.id));
            if (selectedCategory?.id === cat.id) setSelectedCategory(null);
        } catch (err) {
            console.error("Delete category failed", err);
        }
    };

    const handleDeleteEvent = async (evt) => {
        if (!window.confirm(`Delete event "${evt.name}"? This won't automatically delete photos yet.`)) return;
        try {
            await deleteDoc(doc(db, 'events', evt.id));
            if (selectedEvent?.id === evt.id) setSelectedEvent(null);
        } catch (err) {
            console.error("Delete event failed", err);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFilesToUpload(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const removeFileFromSelection = (index) => {
        setFilesToUpload(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const submitPhotosUpload = async () => {
        if (filesToUpload.length === 0 || !selectedEvent) return;
        setIsUploading(true);
        let uploadedCount = 0;

        try {
            const batchImages = [];

            for (let i = 0; i < filesToUpload.length; i++) {
                const file = filesToUpload[i];

                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);

                const response = await fetch(CLOUDINARY_URL, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error("Failed to upload to Cloudinary");
                }

                const data = await response.json();
                const downloadUrl = data.secure_url;

                batchImages.push({
                    eventId: selectedEvent.id,
                    url: downloadUrl,
                    createdAt: serverTimestamp()
                });

                uploadedCount++;
                setUploadProgress(Math.round((uploadedCount / filesToUpload.length) * 100));
            }

            const batch = writeBatch(db);
            const firstPhotoUrl = batchImages[0].url;

            batchImages.forEach(imgData => {
                const newDocRef = doc(collection(db, 'photos'));
                batch.set(newDocRef, imgData);
            });

            if (!selectedEvent.coverUrl) {
                const eventRef = doc(db, 'events', selectedEvent.id);
                batch.update(eventRef, { coverUrl: firstPhotoUrl });
            }

            await batch.commit();

            setFilesToUpload([]);
            setPreviews([]);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed. Make sure Storage rules allow writes.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const cancelUpload = () => {
        setFilesToUpload([]);
        setPreviews([]);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDeletePhoto = async (photo) => {
        if (window.confirm('Are you sure you want to remove this photo?')) {
            try {
                // Delete reference from Firestore
                await deleteDoc(doc(db, 'photos', photo.id));
                // Note: Deleting the actual file from Cloudinary requires a backend secret,
                // so we simply remove it from the DB. It will no longer show up.
            } catch (err) {
                console.error("Delete photo failed", err);
            }
        }
    };

    const renderBreadcrumbs = () => {
        return (
            <div className="admin-breadcrumbs">
                <span onClick={() => { setSelectedCategory(null); setSelectedEvent(null); }} className={!selectedCategory ? 'active' : ''}>
                    Categories
                </span>
                {selectedCategory && (
                    <>
                        <span className="separator">/</span>
                        <span onClick={() => setSelectedEvent(null)} className={!selectedEvent ? 'active' : ''}>
                            {selectedCategory.name}
                        </span>
                    </>
                )}
                {selectedEvent && (
                    <>
                        <span className="separator">/</span>
                        <span className="active">{selectedEvent.name}</span>
                    </>
                )}
            </div>
        );
    };

    const renderCategoriesView = () => (
        <div className="view-section">
            <form onSubmit={handleCreateCategory} className="admin-inline-form">
                <input
                    type="text"
                    placeholder="New Category Name (e.g. Wedding)"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    required
                />
                <button type="submit" className="btn-primary">Add Category</button>
            </form>

            <div className="admin-grid">
                {categories.map(cat => (
                    <div key={cat.id} className="admin-card" onClick={() => setSelectedCategory(cat)}>
                        <div className="card-image-placeholder">
                            {cat.coverUrl ? <img src={cat.coverUrl} alt={cat.name} /> : <span className="icon-placeholder">📁</span>}
                        </div>
                        <div className="card-info">
                            <h4>{cat.name}</h4>
                            <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}>🗑️</button>
                        </div>
                    </div>
                ))}
                {categories.length === 0 && <p className="empty-message">No categories found. Create one above.</p>}
            </div>
        </div>
    );

    const renderEventsView = () => (
        <div className="view-section">
            <form onSubmit={handleCreateEvent} className="admin-inline-form multi-input">
                <input
                    type="text"
                    placeholder="Event Name (e.g. Nipun & Chathu)"
                    value={newEventName}
                    onChange={e => setNewEventName(e.target.value)}
                    required
                />
                <input
                    type="date"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                />
                <button type="submit" className="btn-primary">Add Event</button>
            </form>

            <div className="admin-grid">
                {events.map(evt => (
                    <div key={evt.id} className="admin-card" onClick={() => setSelectedEvent(evt)}>
                        <div className="card-image-placeholder">
                            {evt.coverUrl ? <img src={evt.coverUrl} alt={evt.name} /> : <span className="icon-placeholder">📅</span>}
                        </div>
                        <div className="card-info">
                            <div>
                                <h4>{evt.name}</h4>
                                {evt.date && <small className="event-date">{new Date(evt.date).toLocaleDateString()}</small>}
                            </div>
                            <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); handleDeleteEvent(evt); }}>🗑️</button>
                        </div>
                    </div>
                ))}
                {events.length === 0 && <p className="empty-message">No events found in this category.</p>}
            </div>
        </div>
    );

    const renderPhotosView = () => (
        <div className="view-section">
            <div className="upload-section">
                <h3>Upload Photos to "{selectedEvent.name}"</h3>
                <div className="upload-box" onClick={handleUploadClick}>
                    <div className="upload-icon">☁️</div>
                    <p>Click to browse or drag and drop multiple photos</p>
                    <span className="upload-hint">JPG, PNG, WEBP allowed</span>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        hidden
                    />
                </div>

                {previews.length > 0 && (
                    <div className="upload-actions-panel">
                        <h4>Selected ({previews.length})</h4>
                        <div className="previews-grid">
                            {previews.map((src, i) => (
                                <div key={i} className="preview-item">
                                    <img src={src} alt={`preview-${i}`} />
                                    <button className="remove-preview-btn" onClick={() => removeFileFromSelection(i)}>✕</button>
                                </div>
                            ))}
                        </div>

                        {isUploading && (
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                                <span>{uploadProgress}%</span>
                            </div>
                        )}

                        <div className="upload-buttons">
                            <button className="btn-primary" onClick={submitPhotosUpload} disabled={isUploading}>
                                {isUploading ? 'Uploading...' : `Upload ${previews.length} Photos`}
                            </button>
                            <button className="btn-secondary" onClick={cancelUpload} disabled={isUploading}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="gallery-admin-grid">
                {photos.map(photo => (
                    <div key={photo.id} className="admin-gallery-item">
                        <img src={photo.url} alt="Gallery item" loading="lazy" />
                        <div className="item-overlay-admin">
                            <button className="delete-photo-btn" onClick={() => handleDeletePhoto(photo)} title="Delete Photo">
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
                {photos.length === 0 && <p className="empty-message">No photos in this event yet.</p>}
            </div>
        </div>
    );

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>Gallery Management</h2>
                <p>Organize photos into Categories and Events.</p>
                {renderBreadcrumbs()}
            </div>

            <div className="gallery-management-content">
                {!selectedCategory && renderCategoriesView()}
                {selectedCategory && !selectedEvent && renderEventsView()}
                {selectedEvent && renderPhotosView()}
            </div>
        </div>
    );
}
