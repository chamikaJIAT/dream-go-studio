import { useState, useEffect } from 'react';
import { apiCall } from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import './Gallery.css';

export default function GalleryCategoryView() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [categoryName, setCategoryName] = useState('...');

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                // Fetch events
                const resEvents = await apiCall(`/gallery/events/${categoryId}`);
                setEvents(resEvents.events);

                // Fetch category list to find our specific one (for name)
                const resCats = await apiCall('/gallery/categories');
                const cat = resCats.categories.find(c => c.id === categoryId);
                if (cat) setCategoryName(cat.name);
            } catch (err) {
                console.error("Failed to fetch gallery data:", err);
            }
        };
        fetchCategoryData();
    }, [categoryId]);

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h1>{categoryName}</h1>
                <Breadcrumbs paths={[
                    { label: 'Home', url: '/' },
                    { label: 'Gallery', url: '/gallery' },
                    { label: categoryName, url: null }
                ]} />
            </div>

            <div className="gallery-grid">
                {events.map((evt) => (
                    <div key={evt.id} className="gallery-card" onClick={() => navigate(`/gallery/${categoryId}/${evt.id}`)}>
                        <div className="card-image">
                            {evt.coverImage ? (
                                <img src={evt.coverImage} alt={evt.title} loading="lazy" />
                            ) : (
                                <div className="placeholder-bg">📅</div>
                            )}
                        </div>
                        <div className="card-overlay">
                            <h3>{evt.title}</h3>
                            {evt.createdAt && <p className="event-date-overlay">{new Date(evt.createdAt).toLocaleDateString()}</p>}
                        </div>
                    </div>
                ))}
                {events.length === 0 && (
                    <div className="empty-gallery">
                        No events found in this category yet.
                    </div>
                )}
            </div>
        </div>
    );
}
