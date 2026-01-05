import React, { useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import styles from './Header.module.css';

const Header = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [searchValue, setSearchValue] = useState('');

    return (
        <header className={`${styles.header} glass-panel`}>
            <div className={styles.searchBar}>
                <Search className={styles.searchIcon} size={18} />
                <input
                    type="text"
                    placeholder="Search..."
                    className={styles.searchInput}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
            </div>

            <div className={styles.actions}>
                <button className={styles.iconBtn}>
                    <Bell size={20} />
                    <span className={styles.badge}>3</span>
                </button>

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
