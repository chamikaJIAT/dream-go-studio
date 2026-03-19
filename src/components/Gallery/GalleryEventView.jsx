import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useParams } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import './Gallery.css';

export default function GalleryEventView() {
    const { categoryId, eventId } = useParams();
    const [photos, setPhotos] = useState([]);
    const [eventName, setEventName] = useState('...');
    const [categoryName, setCategoryName] = useState('...');

    useEffect(() => {
        getDoc(doc(db, 'categories', categoryId)).then(docSnap => {
            if(docSnap.exists()) setCategoryName(docSnap.data().name);
        });
        getDoc(doc(db, 'events', eventId)).then(docSnap => {
            if(docSnap.exists()) setEventName(docSnap.data().name);
        });

        const q = query(collection(db, 'photos'), where('eventId', '==', eventId));
        const unsub = onSnapshot(q, (snapshot) => {
            const pts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            pts.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setPhotos(pts);
        });
        return () => unsub();
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
