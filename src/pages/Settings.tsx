import React, { useState } from 'react';
import { User, Bell, Lock, Globe, Save } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import styles from './Settings.module.css';

const Settings = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'preferences', label: 'Preferences', icon: Globe },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className={styles.formSection}>
                        <div className={styles.formGroup}>
                            <label>Display Name</label>
                            <input type="text" defaultValue={user?.name} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email Address</label>
                            <input type="email" defaultValue={user?.email} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Bio</label>
                            <textarea className={styles.textarea} placeholder="Tell us about yourself" rows={4}></textarea>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className={styles.formSection}>
                        <div className={styles.toggleRow}>
                            <div>
                                <h4>Email Notifications</h4>
                                <p>Receive emails about account activity.</p>
                            </div>
                            <input type="checkbox" defaultChecked />
                        </div>
                        <div className={styles.toggleRow}>
                            <div>
                                <h4>Push Notifications</h4>
                                <p>Receive push notifications on your device.</p>
                            </div>
                            <input type="checkbox" defaultChecked />
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className={styles.formSection}>
                        <div className={styles.formGroup}>
                            <label>Current Password</label>
                            <input type="password" className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>New Password</label>
                            <input type="password" className={styles.input} />
                        </div>
                    </div>
                );
            case 'preferences':
                return (
                    <div className={styles.formSection}>
                        <div className={styles.formGroup}>
                            <label>Language</label>
                            <select className={styles.input}>
                                <option>English</option>
                                <option>Spanish</option>
                                <option>French</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Timezone</label>
                            <select className={styles.input}>
                                <option>UTC</option>
                                <option>EST</option>
                                <option>PST</option>
                            </select>
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
                        <button className="btn btn-primary" onClick={() => alert('Changes saved!')}>
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
