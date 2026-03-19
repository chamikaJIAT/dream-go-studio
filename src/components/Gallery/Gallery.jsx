import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import './Gallery.css';

export default function Gallery() {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
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
                            {cat.coverUrl ? (
                                <img src={cat.coverUrl} alt={cat.name} loading="lazy" />
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
