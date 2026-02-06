const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mqtt = require('mqtt');

// Connect to HiveMQ Public Broker
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com');

mqttClient.on('connect', () => {
    console.log("✅ Connected to MQTT Broker");
    mqttClient.publish('analytics/system', 'Backend Online');

    // Subscribe to topics WE want to forward to frontend
    mqttClient.subscribe('analytics/alerts/critical');
    mqttClient.subscribe('analytics/admin/logs');
});

// Bridge: Forward MQTT Messages to Local WebSocket Clients
mqttClient.on('message', (topic, message) => {
    const msgString = message.toString();
    console.log(`📥 Received MQTT [${topic}]:`, msgString);

    // Broadcast to all connected Frontend Clients
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                source: 'mqtt',
                topic: topic,
                data: JSON.parse(msgString)
            }));
        }
    });
});

// Simulation: Critical Sales Alert (Every 60s)
setInterval(() => {
    const alertMsg = JSON.stringify({
        id: Date.now(),
        type: 'critical',
        message: '⚠️ Warning: Sales dropped by 15% in last hour!',
        timestamp: new Date().toLocaleTimeString()
    });
    // console.log("📢 Publishing Critical Alert"); // Optional log
    mqttClient.publish('analytics/alerts/critical', alertMsg);
}, 60000);

// Simulation: User Login Activity (Every 45s) - For Admin Only
setInterval(() => {
    const users = ["Alice", "Bob", "Charlie", "Dave"];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const logMsg = JSON.stringify({
        id: Date.now(),
        type: 'info',
        message: `🔐 User ${randomUser} just logged in.`,
        timestamp: new Date().toLocaleTimeString()
    });
    console.log("📢 Publishing Admin Log");
    mqttClient.publish('analytics/admin/logs', logMsg);
}, 45000);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Load static data
const dataFilePath = path.join(__dirname, 'data.json');
let staticData = {};

const loadData = () => {
    try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        staticData = JSON.parse(fileContent);
        console.log('✅ Loaded static data from data.json');
        return true;
    } catch (error) {
        console.error('❌ Failed to load data.json:', error);
        return false;
    }
};

loadData();

// Mock Data Generators for Real-time Simulation
const generateRevenueData = () => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        data.push({
            date: d.toISOString().split('T')[0],
            value: Math.floor(Math.random() * 5000) + 3000,
        });
    }
    return data;
};

const getRandomActivity = () => {
    const users = ['Alice Smith', 'Bob Jones', 'Charlie Brown', 'David Lee', 'Emma Wilson'];
    const actions = ['Purchase #', 'Login', 'Logout', 'Failed Payment', 'Updated Profile'];
    const statuses = ['completed', 'pending', 'failed'];

    return {
        id: Date.now().toString(),
        user: users[Math.floor(Math.random() * users.length)],
        action: actions[Math.floor(Math.random() * actions.length)] + (Math.random() > 0.5 ? Math.floor(Math.random() * 9999) : ''),
        time: 'Just now',
        status: statuses[Math.floor(Math.random() * statuses.length)]
    };
};

// Initialize Dashboard State from JSON + Generated Historical Data
let dashboardState = {
    revenue: {
        amount: staticData.dashboard?.revenue.amount || 124500,
        change: staticData.dashboard?.revenue.change || 12.5,
        data: generateRevenueData() // Keep historical data generated for now as it's large
    },
    activeUsers: {
        current: staticData.dashboard?.activeUsers.current || 1420,
        history: Array(20).fill(0).map((_, i) => ({
            time: `${i}:00`,
            value: (staticData.dashboard?.activeUsers.current || 1000) + Math.random() * 500
        }))
    },
    newOrders: staticData.dashboard?.newOrders || { count: 450, trend: 5.2 },
    conversionRate: staticData.dashboard?.conversionRate || 3.2,
    recentActivity: staticData.dashboard?.recentActivity || []
};

// REST API Endpoints
app.get('/api/dashboard', (req, res) => {
    res.json(dashboardState);
});

app.get('/api/analytics', (req, res) => {
    // Return static data from JSON
    // In a real app, you would implement filtering logic here based on req.query
    setTimeout(() => {
        if (staticData.analytics && staticData.analytics.default) {
            res.json({ success: true, data: staticData.analytics.default });
        } else {
            res.status(404).json({ success: false, message: "Analytics data not found" });
        }
    }, 500);
});

app.get('/api/reports', (req, res) => {
    res.json(staticData.reports);
});

app.get('/api/users', (req, res) => {
    res.json(staticData.users);
});

app.get('/api/charts/sales', (req, res) => {
    res.json(staticData.charts.sales);
});

app.get('/api/charts/traffic', (req, res) => {
    res.json(staticData.charts.traffic);
});

// AI Service Import
const { generateExecutiveReport, generateStandardReport } = require('./services/reportGenerator');

// ... (Existing endpoints)

app.post('/api/generate-ai-report', async (req, res) => {
    try {
        // 1. Get the latest data from our centralized JSON
        const dashboardData = {
            ...dashboardState,
            // Include analytics summary if available
            analyticsSummary: staticData.analytics ? staticData.analytics.default.metrics : {}
        };

        // 2. Call the dedicated AI Service
        const reportText = await generateExecutiveReport(dashboardData);

        // 3. Return the premium AI report
        res.json({ success: true, report: reportText });

    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ success: false, message: "AI Analysis Failed. Please check backend logs." });
    }
});

app.post('/api/generate-standard-report', async (req, res) => {
    try {
        // 1. Get Data
        const dashboardData = {
            ...dashboardState,
            analyticsSummary: staticData.analytics ? staticData.analytics.default.metrics : {}
        };

        // 2. Call Standard Report Service
        const reportText = await generateStandardReport(dashboardData);

        // 3. Return
        res.json({ success: true, report: reportText });

    } catch (error) {
        console.error("Standard Report API Error:", error.message);
        res.status(500).json({ success: false, message: "Standard Report Failed." });
    }
});


// WebSocket Connection Handler
wss.on('connection', (ws) => {
    console.log('✅ New WebSocket client connected');

    // Send initial data immediately
    ws.send(JSON.stringify({
        type: 'INITIAL_DATA',
        payload: dashboardState
    }));

    ws.on('close', (code, reason) => {
        if (code !== 1000) {
            console.log(`❌ Client disconnected (code: ${code})`);
        }
    });
});

// Broadcast to all connected clients
const broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

// Real-time Data Updates (simulating live changes)
const startSimulation = () => {
    setInterval(() => {
        // Update Active Users
        const change = Math.floor(Math.random() * 21) - 10;
        dashboardState.activeUsers.current = Math.max(0, dashboardState.activeUsers.current + change);

        const newHistory = [...dashboardState.activeUsers.history.slice(1), {
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            value: dashboardState.activeUsers.current
        }];
        dashboardState.activeUsers.history = newHistory;

        // Broadcast Active Users Update
        broadcast({
            type: 'ACTIVE_USERS_UPDATE',
            payload: {
                activeUsers: dashboardState.activeUsers
            }
        });

        // console.log(`📊 Active Users: ${dashboardState.activeUsers.current}`);
    }, 2000);

    // Update other metrics occasionally
    setInterval(() => {
        dashboardState.conversionRate = +(Math.random() * 5 + 1).toFixed(2);
        dashboardState.newOrders = {
            count: Math.floor(Math.random() * 100) + 400,
            trend: +(Math.random() * 10).toFixed(1)
        };

        broadcast({
            type: 'METRICS_UPDATE',
            payload: {
                conversionRate: dashboardState.conversionRate,
                newOrders: dashboardState.newOrders
            }
        });

        // console.log(`📈 Metrics Updated`);
    }, 5000);

    // Add new activity every 10 seconds
    setInterval(() => {
        const newActivity = getRandomActivity();
        dashboardState.recentActivity = [newActivity, ...dashboardState.recentActivity.slice(0, 9)];

        broadcast({
            type: 'NEW_ACTIVITY',
            payload: {
                recentActivity: dashboardState.recentActivity
            }
        });

        // console.log(`🔔 New Activity: ${newActivity.action}`);
    }, 10000);
};

startSimulation();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
});
