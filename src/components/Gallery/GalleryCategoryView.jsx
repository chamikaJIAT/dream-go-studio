import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import './Gallery.css';

export default function GalleryCategoryView() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [categoryName, setCategoryName] = useState('...');

    useEffect(() => {
        getDoc(doc(db, 'categories', categoryId)).then(docSnap => {
            if(docSnap.exists()) setCategoryName(docSnap.data().name);
        });

        const q = query(collection(db, 'events'), where('categoryId', '==', categoryId));
        const unsub = onSnapshot(q, (snapshot) => {
            const evts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            evts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setEvents(evts);
        });
        return () => unsub();
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
                            {evt.coverUrl ? (
                                <img src={evt.coverUrl} alt={evt.name} loading="lazy" />
                            ) : (
                                <div className="placeholder-bg">📅</div>
                            )}
                        </div>
                        <div className="card-overlay">
                            <h3>{evt.name}</h3>
                            {evt.date && <p className="event-date-overlay">{new Date(evt.date).toLocaleDateString()}</p>}
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
