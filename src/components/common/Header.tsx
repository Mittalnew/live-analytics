import React, { useState, useEffect } from 'react';
import { Bell, User, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import mqtt from 'mqtt'; // Verify: pre-installed
import { useToast } from './Toast';
import type { RootState } from '../../store';
import styles from './Header.module.css';

interface Notification {
    id: number;
    type: 'critical' | 'info';
    message: string;
    timestamp: string;
}

const Header = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { showToast } = useToast();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Ref to track processed Message IDs (Prevents Toast Duplicates from strict mode / multiple connections)
    const processedIds = React.useRef(new Set<number>());

    // WebSocket Connection Logic (Local Bridge)
    useEffect(() => {
        if (!user) return;

        const ws = new WebSocket('ws://localhost:5000');

        ws.onopen = () => {
            console.log('✅ Connected to Local Notification System');
        };

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);

                // Filter: Only process MQTT sourced messages
                if (payload.source === 'mqtt') {
                    const topic = payload.topic;
                    const data = payload.data; // { id, type, message, timestamp }

                    // Role Check (Client Side Filter)
                    if (topic.includes('admin') && user.role !== 'admin') return;

                    // Deduplication Logic using Ref (Centralized Guard)
                    const incomingId = data.id || Date.now();

                    if (!processedIds.current.has(incomingId)) {
                        // Mark as processed immediately
                        processedIds.current.add(incomingId);

                        // Limit ref size
                        if (processedIds.current.size > 50) processedIds.current.clear();

                        const newNotif: Notification = {
                            id: incomingId,
                            type: data.type,
                            message: data.message,
                            timestamp: data.timestamp
                        };

                        // 1. Update List
                        setNotifications(prev => [newNotif, ...prev].slice(0, 10));

                        // 2. Update Count (Restored!)
                        setUnreadCount(prev => prev + 1);

                        // 3. Show Toast
                        showToast(newNotif.message, newNotif.type === 'critical' ? 'error' : 'info');
                    }
                }
            } catch (e) {
                // Ignore parsing errors for non-JSON messages
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, [user, showToast]);

    const handleBellClick = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) setUnreadCount(0); // Mark all read on open
    };

    return (
        <header className={`${styles.header} glass-panel`}>
            <div className={styles.searchBar}>
                <span className={styles.liveIndicator}>● LIVE</span>
            </div>

            <div className={styles.actions}>
                <div style={{ position: 'relative' }}>
                    <button className={styles.iconBtn} onClick={handleBellClick}>
                        <Bell size={20} />
                        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                    </button>

                    {/* Notification Dropdown */}
                    {showDropdown && (
                        <div className={styles.dropdown}>
                            <div className={styles.dropdownHeader}>
                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0' }}>Notifications</h4>
                                <X size={16} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowDropdown(false)} />
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`${styles.notificationItem} ${n.type === 'critical' ? styles.critical : ''}`}>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#e2e8f0' }}>{n.message}</p>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{n.timestamp}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.profile}>
                    <div className={styles.profileInfo}>
                        <span className={styles.name}>{user?.name || 'Guest User'}</span>
                        <span className={styles.role}>{user?.role || 'Viewer'}</span>
                    </div>
                    <div className={styles.avatar}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
