import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { updateMetrics } from '../../store/slices/dashboardSlice';
import { AnimatePresence, motion } from 'framer-motion';
import websocketService from '../../services/websocket';

const Layout = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    // WebSocket Connection
    useEffect(() => {
        if (!isAuthenticated) return;

        const WS_URL = 'ws://localhost:5000';

        const handleMessage = (data: any) => {
            switch (data.type) {
                case 'INITIAL_DATA':
                    dispatch(updateMetrics(data.payload));
                    break;

                case 'ACTIVE_USERS_UPDATE':
                    dispatch(updateMetrics(data.payload));
                    break;

                case 'METRICS_UPDATE':
                    dispatch(updateMetrics(data.payload));
                    break;

                case 'NEW_ACTIVITY':
                    dispatch(updateMetrics(data.payload));
                    break;

                default:
                    console.log('Unknown message type:', data.type);
            }
        };

        websocketService.connect(WS_URL, handleMessage);

        return () => {
            websocketService.disconnect();
        };
    }, [isAuthenticated, dispatch]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Layout;
