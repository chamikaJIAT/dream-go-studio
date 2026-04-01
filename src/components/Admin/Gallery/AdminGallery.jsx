import { useState, useRef, useEffect } from 'react';
import { apiCall, API_BASE_URL } from '../../../api';
import './AdminGallery.css';


export default function AdminGallery() {
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
    const admin = JSON.parse(localStorage.getItem('user') || '{}');

    // Fetch Categories
    const fetchCategories = async () => {
        try {
            const res = await apiCall('/gallery/categories');
            setCategories(res.categories);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch Events when Category selected
    const fetchEvents = async () => {
        if (!selectedCategory) {
            setEvents([]);
            return;
        }
        try {
            const res = await apiCall(`/gallery/events/${selectedCategory.id}`);
            // Order by createdAt local
            const evts = res.events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setEvents(evts);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [selectedCategory]);

    // Fetch Photos when Event selected
    const fetchPhotos = async () => {
        if (!selectedEvent) {
            setPhotos([]);
            return;
        }
        try {
            const res = await apiCall(`/gallery/images/${selectedEvent.id}`);
            setPhotos(res.images);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, [selectedEvent]);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        try {
            await apiCall('/gallery/categories', {
                method: 'POST',
                body: JSON.stringify({ 
                    name: newCategoryName.trim(), 
                    description: '',
                    performingAdminId: admin.id,
                    performingAdminName: admin.name
                })
            });
            setNewCategoryName('');
            fetchCategories();
        } catch (err) {
            console.error("Create category failed", err);
            alert("Failed to create category");
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!newEventName.trim() || !selectedCategory) return;
        try {
            await apiCall('/gallery/events', {
                method: 'POST',
                body: JSON.stringify({ 
                    categoryId: selectedCategory.id, 
                    title: newEventName.trim(),
                    date: newEventDate,
                    performingAdminId: admin.id,
                    performingAdminName: admin.name
                })
            });
            setNewEventName('');
            setNewEventDate('');
            fetchEvents();
        } catch (err) {
            console.error("Create event failed", err);
            alert("Failed to create event");
        }
    };

    const handleDeleteCategory = async (cat) => {
        if (!window.confirm(`Delete category "${cat.name}"? This will delete attached events/photos in database.`)) return;
        try {
            await apiCall(`/gallery/categories/${cat.id}?performingAdminId=${admin.id}&performingAdminName=${encodeURIComponent(admin.name)}`, { method: 'DELETE' });
            if (selectedCategory?.id === cat.id) setSelectedCategory(null);
            fetchCategories();
        } catch (err) {
            console.error("Delete category failed", err);
        }
    };

    const handleDeleteEvent = async (evt) => {
        if (!window.confirm(`Delete event "${evt.title || evt.name}"?`)) return;
        try {
            await apiCall(`/gallery/events/${evt.id}?performingAdminId=${admin.id}&performingAdminName=${encodeURIComponent(admin.name)}`, { method: 'DELETE' });
            if (selectedEvent?.id === evt.id) setSelectedEvent(null);
            fetchEvents();
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

        try {
            const formData = new FormData();
            formData.append('eventId', selectedEvent.id);
            filesToUpload.forEach(file => {
                formData.append('images', file);
            });

            formData.append('performingAdminId', admin.id);
            formData.append('performingAdminName', admin.name);

            await apiCall('/gallery/images', {
                method: 'POST',
                body: formData
            });

            setFilesToUpload([]);
            setPreviews([]);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchPhotos(); // Refresh newly uploaded images
            fetchEvents(); // Event cover might update
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed. Make sure server accepts the size constraints.");
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
                await apiCall(`/gallery/images/${photo.id}?performingAdminId=${admin.id}&performingAdminName=${encodeURIComponent(admin.name)}`, { method: 'DELETE' });
                fetchPhotos();
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
                        <span className="active">{selectedEvent.title || selectedEvent.name}</span>
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
                            {evt.coverImage || evt.coverUrl ? <img src={evt.coverImage || evt.coverUrl} alt={evt.title || evt.name} /> : <span className="icon-placeholder">📅</span>}
                        </div>
                        <div className="card-info">
                            <div>
                                <h4>{evt.title || evt.name}</h4>
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
                <h3>Upload Photos to "{selectedEvent.title || selectedEvent.name}"</h3>
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
                                <div className="progress-bar" style={{ width: `100%`, animation: 'pulse 1.5s infinite' }}></div>
                            </div>
                        )}

                        <div className="upload-buttons">
                            <button className="btn-primary" onClick={submitPhotosUpload} disabled={isUploading}>
                                {isUploading ? 'Uploading Please Wait...' : `Upload ${previews.length} Photos to Server`}
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
