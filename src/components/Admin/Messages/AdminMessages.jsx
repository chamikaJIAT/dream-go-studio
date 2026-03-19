import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firebase';
import './AdminMessages.css';

export default function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    const handleOpenMessage = async (msg) => {
        setSelectedMessage(msg);
        if (!msg.isRead) {
            await updateDoc(doc(db, 'messages', msg.id), { isRead: true });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this message?')) {
            await deleteDoc(doc(db, 'messages', id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
        }
    };

    const formatDate = (ts) => {
        if (!ts) return '';
        return new Date(ts.toMillis()).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const unreadCount = messages.filter(m => !m.isRead).length;

    const filtered = messages.filter(m => {
        if (filter === 'unread') return !m.isRead;
        if (filter === 'read') return m.isRead;
        return true;
    });

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>Messages Inbox {unreadCount > 0 && <span className="unread-badge">{unreadCount} New</span>}</h2>
                <p>Messages sent through the Contact Us form.</p>
            </div>

            <div className="messages-layout">
                {/* Message List */}
                <div className="messages-list-panel">
                    <div className="filter-tabs">
                        {['all', 'unread', 'read'].map(f => (
                            <button
                                key={f}
                                className={`filter-tab ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="messages-empty">No messages found.</div>
                    )}

                    {filtered.map(msg => (
                        <div
                            key={msg.id}
                            className={`message-item ${!msg.isRead ? 'unread' : ''} ${selectedMessage?.id === msg.id ? 'active' : ''}`}
                            onClick={() => handleOpenMessage(msg)}
                        >
                            <div className="message-item-header">
                                <span className="sender-name">{msg.name || 'Unknown'}</span>
                                <span className="message-date">{formatDate(msg.createdAt)}</span>
                            </div>
                            <div className="message-subject">{msg.subject || 'No Subject'}</div>
                            <div className="message-preview">{msg.message?.substring(0, 70)}...</div>
                            {!msg.isRead && <span className="new-dot" />}
                        </div>
                    ))}
                </div>

                {/* Message Detail */}
                <div className="message-detail-panel">
                    {!selectedMessage ? (
                        <div className="no-selection">
                            <div className="no-selection-icon">📬</div>
                            <p>Select a message to read it</p>
                        </div>
                    ) : (
                        <div className="message-detail">
                            <div className="detail-header">
                                <div>
                                    <h3>{selectedMessage.subject || 'No Subject'}</h3>
                                    <p className="detail-meta">From: <strong>{selectedMessage.name}</strong> &lt;{selectedMessage.email}&gt;</p>
                                    {selectedMessage.phone && <p className="detail-meta">Phone: <strong>{selectedMessage.phone}</strong></p>}
                                    <p className="detail-meta">Received: {formatDate(selectedMessage.createdAt)}</p>
                                </div>
                                <div className="detail-actions">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || '')}`}
                                        className="btn-reply"
                                    >
                                        ↩ Reply
                                    </a>
                                    <button className="btn-delete-msg" onClick={() => handleDelete(selectedMessage.id)}>
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                            <div className="detail-body">
                                <p>{selectedMessage.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
