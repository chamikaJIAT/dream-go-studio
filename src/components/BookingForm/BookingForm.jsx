import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { AuthContext } from '../../context/AuthContext';
import ClientAuth from '../ClientAuth/ClientAuth';
import './BookingForm.css';

// Fix for default marker icon in leaflet with react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

// Component to programmatically update map center
function MapUpdater({ center }) {
    const map = useMapEvents({});
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13);
        }
    }, [center, map]);
    return null;
}

const carouselImages = [
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1000&auto=format&fit=crop'
];

export default function BookingForm() {
    const { user } = useContext(AuthContext);
    const [showAuthForm, setShowAuthForm] = useState(false);

    const [packages, setPackages] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        selectedPackage: '',
        hotelName: ''
    });

    // Default to Colombo center
    const [location, setLocation] = useState({ lat: 6.9271, lng: 79.8612 });
    const [submitted, setSubmitted] = useState(false);

    // Search specific states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Carousel state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Fetch Packages
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'packages'), (snapshot) => {
            const pData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Fetched packages from Firestore:", pData);
            setPackages(pData);
        });
        return () => unsub();
    }, []);

    // Carousel Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(timer);
    }, []);

    // Auto-fill form data if user is logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                mobile: user.mobile || ''
            }));
            setShowAuthForm(false);
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching location:', error);
            // Optionally could show an alert here
        } finally {
            setIsSearching(false);
        }
    };

    const selectSearchResult = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setLocation({ lat, lng });
        setSearchResults([]);
        setSearchQuery(result.display_name); // Set input to selected name
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Please log in to submit a booking.");
            setShowAuthForm(true);
            return;
        }

        if (formData.name && formData.mobile && formData.selectedPackage && formData.hotelName) {
            try {
                const pkgDetails = packages.find(p => p.id === formData.selectedPackage);

                await addDoc(collection(db, 'bookings'), {
                    customerId: user.id || null, // Link to the authenticated user
                    customerName: formData.name,
                    mobile: formData.mobile,
                    packageId: formData.selectedPackage,
                    packageTitle: pkgDetails ? pkgDetails.title : 'Unknown Package',
                    hotelName: formData.hotelName,
                    location: { lat: location.lat, lng: location.lng },
                    status: 'Pending',
                    createdAt: serverTimestamp()
                });

                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 5000);

                // Keep name and mobile intact since they are tied to account
                setFormData(prev => ({ ...prev, selectedPackage: '', hotelName: '' }));
                setLocation({ lat: 6.9271, lng: 79.8612 });
            } catch (err) {
                console.error('Error submitting booking:', err);
                alert('Failed to submit booking request. Please try again.');
            }
        }
    };

    return (
        <div className="booking-container">
            <div className="booking-wrapper">

                {/* Left Side: Form or Auth */}
                <div className="booking-form-section scrollable-section">

                    {showAuthForm && !user ? (
                        <div className="auth-wrapper">
                            <ClientAuth
                                onAuthSuccess={() => setShowAuthForm(false)}
                                onCancel={() => setShowAuthForm(false)}
                            />
                        </div>
                    ) : !user ? (
                        <div className="pre-booking-state">
                            <div className="booking-header">
                                <h2><span className="h2-accent">✨</span> Book Your Session</h2>
                                <p>Join Dream Go Studio to reserve your perfect moment.</p>
                            </div>

                            <div className="login-prompt">
                                <h3>You must be registered to make a booking</h3>
                                <p>Quickly sign up or log in to continue booking your photography package.</p>
                                <button className="submit-button book-now-btn" onClick={() => setShowAuthForm(true)}>
                                    Register / Log In Now
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="booking-state">
                            <div className="booking-header">
                                <h2><span className="h2-accent">✨</span> Book Your Session</h2>
                                <p>Welcome back, {user.name.split(' ')[0]}! Let's get your event scheduled.</p>
                            </div>

                            {submitted && (
                                <div className="success-message">
                                    Thanks! Your booking request has been received.
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="booking-form">
                                <div className="input-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="mobile">Mobile Number</label>
                                    <input
                                        type="tel"
                                        id="mobile"
                                        name="mobile"
                                        placeholder="e.g. 077 123 4567"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="hotelName">Hotel / Event Venue Name</label>
                                    <input
                                        type="text"
                                        id="hotelName"
                                        name="hotelName"
                                        placeholder="e.g. Shangri-La, Colombo"
                                        value={formData.hotelName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group map-group">
                                    <label>Select Precise Location</label>

                                    {/* Location Search Input */}
                                    <div className="location-search-container">
                                        <input
                                            type="text"
                                            placeholder="Search for a location (e.g. Galle Face)"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="location-search-input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSearch();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSearch}
                                            className="search-button"
                                            disabled={isSearching}
                                        >
                                            {isSearching ? 'Searching...' : 'Search'}
                                        </button>

                                        {/* Search Results Dropdown */}
                                        {searchResults.length > 0 && (
                                            <ul className="search-results-dropdown">
                                                {searchResults.map((result) => (
                                                    <li
                                                        key={result.place_id}
                                                        onClick={() => selectSearchResult(result)}
                                                        className="search-result-item"
                                                    >
                                                        {result.display_name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <p className="map-help-text">Or click on the map to place a pin at your exact event location</p>
                                    <div className="map-wrapper">
                                        <MapContainer center={[6.9271, 79.8612]} zoom={11} scrollWheelZoom={true} className="leaflet-map">
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <MapUpdater center={[location.lat, location.lng]} />
                                            <LocationMarker position={location} setPosition={setLocation} />
                                        </MapContainer>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="selectedPackage">Select Package</label>
                                    <div className="custom-select-wrapper">
                                        <select
                                            id="selectedPackage"
                                            name="selectedPackage"
                                            value={formData.selectedPackage}
                                            onChange={handleChange}
                                            required
                                            className="package-dropdown"
                                        >
                                            <option value="" disabled>Select a package...</option>
                                            {packages.map((pkg) => (
                                                <option key={pkg.id} value={pkg.id}>
                                                    {pkg.title}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="select-arrow">▼</div>
                                    </div>

                                    {formData.selectedPackage && packages.find(p => p.id === formData.selectedPackage) && (
                                        <div className="selected-package-details">
                                            <div className="pkg-price-badge">
                                                {packages.find(p => p.id === formData.selectedPackage).price}
                                            </div>
                                            <p className="pkg-desc">
                                                {packages.find(p => p.id === formData.selectedPackage).description}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="submit-button">
                                    Confirm Booking
                                </button>
                            </form>
                        </div>
                    )}

                </div>

                {/* Right Side: Carousel Image Area */}
                <div className="booking-image-section">
                    {/* Carousel Backgrounds */}
                    {carouselImages.map((img, index) => (
                        <div
                            key={index}
                            className={`carousel-slide ${index === currentImageIndex ? 'active' : ''}`}
                            style={{ backgroundImage: `url('${img}')` }}
                        ></div>
                    ))}

                    {/* Dark gradient overlay on the image for readability */}
                    <div className="carousel-overlay"></div>

                    <div className="image-overlay-content">
                        <h1>DREAM GO STUDIO</h1>
                        <p className="tagline">Where moments become eternal memories</p>

                        {/* Carousel Indicators */}
                        <div className="carousel-indicators">
                            {carouselImages.map((_, index) => (
                                <div
                                    key={index}
                                    className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
