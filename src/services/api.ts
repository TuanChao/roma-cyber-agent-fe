import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://web-production-dcd5c.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agent Status
export const getAgentsStatus = async () => {
  const { data } = await api.get('/api/agents/status');
  return data;
};

export const getAgentHealth = async (agentName: string) => {
  const { data } = await api.get(`/api/agents/${agentName}/health`);
  return data;
};

// AI Chat
export const chatWithAI = async (message: string, conversationHistory: any[] = []) => {
  const { data } = await api.post('/api/ai/chat', {
    message,
    conversation_history: conversationHistory
  });
  return data;
};

// Network Monitor
export const startNetworkMonitor = async () => {
  const { data } = await api.post('/api/network-monitor/start');
  return data;
};

export const stopNetworkMonitor = async () => {
  const { data } = await api.post('/api/network-monitor/stop');
  return data;
};

export const getNetworkStatistics = async () => {
  const { data } = await api.get('/api/network-monitor/statistics');
  return data;
};

export const getNetworkAlerts = async (limit: number = 10) => {
  const { data } = await api.get(`/api/network-monitor/alerts?limit=${limit}`);
  return data;
};

// Attack Simulator
export const simulatePortScan = async (params: {
  target: string;
  ports?: number[];
  scan_type?: string;
}) => {
  const { data } = await api.post('/api/attack-simulator/port-scan', null, {
    params,
  });
  return data;
};

export const simulateDDoS = async (params: {
  target: string;
  duration?: number;
  packet_rate?: number;
}) => {
  const { data } = await api.post('/api/attack-simulator/ddos', null, {
    params,
  });
  return data;
};

export const simulatePingSweep = async (network: string) => {
  const { data } = await api.post('/api/attack-simulator/ping-sweep', null, {
    params: { network },
  });
  return data;
};

export const getSimulations = async (limit: number = 10) => {
  const { data } = await api.get(`/api/attack-simulator/simulations?limit=${limit}`);
  return data;
};

export const stopSimulation = async () => {
  const { data } = await api.post('/api/attack-simulator/stop');
  return data;
};

// AI Coordinator
export const analyzeIncident = async (incident: any) => {
  const { data } = await api.post('/api/ai/analyze', incident);
  return data;
};

export const generateReport = async (params: {
  incident_ids?: string[];
  timeframe?: string;
}) => {
  const { data } = await api.post('/api/ai/report', params);
  return data;
};

export const getAIStatistics = async () => {
  const { data } = await api.get('/api/ai/statistics');
  return data;
};

// Dashboard
export const getDashboardOverview = async () => {
  const { data } = await api.get('/api/dashboard/overview');
  return data;
};

export default api;
