import { useState, useEffect } from 'react';
import { apiCall } from '../../api';
import { useParams } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import './Gallery.css';

export default function GalleryEventView() {
    const { categoryId, eventId } = useParams();
    const [photos, setPhotos] = useState([]);
    const [eventName, setEventName] = useState('...');
    const [categoryName, setCategoryName] = useState('...');

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                // Fetch images
                const resImages = await apiCall(`/gallery/images/${eventId}`);
                setPhotos(resImages.images);

                // Fetch categories and events for names (Breadcrumbs)
                const resCats = await apiCall('/gallery/categories');
                const cat = resCats.categories.find(c => c.id === categoryId);
                if (cat) setCategoryName(cat.name);

                const resEvts = await apiCall(`/gallery/events/${categoryId}`);
                const evt = resEvts.events.find(e => e.id === eventId);
                if (evt) setEventName(evt.title);
            } catch (err) {
                console.error("Failed to fetch gallery event data:", err);
            }
        };
        fetchEventData();
    }, [categoryId, eventId]);

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h1>{eventName}</h1>
                <Breadcrumbs paths={[
                    { label: 'Home', url: '/' },
                    { label: 'Gallery', url: '/gallery' },
                    { label: categoryName, url: `/gallery/${categoryId}` },
                    { label: eventName, url: null }
                ]} />
            </div>

            <div className="gallery-photo-grid">
                {photos.map((photo) => (
                    <div key={photo.id} className="photo-item">
                        <img src={photo.url} alt="Event moment" loading="lazy" />
                    </div>
                ))}
                {photos.length === 0 && (
                    <div className="empty-gallery">
                        No photos uploaded for this event.
                    </div>
                )}
            </div>
        </div>
    );
}
