import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface RevenueData {
  date: string;
  value: number;
}

interface DashboardState {
  revenue: { 
    amount: number; 
    change: number; 
    data: RevenueData[];
  };
  activeUsers: {
    current: number;
    history: { time: string; value: number }[];
  };
  newOrders: { 
    count: number; 
    trend: number; // percentage
  };
  conversionRate: number;
  recentActivity: Activity[];
}

const generateInitialRevenueData = () => {
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

const initialState: DashboardState = {
  revenue: { 
    amount: 124500, 
    change: 12.5, 
    data: generateInitialRevenueData(),
  },
  activeUsers: {
    current: 1420,
    history: Array(20).fill(0).map((_, i) => ({ time: `${i}:00`, value: 1000 + Math.random() * 500 })),
  },
  newOrders: { count: 450, trend: 5.2 },
  conversionRate: 3.2,
  recentActivity: [
    { id: '1', user: 'Alice Smith', action: 'Purchase #1023', time: '2000 mins ago', status: 'completed' },
    { id: '2', user: 'Bob Jones', action: 'Login', time: '5 mins ago', status: 'completed' },
    { id: '3', user: 'Charlie Brown', action: 'Failed Payment', time: '12 mins ago', status: 'failed' },
  ],
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateMetrics: (state, action: PayloadAction<Partial<DashboardState>>) => {
      // Deep merge logic could go here, but for simple updates:
      if (action.payload.revenue) state.revenue = { ...state.revenue, ...action.payload.revenue };
      if (action.payload.activeUsers) state.activeUsers = { ...state.activeUsers, ...action.payload.activeUsers };
      if (action.payload.newOrders) state.newOrders = { ...state.newOrders, ...action.payload.newOrders };
      if (action.payload.conversionRate) state.conversionRate = action.payload.conversionRate;
      if (action.payload.recentActivity) state.recentActivity = action.payload.recentActivity;
    },
    tickActiveUsers: (state) => {
      // Simulate live fluctuation
      const change = Math.floor(Math.random() * 21) - 10;
      state.activeUsers.current = Math.max(0, state.activeUsers.current + change);
      
      const newHistory = [...state.activeUsers.history.slice(1), { 
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
        value: state.activeUsers.current 
      }];
      state.activeUsers.history = newHistory;
    }
  },
});

export const { updateMetrics, tickActiveUsers } = dashboardSlice.actions;
export default dashboardSlice.reducer;
