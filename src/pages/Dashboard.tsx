import React from 'react';
import KPICards from '../components/dashboard/KPICards';
import RevenueLineChart from '../components/charts/RevenueLineChart';
import SalesBarChart from '../components/charts/SalesBarChart';
import TrafficPieChart from '../components/charts/TrafficPieChart';
import RecentActivityTable from '../components/dashboard/RecentActivityTable';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    return (
        <div className={styles.container}>
            <div className={styles.welcomeSection}>
                <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Real-time analytics and insights.</p>
            </div>

            <KPICards />

            <div className={styles.chartsGrid}>
                <div className={styles.lineChart}>
                    <RevenueLineChart />
                </div>
                <div className={styles.barChart}>
                    <SalesBarChart />
                </div>
                <div className={styles.pieChart}>
                    <TrafficPieChart />
                </div>
            </div>

            <div className={styles.bottomSection}>
                <RecentActivityTable />
            </div>
        </div>
    );
};

export default Dashboard;
