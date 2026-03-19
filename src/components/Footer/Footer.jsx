import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>Dream Go Studio</h3>
                    <p>Crafting memories that last a lifetime. Premium photography, videography, and printing services based in Galle, Sri Lanka.</p>
                    <div className="footer-socials">
                        <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="https://wa.me/94768634775" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        </a>
                    </div>
                </div>

                <div className="footer-links-col">
                    <h4>Navigation</h4>
                    <ul>
                        <li><Link to="/">Booking</Link></li>
                        <li><Link to="/gallery">Gallery</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                </div>

                <div className="footer-links-col">
                    <h4>Services</h4>
                    <ul>
                        <li><span>Wedding Photography</span></li>
                        <li><span>Event Photography</span></li>
                        <li><span>Birthday Photography</span></li>
                        <li><span>Videography</span></li>
                        <li><span>Album Designing</span></li>
                        <li><span>Picture Framing</span></li>
                        <li><span>Printing Services</span></li>
                    </ul>
                </div>

                <div className="footer-contact-col">
                    <h4>Contact</h4>
                    <ul>
                        <li>
                            <span className="fc-icon">📧</span>
                            <a href="mailto:dreamgopictures@gmail.com">dreamgopictures@gmail.com</a>
                        </li>
                        <li>
                            <span className="fc-icon">📞</span>
                            <a href="tel:+94768634775">076 863 4775</a>
                        </li>
                        <li>
                            <span className="fc-icon">📍</span>
                            <span>Thalagaha Junction, Akmeemana, Galle</span>
                        </li>
                        <li>
                            <span className="fc-icon">🕐</span>
                            <span>Mon – Sat: 9 AM – 6 PM</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {currentYear} Dream Go Studio. All rights reserved.</p>
                <p>Designed with ❤️ in Galle, Sri Lanka.</p>
            </div>
        </footer>
    );
}
