import { useState, useEffect } from 'react';
import { apiCall } from '../../api';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import './Gallery.css';

export default function Gallery() {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await apiCall('/gallery/categories');
                setCategories(res.categories);
            } catch (err) {
                console.error("Failed to fetch gallery categories:", err);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h1>Our Masterpieces</h1>
                <p>Explore beautiful memories, sorted by category.</p>
                <Breadcrumbs paths={[{ label: 'Home', url: '/' }, { label: 'Gallery', url: null }]} />
            </div>

            <div className="gallery-grid">
                {categories.map((cat) => (
                    <div key={cat.id} className="gallery-card" onClick={() => navigate(`/gallery/${cat.id}`)}>
                        <div className="card-image">
                            {cat.coverImage ? (
                                <img src={cat.coverImage} alt={cat.name} loading="lazy" />
                            ) : (
                                <div className="placeholder-bg">📁</div>
                            )}
                        </div>
                        <div className="card-overlay">
                            <h3>{cat.name}</h3>
                        </div>
                    </div>
                ))}
                {categories.length === 0 && (
                    <div className="empty-gallery">
                        Our gallery is currently being curated. Come back soon!
                    </div>
                )}
            </div>
        </div>
    );
}
