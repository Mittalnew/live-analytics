const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Mock Data Generators
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

// Initial Dashboard State
let dashboardState = {
    revenue: {
        amount: 124500,
        change: 12.5,
        data: generateRevenueData()
    },
    activeUsers: {
        current: 1420,
        history: Array(20).fill(0).map((_, i) => ({
            time: `${i}:00`,
            value: 1000 + Math.random() * 500
        }))
    },
    newOrders: { count: 450, trend: 5.2 },
    conversionRate: 3.2,
    recentActivity: [
        { id: '1', user: 'Alice Smith', action: 'Purchase #1023', time: '28888 mins ago', status: 'completed' },
        { id: '2', user: 'Bob Jones', action: 'Login', time: '5 mins ago', status: 'completed' },
        { id: '3', user: 'Charlie Brown', action: 'Failed Payment', time: '12 mins ago', status: 'failed' },
    ]
};

// REST API Endpoints
app.get('/api/dashboard', (req, res) => {
    res.json(dashboardState);
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
    console.log('✅ New WebSocket client connected');

    // Send initial data immediately
    ws.send(JSON.stringify({
        type: 'INITIAL_DATA',
        payload: dashboardState
    }));

    ws.on('close', () => {
        console.log('❌ Client disconnected');
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

    console.log(`📊 Active Users: ${dashboardState.activeUsers.current}`);
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

    console.log(`📈 Metrics Updated`);
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

    console.log(`🔔 New Activity: ${newActivity.action}`);
}, 10000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
});
