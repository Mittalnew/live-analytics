import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { DollarSign, Users, ShoppingBag, Activity } from 'lucide-react';
import styles from './DashboardComponents.module.css';

interface KPICardProps {
    title: string;
    value: string | number;
    change: number;
    icon: React.ElementType;
    color: 'indigo' | 'pink' | 'emerald' | 'orange';
}

const KPICard = ({ title, value, change, icon: Icon, color }: KPICardProps) => (
    <div className={`${styles.kpiCard} card`}>
        <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>{title}</span>
            <div className={`${styles.iconBox} ${styles[color]}`}>
                <Icon size={20} />
            </div>
        </div>
        <div className={styles.kpiBody}>
            <h3 className={styles.kpiValue}>{value}</h3>
            <div className={styles.kpiFooter}>
                <span className={`${styles.kpiChange} ${change >= 0 ? styles.positive : styles.negative}`}>
                    {change > 0 ? '+' : ''}{change}%
                </span>
                <span className={styles.kpiLabel}>from last month</span>
            </div>
        </div>
    </div>
);

const KPICards = () => {
    const { revenue, activeUsers, newOrders, conversionRate } = useSelector((state: RootState) => state.dashboard);

    return (
        <div className={styles.grid4}>
            <KPICard
                title="Total Revenue"
                value={`$${revenue.amount.toLocaleString()}`}
                change={revenue.change}
                icon={DollarSign}
                color="indigo"
            />
            <KPICard
                title="Active Users"
                value={activeUsers.current.toLocaleString()}
                change={8.2}
                icon={Users}
                color="pink"
            />
            <KPICard
                title="New Orders"
                value={newOrders.count}
                change={newOrders.trend}
                icon={ShoppingBag}
                color="emerald"
            />
            <KPICard
                title="Conversion Rate"
                value={`${conversionRate}%`}
                change={-2.1}
                icon={Activity}
                color="orange"
            />
        </div>
    );
};
export default KPICards;
