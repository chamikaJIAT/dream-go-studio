import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiCall } from '../../api';
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
        selectedCategory: '',
        hotelName: '',
        bookingDate: '',
        coupleName: '',
        birthdayPersonName: ''
    });
    const [selectedPackageIds, setSelectedPackageIds] = useState([]);

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
    const fetchPackages = async () => {
        try {
            const res = await apiCall('/packages');
            setPackages(res.packages);
        } catch (err) {
            console.error('Failed to fetch packages:', err);
        }
    };

    useEffect(() => {
        fetchPackages();
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

    // Debounced Map Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length > 2) {
                // To avoid double searching, we will rely on onKeyUp mostly
                // handleSearch(); 
            } else if (searchQuery.trim().length === 0) {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleKeyUp = (e) => {
        if (searchQuery.trim().length > 2) {
            handleSearch();
        }
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

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

    // Derive unique categories from fetched packages
    const categories = [...new Set(packages.map(p => p.category || 'Wedding'))];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (queryOverride = null) => {
        const queryToSearch = queryOverride || searchQuery;
        if (!queryToSearch.trim()) return;

        setIsSearching(true);
        try {
            // Append ", Sri Lanka" for better local results if not already present
            const finalQuery = queryToSearch.toLowerCase().includes('sri lanka')
                ? queryToSearch
                : `${queryToSearch}, Sri Lanka`;

            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalQuery)}&limit=5&countrycodes=lk`);
            const data = await response.json();
            setSearchResults(data);

            if (data.length === 0 && !queryOverride) {
                console.log("No results found for:", finalQuery);
            }
        } catch (error) {
            console.error('Error searching location:', error);
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

        if (formData.name && formData.mobile && selectedPackageIds.length > 0 && formData.hotelName && formData.bookingDate) {
            try {
                const selectedPkgs = packages.filter(p => selectedPackageIds.includes(p.id));
                const combinedPackageTitles = selectedPkgs.map(p => p.title).join(' + ');

                // Calculate total amount
                const totalAmount = selectedPkgs.reduce((sum, pkg) => {
                    const priceStr = pkg.price || "0";
                    // Remove "LKR", commas, and whitespace
                    const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
                    return sum + numericPrice;
                }, 0);

                const bookingPayload = {
                    customerId: user.id || null,
                    customerName: formData.name,
                    mobile: formData.mobile,
                    packageIds: selectedPackageIds,
                    packageTitle: combinedPackageTitles || 'Custom Package',
                    category: formData.selectedCategory,
                    hotelName: formData.hotelName,
                    bookingDate: formData.bookingDate,
                    location: { lat: location.lat, lng: location.lng },
                    totalAmount: totalAmount,
                    status: 'Pending'
                };

                if (formData.selectedCategory === 'Wedding' || formData.selectedCategory === 'Engagement') {
                    bookingPayload.coupleName = formData.coupleName;
                } else if (formData.selectedCategory === 'Birthday Party') {
                    bookingPayload.birthdayPersonName = formData.birthdayPersonName;
                }

                await apiCall('/bookings', {
                    method: 'POST',
                    body: JSON.stringify(bookingPayload)
                });

                setSubmitted(true);
                alert("Booking Submitted Successfully! Your request has been sent to Dream Go Studio. We will contact you soon to confirm.");
                setTimeout(() => setSubmitted(false), 5000);

                // Keep name and mobile intact since they are tied to account
                setFormData(prev => ({
                    ...prev,
                    selectedCategory: '',
                    hotelName: '',
                    bookingDate: '',
                    coupleName: '',
                    birthdayPersonName: ''
                }));
                setSelectedPackageIds([]);
                setLocation({ lat: 6.9271, lng: 79.8612 });
                setSearchQuery('');
            } catch (err) {
                console.error('Error submitting booking:', err);
                alert('Failed to submit booking request. Please try again.');
            }
        } else if (selectedPackageIds.length === 0) {
            alert("Please select at least one package/service.");
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
                                <p>Quickly create an account or log in to continue booking your photography package.</p>
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
                                    <label htmlFor="bookingDate">Booking Date (Event Date)</label>
                                    <input
                                        type="date"
                                        id="bookingDate"
                                        name="bookingDate"
                                        value={formData.bookingDate}
                                        onChange={handleChange}
                                        required
                                        className="date-input"
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="hotelName">Hotel / Event Venue Name</label>
                                    <div className="hotel-search-wrapper">
                                        <input
                                            type="text"
                                            id="hotelName"
                                            name="hotelName"
                                            placeholder="e.g. Shangri-La, Colombo"
                                            value={formData.hotelName}
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="hotel-search-btn"
                                            onClick={() => {
                                                setSearchQuery(formData.hotelName);
                                                handleSearch(formData.hotelName);
                                            }}
                                            title="Search this hotel on map"
                                        >
                                            🔍
                                        </button>
                                    </div>
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
                                            onKeyUp={handleKeyUp}
                                            className="location-search-input no-button"
                                        />

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
                                    <label htmlFor="selectedCategory">Select Event Category</label>
                                    <div className="custom-select-wrapper">
                                        <select
                                            id="selectedCategory"
                                            name="selectedCategory"
                                            value={formData.selectedCategory}
                                            onChange={(e) => {
                                                handleChange(e);
                                                setSelectedPackageIds([]); // Reset selection when category changes
                                            }}
                                            required
                                            className="package-dropdown"
                                        >
                                            <option value="" disabled>Select event type...</option>
                                            {categories.map((cat, idx) => (
                                                <option key={idx} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <div className="select-arrow">▼</div>
                                    </div>
                                </div>

                                {(formData.selectedCategory === 'Wedding' || formData.selectedCategory === 'Engagement') && (
                                    <div className="input-group slide-in">
                                        <label htmlFor="coupleName">Couple Name</label>
                                        <input
                                            type="text"
                                            id="coupleName"
                                            name="coupleName"
                                            placeholder="Enter Couple Name"
                                            value={formData.coupleName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                )}

                                {formData.selectedCategory === 'Birthday Party' && (
                                    <div className="input-group slide-in">
                                        <label htmlFor="birthdayPersonName">Birthday Person's Name</label>
                                        <input
                                            type="text"
                                            id="birthdayPersonName"
                                            name="birthdayPersonName"
                                            placeholder="Birthday eka thiyena kenage name eka add karanna"
                                            value={formData.birthdayPersonName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                )}

                                {formData.selectedCategory && (
                                    <div className="input-group">
                                        <label>Select Services (You can choose multiple)</label>
                                        <div className="services-checkbox-grid">
                                            {packages.filter(p => (p.category || 'Wedding') === formData.selectedCategory).map(pkg => (
                                                <label key={pkg.id} className={`service-checkbox-card ${selectedPackageIds.includes(pkg.id) ? 'selected' : ''}`}>
                                                    <div className="cb-header">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPackageIds.includes(pkg.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedPackageIds([...selectedPackageIds, pkg.id]);
                                                                } else {
                                                                    setSelectedPackageIds(selectedPackageIds.filter(id => id !== pkg.id));
                                                                }
                                                            }}
                                                        />
                                                        <span className="service-title-cb">{pkg.title}</span>
                                                    </div>
                                                    <div className="service-details-cb">
                                                        <div className="service-price-cb">{pkg.price}</div>
                                                        <p className="service-desc-cb">{pkg.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                            {packages.filter(p => (p.category || 'Wedding') === formData.selectedCategory).length === 0 && (
                                                <p className="no-services-msg">No services available for this category yet.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

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
