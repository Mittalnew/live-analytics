import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PieChart, FileText, Users, Settings, LogOut, Activity } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import type { RootState } from '../../store';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <Activity className={styles.logoIcon} size={32} />
                <h1 className={styles.logoText}>Efira</h1>
            </div>

            <nav className={styles.nav}>
                <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} end>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/analytics" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                    <PieChart size={20} />
                    <span>Analytics</span>
                </NavLink>

                <NavLink to="/reports" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                    <FileText size={20} />
                    <span>AI Reports</span>
                </NavLink>

                {user?.role === 'admin' && (
                    <NavLink to="/users" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                        <Users size={20} />
                        <span>Users</span>
                    </NavLink>
                )}

                <NavLink to="/settings" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </nav>

            <div className={styles.footer}>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
