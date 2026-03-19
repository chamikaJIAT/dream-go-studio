import './ContactUs.css';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ContactUs() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'messages'), {
                ...formData,
                createdAt: serverTimestamp(),
                isRead: false
            });
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactDetails = [
        {
            icon: "📧",
            label: "Email",
            value: "dreamgopictures@gmail.com",
            link: "mailto:dreamgopictures@gmail.com",
        },
        {
            icon: "📞",
            label: "Phone",
            value: "076 863 4775 / 072 498 0088",
            link: "tel:+94768634775",
        },
        {
            icon: "📍",
            label: "Address",
            value: "Dream-GO STUDIO, Thalagaha Junction, Akmeemana, Galle",
            link: "https://maps.google.com/?q=Dream-GO+STUDIO+Thalagaha+Junction+Akmeemana+Galle",
        },
        {
            icon: "🕐",
            label: "Working Hours",
            value: "Mon – Sat\n9:00 AM (Open)\n4:30 PM (Close)",
            link: null,
        },
    ];

    return (
        <div className="contact-container">
            <div className="contact-header">
                <h1>Get In Touch</h1>
                <p>We'd love to hear from you. Send us a message and we will get back to you as soon as possible.</p>
            </div>

            <div className="contact-content">
                {/* Contact Info Cards */}
                <div className="contact-info-grid">
                    {contactDetails.map((item, i) => (
                        <div key={i} className="contact-info-card" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="contact-icon">{item.icon}</div>
                            <div>
                                <h4>{item.label}</h4>
                                {item.link ? (
                                    <a href={item.link} target="_blank" rel="noreferrer">{item.value}</a>
                                ) : (
                                    <p>{item.value}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Form */}
                <div className="contact-form-section">
                    <div className="contact-map">
                        <iframe
                            title="Dream GO Studio Location"
                            src="https://maps.google.com/maps?q=Thalagaha+Junction,Akmeemana,Galle&output=embed"
                            width="100%"
                            height="280"
                            style={{ border: 0, borderRadius: '16px' }}
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <h2>Send Us a Message</h2>
                        {submitted ? (
                            <div className="success-message">
                                ✅ Message sent successfully! We'll get back to you soon.
                            </div>
                        ) : null}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Your Name</label>
                                <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone (Optional)</label>
                                <input type="tel" name="phone" placeholder="07X XXX XXXX" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input type="text" name="subject" placeholder="Wedding Photography Inquiry" value={formData.subject} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea name="message" rows="5" placeholder="Tell us about your event or inquiry..." value={formData.message} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Message ✉️'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
