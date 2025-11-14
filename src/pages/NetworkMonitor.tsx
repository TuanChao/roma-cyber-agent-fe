import { useEffect, useState } from 'react';
import { Play, Square, Activity, AlertCircle } from 'lucide-react';
import {
  startNetworkMonitor,
  stopNetworkMonitor,
  getNetworkStatistics,
  getNetworkAlerts,
} from '../services/api';
import toast from 'react-hot-toast';
import { websocketService } from '../services/websocket';

const NetworkMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Connect WebSocket
    websocketService.connect();

    // Listen for real-time alerts
    const handleAlert = (alertData: any) => {
      // Add new alert to the list
      setAlerts((prev: any) => [alertData, ...prev].slice(0, 20));

      // Show toast notification
      toast.error(`${alertData.type}: ${alertData.source_ip}`, {
        icon: '🚨',
        duration: 3000,
      });
    };

    // Listen for system updates
    const handleUpdate = (updateData: any) => {
      if (updateData.agents?.network_monitor) {
        // Update statistics from WebSocket
        const networkAgent = updateData.agents.network_monitor;
        if (networkAgent.metrics) {
          setStatistics((prev: any) => ({
            ...prev,
            ...networkAgent.metrics,
          }));
        }
      }
    };

    websocketService.on('alert', handleAlert);
    websocketService.on('message', handleUpdate);

    // Fallback polling (less frequent with WebSocket)
    let interval: any = null;
    if (isMonitoring) {
      interval = setInterval(loadData, 5000); // Every 5s as backup
    }

    return () => {
      if (interval) clearInterval(interval);
      websocketService.off('alert', handleAlert);
      websocketService.off('message', handleUpdate);
    };
  }, [isMonitoring]);

  const loadData = async () => {
    try {
      const [stats, alertsData] = await Promise.all([
        getNetworkStatistics(),
        getNetworkAlerts(10),
      ]);
      setStatistics(stats);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load network data:', error);
    }
  };

  const handleStartMonitoring = async () => {
    setLoading(true);
    try {
      await startNetworkMonitor();
      setIsMonitoring(true);
      toast.success('Network monitoring started');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to start monitoring');
    } finally {
      setLoading(false);
    }
  };

  const handleStopMonitoring = async () => {
    setLoading(true);
    try {
      await stopNetworkMonitor();
      setIsMonitoring(false);
      toast.success('Network monitoring stopped');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to stop monitoring');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Network Monitor</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time network traffic analysis</p>
        </div>
        <button
          onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isMonitoring
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isMonitoring ? (
            <>
              <Square className="h-5 w-5" />
              Stop Monitoring
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Start Monitoring
            </>
          )}
        </button>
      </div>

      {/* Status Banner */}
      {isMonitoring && (
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-green-500 animate-pulse" />
            <div>
              <p className="text-green-600 dark:text-green-400 font-medium">Monitoring Active</p>
              <p className="text-green-500 dark:text-green-300 text-sm">
                Capturing and analyzing network traffic in real-time
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Packets</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {statistics.total_packets?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Active IPs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.active_ips || 0}</p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Alerts</p>
            <p className="text-3xl font-bold text-red-500">
              {statistics.total_alerts || 0}
            </p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Protocols</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {Object.keys(statistics.protocol_distribution || {}).length}
            </p>
          </div>
        </div>
      )}

      {/* Protocol Distribution */}
      {statistics?.protocol_distribution && (
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Protocol Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statistics.protocol_distribution).map(
              ([protocol, count]: [string, any]) => (
                <div key={protocol} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{protocol}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{count}</p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Alerts Table */}
      <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Security Alerts</h2>
        {alerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                    Source IP
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                    Severity
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/20"
                  >
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 text-sm">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded text-sm">
                        {alert.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-mono text-sm">
                      {alert.source_ip}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          alert.severity === 'high'
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                            : alert.severity === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 text-sm">{alert.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {isMonitoring ? 'No alerts detected yet' : 'Start monitoring to see alerts'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkMonitor;
