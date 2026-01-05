import React, { useState } from 'react';
import { Download, FileText, Trash2, Filter, Mail, Plus } from 'lucide-react';
import styles from './Reports.module.css';

const Reports = () => {
    const [reports, setReports] = useState([
        { id: 1, name: 'Sales Report - Nov 2023', date: '2023-11-30', status: 'Available', type: 'Sales' },
        { id: 2, name: 'User Activity - Q3', date: '2023-10-15', status: 'Available', type: 'Activity' },
        { id: 3, name: 'Revenue Summary', date: '2023-12-01', status: 'Processing', type: 'Revenue' },
    ]);

    const handleDownload = (id: number, format: 'csv' | 'pdf') => {
        alert(`Downloading report ${id} as ${format.toUpperCase()}`);
    };

    const handleDelete = (id: number) => {
        setReports(reports.filter(r => r.id !== id));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>Reports</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Generate and manage system reports.</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={20} />
                    Generate Report
                </button>
            </div>

            <div className={`${styles.controls} glass-panel`}>
                <div className={styles.filters}>
                    <div className={styles.searchWrapper}>
                        <Filter size={18} className={styles.icon} />
                        <input type="text" placeholder="Filter reports..." className={styles.input} />
                    </div>
                    <select className={styles.select}>
                        <option>All Types</option>
                        <option>Sales</option>
                        <option>Activity</option>
                        <option>Revenue</option>
                    </select>
                </div>
                <div className={styles.actions}>
                    <button className="btn btn-ghost" onClick={() => alert('Export all as CSV')}>
                        <FileText size={18} /> Export CSV
                    </button>
                    <button className="btn btn-ghost" onClick={() => alert('Email reports')}>
                        <Mail size={18} /> Email
                    </button>
                </div>
            </div>

            <div className={`${styles.tableCard} card glass-panel`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Report Name</th>
                            <th>Generated Date</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report) => (
                            <tr key={report.id}>
                                <td>
                                    <div className={styles.reportName}>
                                        <FileText size={18} className={styles.reportIcon} />
                                        <span>{report.name}</span>
                                    </div>
                                </td>
                                <td>{report.date}</td>
                                <td>
                                    <span className={`${styles.status} ${report.status === 'Available' ? styles.success : styles.warning}`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.rowActions}>
                                        <button
                                            className={styles.actionBtn}
                                            title="Download PDF"
                                            onClick={() => handleDownload(report.id, 'pdf')}
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.delete}`}
                                            title="Delete"
                                            onClick={() => handleDelete(report.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
