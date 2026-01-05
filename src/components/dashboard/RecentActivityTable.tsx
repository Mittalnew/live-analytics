import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import styles from './DashboardComponents.module.css';

const RecentActivityTable = () => {
    const { recentActivity } = useSelector((state: RootState) => state.dashboard);

    return (
        <div className={`${styles.tableContainer} card glass-panel`} style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Recent Activity</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {recentActivity.map((activity) => (
                        <tr key={activity.id}>
                            <td style={{ fontWeight: 500 }}>{activity.user}</td>
                            <td>{activity.action}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{activity.time}</td>
                            <td>
                                <span className={`${styles.status} ${styles[activity.status]}`}>
                                    {activity.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentActivityTable;
