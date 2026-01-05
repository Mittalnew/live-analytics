import React, { useState, useEffect } from 'react';
import { Calendar, Filter, MapPin } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ScatterChart, Scatter, ZAxis } from 'recharts';
import styles from './Analytics.module.css';

interface AnalyticsData {
    engagement: Array<{ name: string; date: string; uv: number; pv: number }>;
    products: Array<{ name: string; value: number }>;
    metrics: {
        avgSession: string;
        bounceRate: string;
        pageViews: string;
        ctr: string;
    };
    heatmap: Array<{ hour: number; index: number; value: number }>;
}

type DateRangeOption = '7days' | '30days' | '90days';

const Analytics = () => {
    const [dateRange, setDateRange] = useState<DateRangeOption>('30days');
    const [category, setCategory] = useState('PE');
    const [region, setRegion] = useState('All');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categoryOptions = [
        { value: 'All', label: 'All Categories' },
        { value: 'PE', label: 'PE' },
        { value: 'VC', label: 'VC' },
        { value: 'RE', label: 'RE' },
        { value: 'HF', label: 'HF' },
    ];

    const regionOptions = [
        { value: 'All', label: 'All Regions' },
        { value: 'North America', label: 'North America' },
        { value: 'Europe', label: 'Europe' },
        { value: 'Asia', label: 'Asia' },
        { value: 'Middle East', label: 'Middle East' },
    ];

    const getDaysFromRange = (range: DateRangeOption): number => {
        switch (range) {
            case '7days': return 7;
            case '30days': return 30;
            case '90days': return 90;
            default: return 30;
        }
    };

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const days = getDaysFromRange(dateRange);
                const response = await fetch(
                    `http://localhost:5000/api/analytics?category=${category}&region=${region}&days=${days}`
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch analytics data');
                }
                
                const result = await response.json();
                setData(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching analytics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [dateRange, category, region]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading analytics data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <p>Error: {error}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>Analytics</h1>

                <div className={styles.filters}>
                    <div className={styles.filterBtn}>
                        <Calendar size={16} />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
                            className={styles.select}
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                    </div>
                    <div className={styles.filterBtn}>
                        <Filter size={16} />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={styles.select}
                        >
                            {categoryOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterBtn}>
                        <MapPin size={16} />
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className={styles.select}
                        >
                            {regionOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.metricsGrid}>
                <div className={`${styles.metricCard} card glass-panel`}>
                    <h3>Avg. Session</h3>
                    <p>{data.metrics.avgSession}</p>
                </div>
                <div className={`${styles.metricCard} card glass-panel`}>
                    <h3>Bounce Rate</h3>
                    <p>{data.metrics.bounceRate}</p>
                </div>
                <div className={`${styles.metricCard} card glass-panel`}>
                    <h3>Page Views</h3>
                    <p>{data.metrics.pageViews}</p>
                </div>
                <div className={`${styles.metricCard} card glass-panel`}>
                    <h3>CTR</h3>
                    <p>{data.metrics.ctr}</p>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <div className={`${styles.card} card glass-panel`}>
                    <h3>User Engagement</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.engagement}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className={`${styles.card} card glass-panel`}>
                    <h3>Top Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart layout="vertical" data={data.products}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                            <XAxis type="number" stroke="#94a3b8" />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className={`${styles.card} card glass-panel`}>
                    <h3>Activity by Hour</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis type="number" dataKey="hour" name="hour" stroke="#94a3b8" domain={[0, 23]} tickCount={12} />
                            <YAxis type="number" dataKey="index" name="index" stroke="#94a3b8" hide />
                            <ZAxis type="number" dataKey="value" range={[0, 500]} name="activity" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Scatter name="Activity" data={data.heatmap} fill="#8884d8" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
