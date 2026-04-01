import { useState, useEffect } from 'react';
import { apiCall } from '../../../api';
import './AdminMessages.css';

export default function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

    const fetchMessages = async () => {
        try {
            const res = await apiCall('/messages');
            setMessages(res.messages);
        } catch (err) {
            console.error('Failed to fetch messages', err);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleOpenMessage = async (msg) => {
        setSelectedMessage(msg);
        if (msg.status === 'Unread') {
            try {
                await apiCall(`/messages/${msg.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: 'Read' })
                });
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'Read' } : m));
            } catch (err) {
                console.error('Error marking as read', err);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this message?')) {
            try {
                await apiCall(`/messages/${id}`, { method: 'DELETE' });
                if (selectedMessage?.id === id) setSelectedMessage(null);
                fetchMessages();
            } catch (err) {
                console.error("Error deleting:", err);
            }
        }
    };

    const formatDate = (ts) => {
        if (!ts) return '';
        const date = new Date(ts);
        return date.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const unreadCount = messages.filter(m => m.status === 'Unread').length;

    const filtered = messages.filter(m => {
        if (filter === 'unread') return m.status === 'Unread';
        if (filter === 'read') return m.status === 'Read';
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
                            className={`message-item ${msg.status === 'Unread' ? 'unread' : ''} ${selectedMessage?.id === msg.id ? 'active' : ''}`}
                            onClick={() => handleOpenMessage(msg)}
                        >
                            <div className="message-item-header">
                                <span className="sender-name">{msg.name || 'Unknown'}</span>
                                <span className="message-date">{formatDate(msg.createdAt)}</span>
                            </div>
                            <div className="message-subject">{msg.subject || 'No Subject'}</div>
                            <div className="message-preview">{msg.message?.substring(0, 70)}...</div>
                            {msg.status === 'Unread' && <span className="new-dot" />}
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
