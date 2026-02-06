import React, { useState, useEffect } from 'react';
import { Download, FileText, Trash2, Filter, Mail, Plus } from 'lucide-react';
import { jsPDF } from "jspdf";
import styles from './Reports.module.css';

const Reports = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [generatingType, setGeneratingType] = useState<'summary' | 'standard' | null>(null);
    const [showAiModal, setShowAiModal] = useState(false);
    const [reportTitle, setReportTitle] = useState("AI Executive Summary");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All Types");

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        fetch('http://localhost:5000/api/reports', { signal })
            .then(res => res.json())
            .then(data => {
                if (!signal.aborted) {
                    setReports(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Error fetching reports:', err);
                    setLoading(false);
                }
            });

        return () => {
            controller.abort();
        };
    }, []);

    // Derived state for filtering
    const filteredReports = reports.filter(report => {
        const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "All Types" || report.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleExportCsv = () => {
        if (filteredReports.length === 0) {
            alert("No reports to export.");
            return;
        }

        const headers = ["ID,Report Name,Date,Status,Type"];
        const rows = filteredReports.map(r => `${r.id},"${r.name}",${r.date},${r.status},${r.type || ''}`);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "reports_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownload = (id: number, format: 'csv' | 'pdf') => {
        const report = reports.find(r => r.id === id);
        if (!report || format !== 'pdf') return;

        const doc = new jsPDF();

        // 🏢 Header
        doc.setFillColor(240, 240, 240);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Analytics Dashboard", 20, 25);
        doc.setFontSize(10);
        doc.text("Official System Generation", 20, 32);

        // 📄 Report Details
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text(`📄 ${report.name}`, 20, 60);

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${report.date}`, 20, 70);
        doc.text(`Type: ${report.type}`, 20, 78);
        doc.text(`Status: ${report.status}`, 20, 86);

        // 📊 Mock Data Content (Simulated based on type)
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 95, 190, 95);

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Summary Data", 20, 110);

        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);

        const mockLines = report.type === 'Sales'
            ? [
                "Total Revenue: $12,450",
                "Units Sold: 432",
                "Top Region: North America",
                "Growth: +14% vs last month"
            ]
            : [
                "Active Sessions: 12,302",
                "Avg Duration: 4m 20s",
                "Bounce Rate: 42%",
                "New Signups: 145"
            ];

        let y = 125;
        mockLines.forEach(line => {
            doc.text(`• ${line}`, 25, y);
            y += 10;
        });

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text("Confidential - Internal Use Only", 20, 280);

        doc.save(`${report.name.replace(/\s+/g, '_')}.pdf`);
    };

    const handleDelete = (id: number) => {
        setReports(reports.filter(r => r.id !== id));
    };

    const generatePdf = () => {
        if (!aiReport) return;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("Executive AI Report", 20, 20);

        // Timestamp
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

        // Content
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        // Split text to fit page width
        const splitText = doc.splitTextToSize(aiReport.replace(/\*\*/g, ''), 170); // Simple markdown strip
        doc.text(splitText, 20, 45);

        // Save
        doc.save("Executive_AI_Summary.pdf");
    };

    const handleGenerateAiReport = async () => {
        setGeneratingType('summary');
        setReportTitle("AI Executive Summary"); // Set specific title
        try {
            const response = await fetch('http://localhost:5000/api/generate-ai-report', {
                method: 'POST',
            });
            const result = await response.json();

            if (result.success) {
                setAiReport(result.report);
                setShowAiModal(true);
            } else {
                alert('Failed to generate report: ' + result.message);
            }
        } catch (error) {
            console.error('AI Report Error:', error);
            alert('Something went wrong!');
        } finally {
            setGeneratingType(null);
        }
    };

    const handleGenerateStandardReport = async () => {
        setGeneratingType('standard');
        setReportTitle("Comprehensive Standard Business Report"); // Standard title
        try {
            const response = await fetch('http://localhost:5000/api/generate-standard-report', {
                method: 'POST',
            });
            const result = await response.json();

            if (result.success) {
                setAiReport(result.report); // Reusing same modal state
                setShowAiModal(true);
            } else {
                alert('Failed to generate report: ' + result.message);
            }
        } catch (error) {
            console.error('Standard Report Error:', error);
            alert('Analysis failed!');
        } finally {
            setGeneratingType(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>Reports</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Generate and manage system reports.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerateAiReport}
                        disabled={!!generatingType}
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
                    >
                        {generatingType === 'summary' ? (
                            <>Generating...</>
                        ) : (
                            <>
                                <Plus size={20} /> Generate AI Summary
                            </>
                        )}
                    </button>
                    {/* Standard Report Button - kept for reference */}
                    <button
                        className="btn btn-ghost"
                        style={{ border: '1px solid var(--border-color)' }}
                        onClick={handleGenerateStandardReport}
                        disabled={!!generatingType}
                    >
                        {generatingType === 'standard' ? (
                            <>Generating...</>
                        ) : (
                            <>
                                <Plus size={20} /> Standard Report
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* AI Report Modal */}
            {showAiModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(5px)'
                }}>
                    <div className="card glass-panel" style={{
                        width: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem',
                        position: 'relative', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <button
                            onClick={() => setShowAiModal(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}
                        >
                            &times;
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                📊
                            </div>
                            <h2 className="text-gradient" style={{ margin: 0 }}>{reportTitle}</h2>
                        </div>

                        <div style={{
                            lineHeight: '1.6',
                            fontSize: '1rem',
                            color: '#e2e8f0',
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace' // Critical for ASCII Charts
                        }}>
                            {aiReport}
                        </div>

                        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn btn-ghost" onClick={() => setShowAiModal(false)}>Close</button>
                            <button className="btn btn-primary" onClick={generatePdf}>Download PDF</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`${styles.controls} glass-panel`}>
                <div className={styles.filters}>
                    <div className={styles.searchWrapper}>
                        <Filter size={18} className={styles.icon} />
                        <input
                            type="text"
                            placeholder="Filter reports..."
                            className={styles.input}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className={styles.select}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option>All Types</option>
                        <option>Sales</option>
                        <option>Activity</option>
                        <option>Revenue</option>
                    </select>
                </div>
                <div className={styles.actions}>
                    <button className="btn btn-ghost" onClick={handleExportCsv}>
                        <FileText size={18} /> Export CSV
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
                        {filteredReports.map((report) => (
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
