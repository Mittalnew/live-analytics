import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import { Activity, Lock, Mail } from 'lucide-react';
import styles from './Login.module.css';

const Login = () => {
    const [email, setEmail] = useState('admin@demo.com');
    const [password, setPassword] = useState('password');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate login
        dispatch(login({
            id: '1',
            name: 'Hi Mittal',
            email,
            role: email.includes('admin') ? 'admin' : 'user',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        }));
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-panel`}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Activity size={40} className={styles.logoIcon} />
                    </div>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to Efira(On-air) Dashboard</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <Mail className={styles.inputIcon} size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock className={styles.inputIcon} size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <button type="submit" className={`${styles.button} btn-primary`}>
                        Sign In
                    </button>
                </form>

                <div className={styles.footer}>
                    <p className={styles.note}>Use <strong>admin@demo.com</strong> for Admin access</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
