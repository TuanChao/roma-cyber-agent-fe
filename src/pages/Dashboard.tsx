import { useEffect, useState } from 'react';
import { Activity, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { getDashboardOverview, getAgentsStatus } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import GeminiIcon from '../components/GeminiIcon';
import toast from 'react-hot-toast';
import { websocketService } from '../services/websocket';
import LiveActivityFeed from '../components/LiveActivityFeed';

const Dashboard = () => {
  const [overview, setOverview] = useState<any>(null);
  const [agentsStatus, setAgentsStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();

    // Connect WebSocket for real-time updates
    websocketService.connect();

    // Listen for real-time updates
    const handleUpdate = (updateData: any) => {
      if (updateData.agents) {
        setAgentsStatus(updateData.agents);
      }
    };

    websocketService.on('message', handleUpdate);

    // Fallback polling (less frequent since we have WebSocket)
    const interval = setInterval(loadDashboard, 30000); // Refresh every 30s as backup

    return () => {
      clearInterval(interval);
      websocketService.off('message', handleUpdate);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      const [overviewData, agentsData] = await Promise.all([
        getDashboardOverview(),
        getAgentsStatus()
      ]);
      setOverview(overviewData);
      setAgentsStatus(agentsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const stats = [
    {
      name: 'Active Agents',
      value: overview?.system?.active_agents || 0,
      icon: Activity,
      color: 'bg-blue-500',
      change: '+2',
    },
    {
      name: 'Total Threats',
      value: overview?.ai?.total_incidents_analyzed || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '+5',
    },
    {
      name: 'Packets Analyzed',
      value: overview?.network?.total_packets || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+12%',
    },
    {
      name: 'System Uptime',
      value: `${Math.floor((overview?.system?.uptime || 0) / 60)}m`,
      icon: Shield,
      color: 'bg-purple-500',
      change: '99.9%',
    },
  ];

  const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#ff9ff3', '#54a0ff', '#48dbfb'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-900 dark:text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          Security Dashboard
          <GeminiIcon size={32} className="animate-pulse" />
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Real-time monitoring powered by Roma AI</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white/80 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 group-hover:text-[#ff6b6b] transition-colors">{stat.value}</p>
                <p className="text-green-500 text-sm mt-2 flex items-center">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Timeline */}
        <div className="bg-white/80 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-[#ff6b6b] rounded-full animate-pulse"></div>
            Threat Activity
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { time: '00:00', threats: 4 },
                { time: '04:00', threats: 3 },
                { time: '08:00', threats: 7 },
                { time: '12:00', threats: 12 },
                { time: '16:00', threats: 8 },
                { time: '20:00', threats: 5 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                }}
              />
              <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Distribution */}
        <div className="bg-white/80 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-[#4ecdc4] rounded-full animate-pulse"></div>
            Threat Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Port Scan', value: 22 },
                  { name: 'DDoS Attack', value: 18 },
                  { name: 'Brute Force', value: 15 },
                  { name: 'Malware', value: 12 },
                  { name: 'SQL Injection', value: 10 },
                  { name: 'XSS Attack', value: 8 },
                  { name: 'Phishing', value: 7 },
                  { name: 'Other', value: 8 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agents Status */}
      <div className="bg-white/80 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#ff6b6b]" />
          Agents Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agentsStatus &&
            Object.entries(agentsStatus).map(([name, agent]: [string, any]) => (
              <div
                key={name}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900 dark:text-white font-medium">{name.replace('_', ' ')}</h3>
                  <div
                    className={`h-3 w-3 rounded-full ${
                      agent.is_running ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}
                  ></div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Status: {agent.status}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Events: {agent.metrics?.events_processed || 0}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white/80 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-[#ff6b6b]" />
          Recent Alerts
        </h2>
        <div className="space-y-3">
          {overview?.ai?.recent_incidents?.slice(0, 5).map((incident: any, idx: number) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-gray-900 dark:text-white font-medium">
                  {incident.original_incident?.type || 'Unknown Threat'}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {new Date(incident.timestamp).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  incident.ai_analysis?.severity === 'critical'
                    ? 'bg-red-500/20 text-red-400'
                    : incident.ai_analysis?.severity === 'high'
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {incident.ai_analysis?.severity || 'medium'}
              </span>
            </div>
          )) || (
            <p className="text-gray-400 text-center py-8">No recent incidents</p>
          )}
        </div>
      </div>

      {/* Live Activity Feed */}
      <LiveActivityFeed maxItems={100} showFilters={true} />
    </div>
  );
};

export default Dashboard;
