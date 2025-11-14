import { useState } from 'react';
import { Zap, Target, Wifi } from 'lucide-react';
import { simulatePortScan, simulateDDoS, simulatePingSweep } from '../services/api';
import toast from 'react-hot-toast';

const AttackSimulator = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'port' | 'ddos' | 'ping'>('port');

  // Port Scan State
  const [portScanTarget, setPortScanTarget] = useState('127.0.0.1');
  const [portScanPorts, setPortScanPorts] = useState('80,443,22,3389');
  const [scanType, setScanType] = useState('syn');

  // DDoS State
  const [ddosTarget, setDdosTarget] = useState('127.0.0.1');
  const [ddosDuration, setDdosDuration] = useState(10);
  const [packetRate, setPacketRate] = useState(100);

  // Ping Sweep State
  const [network, setNetwork] = useState('192.168.1.0/24');

  const handlePortScan = async () => {
    setLoading(true);
    try {
      const ports = portScanPorts.split(',').map((p) => parseInt(p.trim()));
      const result = await simulatePortScan({
        target: portScanTarget,
        ports,
        scan_type: scanType,
      });
      setResults(result);
      toast.success(`Port scan completed: ${result.open_ports?.length || 0} ports open`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Port scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDDoS = async () => {
    setLoading(true);
    try {
      const result = await simulateDDoS({
        target: ddosTarget,
        duration: ddosDuration,
        packet_rate: packetRate,
      });
      setResults(result);
      toast.success(`DDoS simulation completed: ${result.packets_sent} packets sent`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'DDoS simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePingSweep = async () => {
    setLoading(true);
    try {
      const result = await simulatePingSweep(network);
      setResults(result);
      toast.success(
        `Ping sweep completed: ${result.alive_hosts?.length || 0} hosts found`
      );
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Ping sweep failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Attack Simulator</h1>
        <p className="text-gray-600 dark:text-gray-400">Simulate attacks for security testing</p>
        <div className="mt-4 bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
          <p className="text-yellow-600 dark:text-yellow-400 font-medium">
            ⚠️ Warning: Only use on authorized networks!
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-300 dark:border-gray-700">
        {[
          { id: 'port' as const, label: 'Port Scan', icon: Target },
          { id: 'ddos' as const, label: 'DDoS', icon: Zap },
          { id: 'ping' as const, label: 'Ping Sweep', icon: Wifi },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Port Scan Tab */}
      {activeTab === 'port' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Port Scan Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Target IP</label>
                <input
                  type="text"
                  value={portScanTarget}
                  onChange={(e) => setPortScanTarget(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                  placeholder="127.0.0.1"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Ports (comma-separated)</label>
                <input
                  type="text"
                  value={portScanPorts}
                  onChange={(e) => setPortScanPorts(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                  placeholder="80,443,22,3389"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Scan Type</label>
                <select
                  value={scanType}
                  onChange={(e) => setScanType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                >
                  <option value="syn">SYN Scan (Stealthy)</option>
                  <option value="connect">Connect Scan</option>
                  <option value="udp">UDP Scan</option>
                </select>
              </div>
              <button
                onClick={handlePortScan}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Scanning...' : 'Start Port Scan'}
              </button>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Scan Results</h2>
            {results && results.type === 'port_scan' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Target</p>
                    <p className="text-gray-900 dark:text-white font-mono">{results.target}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Ports</p>
                    <p className="text-gray-900 dark:text-white font-bold">{results.total_ports}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Open Ports ({results.open_ports?.length || 0})
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    {results.open_ports?.length > 0 ? (
                      <p className="text-green-400 font-mono">
                        {results.open_ports.join(', ')}
                      </p>
                    ) : (
                      <p className="text-gray-500">No open ports found</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Status</p>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    {results.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-12">
                Run a port scan to see results
              </p>
            )}
          </div>
        </div>
      )}

      {/* DDoS Tab */}
      {activeTab === 'ddos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">DDoS Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Target IP</label>
                <input
                  type="text"
                  value={ddosTarget}
                  onChange={(e) => setDdosTarget(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                  placeholder="127.0.0.1"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Duration (seconds, max 300)
                </label>
                <input
                  type="number"
                  value={ddosDuration}
                  onChange={(e) => setDdosDuration(parseInt(e.target.value))}
                  max={300}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Packet Rate (per second)</label>
                <input
                  type="number"
                  value={packetRate}
                  onChange={(e) => setPacketRate(parseInt(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={handleDDoS}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Simulating...' : 'Start DDoS Simulation'}
              </button>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Simulation Results</h2>
            {results && results.type === 'ddos' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Packets Sent</p>
                    <p className="text-gray-900 dark:text-white font-bold text-2xl">
                      {results.packets_sent?.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Duration</p>
                    <p className="text-gray-900 dark:text-white font-bold text-2xl">
                      {results.duration_seconds}s
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Average Rate</p>
                  <p className="text-gray-900 dark:text-white font-mono">
                    {Math.round(results.packets_sent / results.duration_seconds)} packets/s
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-12">
                Run a DDoS simulation to see results
              </p>
            )}
          </div>
        </div>
      )}

      {/* Ping Sweep Tab */}
      {activeTab === 'ping' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ping Sweep Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Network (CIDR)</label>
                <input
                  type="text"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
                  placeholder="192.168.1.0/24"
                />
              </div>
              <button
                onClick={handlePingSweep}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Scanning...' : 'Start Ping Sweep'}
              </button>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sweep Results</h2>
            {results && results.type === 'ping_sweep' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Alive Hosts</p>
                    <p className="text-green-400 font-bold text-2xl">
                      {results.alive_hosts?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Total Scanned</p>
                    <p className="text-gray-900 dark:text-white font-bold text-2xl">
                      {results.total_scanned}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Alive Hosts</p>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {results.alive_hosts?.map((ip: string, idx: number) => (
                      <p key={idx} className="text-green-400 font-mono text-sm">
                        {ip}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-12">
                Run a ping sweep to see results
              </p>
            )}
          </div>
        </div>
      )}

      {/* Attack Types Info */}
      <div className="bg-white/80 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700/50">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Common Attack Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: 'SQL Injection',
              description: 'Inject malicious SQL code to manipulate databases',
              color: 'border-[#f7b731]',
            },
            {
              name: 'XSS Attack',
              description: 'Inject scripts into web pages viewed by users',
              color: 'border-[#ff9ff3]',
            },
            {
              name: 'Phishing',
              description: 'Social engineering to steal sensitive information',
              color: 'border-[#54a0ff]',
            },
            {
              name: 'Ransomware',
              description: 'Encrypt files and demand ransom for decryption',
              color: 'border-[#ff6b6b]',
            },
            {
              name: 'MITM Attack',
              description: 'Intercept communication between two parties',
              color: 'border-[#4ecdc4]',
            },
            {
              name: 'Brute Force',
              description: 'Try all possible combinations to crack passwords',
              color: 'border-[#45b7d1]',
            },
            {
              name: 'Malware',
              description: 'Malicious software to damage or exploit systems',
              color: 'border-[#5f27cd]',
            },
            {
              name: 'Data Exfiltration',
              description: 'Unauthorized transfer of data from systems',
              color: 'border-[#48dbfb]',
            },
          ].map((attack, idx) => (
            <div
              key={idx}
              className={`bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4 border-l-4 ${attack.color} hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all`}
            >
              <h3 className="text-gray-900 dark:text-white font-bold mb-2">{attack.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{attack.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttackSimulator;
