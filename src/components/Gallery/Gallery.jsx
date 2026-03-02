import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import './Gallery.css';

export default function Gallery() {
    const [galleryImages, setGalleryImages] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const gData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGalleryImages(gData);
        });
        return () => unsub();
    }, []);

    return (
        <div className="gallery-container">
            <div className="gallery-header">
                <h1>Our Masterpieces</h1>
                <p>A glimpse into the beautiful memories we've captured over the years.</p>
            </div>

            <div className="gallery-grid">
                {galleryImages.map((img) => (
                    <div key={img.id} className="gallery-item">
                        <img src={img.url} alt={img.title || 'Studio moment'} loading="lazy" />
                        <div className="item-overlay">
                            <span className="category-badge">{img.category}</span>
                            <h3>{img.title || img.category}</h3>
                        </div>
                    </div>
                ))}
                {galleryImages.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        Our gallery is currently being curated. Come back soon!
                    </div>
                )}
            </div>
        </div>
    );
}
