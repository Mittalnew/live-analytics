import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
    Plus, Search, Shield, ShieldAlert, ShieldCheck,
    Smartphone, Globe, Clock, Activity, LogOut, X
} from 'lucide-react';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import styles from './Users.module.css';

// Extended User Interface for Rich Logs
interface ActivityLog {
    id: number;
    action: string;
    time: string;
    date: string;
    status: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

interface User {
    id: number;
    name: string;
    email: string;
    role: 'Admin' | 'Editor' | 'Viewer';
    status: 'Active' | 'Inactive';
    sessionStatus: 'online' | 'idle' | 'offline';
    lastLogin: string;
    location?: string;
    device?: string;
    activityLogs?: ActivityLog[];
}

const Users = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);

    // Audit Drawer State
    const [selectedAuditUser, setSelectedAuditUser] = useState<User | null>(null);
    const [isAuditOpen, setIsAuditOpen] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        // Fetch users from our upgraded backend
        const controller = new AbortController();
        fetch('http://localhost:5000/api/users', { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                // Smart Defaults Pattern
                // If backend data is missing fields (due to old cache), fill them in UI-side
                const enrichedData = data.map((u: User) => ({
                    ...u,
                    location: u.location || 'San Francisco, USA',
                    device: u.device || 'Windows 10 Pro',
                    sessionStatus: u.sessionStatus || 'offline',
                    activityLogs: u.activityLogs || [
                        { id: 999, action: "System Init", time: "Now", date: "Today", status: "neutral" }
                    ]
                }));
                setUsers(enrichedData);
            })
            .catch(err => {
                if (err.name !== 'AbortError') console.error('Error:', err);
            });
        return () => controller.abort();
    }, []);

    const handleUserClick = (user: User) => {
        setSelectedAuditUser(user);
        setIsAuditOpen(true);
    };

    const handleForceLogout = (userId: number) => {
        // Simulate WebSocket Force Logout
        showToast('Killing user session...', 'info');
        setTimeout(() => {
            setUsers(users.map(u => u.id === userId ? { ...u, sessionStatus: 'offline' } : u));
            showToast('User has been logged out.', 'success');
            setIsAuditOpen(false);
        }, 1000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return '#10b981'; // Green
            case 'idle': return '#f59e0b';   // Orange
            default: return '#94a3b8';       // Gray
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container} style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>Live User Sessions</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor active users and audit logs.</p>
                </div>
                <div className={styles.searchBox} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '200px' }}
                    />
                </div>
            </div>

            {/* Users Grid/Table */}
            <div className={`card glass-panel`} style={{ marginTop: '20px', padding: '0', overflow: 'hidden' }}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '24px' }}>Global User</th>
                            <th>Role</th>
                            <th>Live Status</th>
                            <th>Last Active</th>
                            <th>Device</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u) => (
                            <tr
                                key={u.id}
                                onClick={() => handleUserClick(u)}
                                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', color: 'white'
                                        }}>
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#f1f5f9' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500,
                                        background: u.role === 'Admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                        color: u.role === 'Admin' ? '#fca5a5' : '#93c5fd',
                                        border: `1px solid ${u.role === 'Admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            background: getStatusColor(u.sessionStatus),
                                            boxShadow: u.sessionStatus === 'online' ? '0 0 8px #10b981' : 'none'
                                        }} />
                                        <span style={{ textTransform: 'capitalize', color: getStatusColor(u.sessionStatus) }}>
                                            {u.sessionStatus}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ color: '#94a3b8' }}>{u.lastLogin}</td>
                                <td style={{ color: '#94a3b8' }}>{u.device || 'Unknown'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* AUDIT LOG DRAWER (Slide-in Panel) */}
            <div style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: '450px',
                background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.1)',
                transform: isAuditOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 50, boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                display: 'flex', flexDirection: 'column'
            }}>
                {selectedAuditUser && (
                    <>
                        {/* Drawer Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>User Audit Log</h2>
                            <button onClick={() => setIsAuditOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Profile Summary */}
                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', fontWeight: 'bold', color: 'white'
                                }}>
                                    {selectedAuditUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, color: 'white' }}>{selectedAuditUser.name}</h3>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{selectedAuditUser.email}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                        <Globe size={14} /> Location
                                    </div>
                                    <div style={{ color: '#e2e8f0' }}>{selectedAuditUser.location || 'Unknown'}</div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                        <Smartphone size={14} /> Device
                                    </div>
                                    <div style={{ color: '#e2e8f0' }}>{selectedAuditUser.device || 'Unknown'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            <h4 style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Activity</h4>

                            <div style={{ position: 'relative', paddingLeft: '20px' }}>
                                {/* Timeline Vertical Line */}
                                <div style={{ position: 'absolute', left: '7px', top: '5px', bottom: '0', width: '2px', background: 'rgba(255,255,255,0.1)' }} />

                                {selectedAuditUser.activityLogs?.map((log, index) => (
                                    <div key={log.id} style={{ marginBottom: '24px', position: 'relative' }}>
                                        {/* Dot */}
                                        <div style={{
                                            position: 'absolute', left: '-17px', top: '5px', width: '10px', height: '10px', borderRadius: '50%',
                                            background: log.status === 'danger' ? '#ef4444' : log.status === 'success' ? '#10b981' : '#3b82f6',
                                            border: '2px solid #0f172a'
                                        }} />

                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{log.action}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.time}</span>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{log.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                            <button
                                onClick={() => handleForceLogout(selectedAuditUser.id)}
                                style={{
                                    width: '100%', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            >
                                <LogOut size={18} /> Force Logout Session
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Overlay for Drawer */}
            {isAuditOpen && (
                <div
                    onClick={() => setIsAuditOpen(false)}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                />
            )}
        </div>
    );
};

export default Users;
