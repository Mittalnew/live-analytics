import React, { useState } from 'react';
import { User, Lock, Save } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { login, logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import styles from './Settings.module.css';

const Settings = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    // Initialize Local State with Global User Name
    const [activeTab, setActiveTab] = useState('profile');
    const [displayName, setDisplayName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    const handleSave = () => {
        if (!user) return;

        if (activeTab === 'profile') {
            // Update Redux Store (Global State)
            dispatch(login({
                ...user, // Keep existing email, role, avatar
                name: displayName // Update Name
            }));
            alert('Profile updated successfully!');
        } else if (activeTab === 'security') {
            // Mock Validation Logic
            if (!currentPassword || !newPassword) {
                alert('Please fill all password fields.');
                return;
            }

            // In a real app, this verification happens on the server
            if (currentPassword !== 'password123') {
                alert('❌ Incorrect current password! (Hint: Try "password123")');
                return;
            }

            if (newPassword.length < 6) {
                alert('Weak Password! Must be at least 6 chars.');
                return;
            }

            // Success Flow
            alert('✅ Password Changed Successfully! Logging you out for security...');

            // Clear Session & Redirect to Login
            dispatch(logout());
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className={styles.formSection}>
                        <div className={styles.formGroup}>
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                defaultValue={user?.email}
                                className={styles.input}
                                disabled
                                style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className={styles.formSection}>
                        <div className={styles.formGroup}>
                            <label>Current Password</label>
                            <input
                                type="password"
                                className={styles.input}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>New Password</label>
                            <input
                                type="password"
                                className={styles.input}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Settings</h1>

            <div className={`${styles.card} card glass-panel`}>
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={styles.content}>
                    <h2 className={styles.sectionTitle}>{tabs.find(t => t.id === activeTab)?.label} Settings</h2>
                    {renderContent()}

                    <div className={styles.footer}>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
