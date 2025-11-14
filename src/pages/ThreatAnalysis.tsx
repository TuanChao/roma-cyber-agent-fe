import { useState } from 'react';
import { Brain, Send, Loader } from 'lucide-react';
import { analyzeIncident } from '../services/api';
import GeminiIcon from '../components/GeminiIcon';
import toast from 'react-hot-toast';

const ThreatAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [incidentType, setIncidentType] = useState('port_scan');
  const [sourceIp, setSourceIp] = useState('192.168.1.100');
  const [destIp, setDestIp] = useState('192.168.1.1');
  const [protocol, setProtocol] = useState('TCP');
  const [details, setDetails] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const incident = {
        type: incidentType,
        source_ip: sourceIp,
        dest_ip: destIp,
        protocol,
        timestamp: new Date().toISOString(),
        details: details ? JSON.parse(details) : {},
      };

      const result = await analyzeIncident(incident);
      setAnalysis(result);

      // Show success with severity info
      const severity = result.ai_analysis?.severity?.toUpperCase() || 'UNKNOWN';
      toast.success(`Incident analyzed - Severity: ${severity}`);

      // Show alert notification status
      if (['MEDIUM', 'HIGH', 'CRITICAL'].includes(severity)) {
        toast.success('🔔 Alert sent to Telegram!', { icon: '📱', duration: 4000 });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          AI Threat Analysis
          <GeminiIcon size={32} className="animate-pulse" />
        </h1>
        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <span>Powered by</span>
          <span className="text-purple-400 font-semibold">Roma</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Incident Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Incident Type</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
              >
                <option value="port_scan">Port Scan</option>
                <option value="ddos">DDoS Attack</option>
                <option value="brute_force">Brute Force</option>
                <option value="malware">Malware Detection</option>
                <option value="sql_injection">SQL Injection</option>
                <option value="xss_attack">XSS Attack</option>
                <option value="phishing">Phishing</option>
                <option value="data_exfiltration">Data Exfiltration</option>
                <option value="unauthorized_access">Unauthorized Access</option>
                <option value="ransomware">Ransomware</option>
                <option value="mitm_attack">Man-in-the-Middle Attack</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Source IP</label>
              <input
                type="text"
                value={sourceIp}
                onChange={(e) => setSourceIp(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white font-mono"
                placeholder="192.168.1.100"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Destination IP</label>
              <input
                type="text"
                value={destIp}
                onChange={(e) => setDestIp(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white font-mono"
                placeholder="192.168.1.1"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
              >
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
                <option value="HTTP">HTTP</option>
                <option value="HTTPS">HTTPS</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Additional Details (JSON, optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white font-mono text-sm"
                rows={4}
                placeholder='{"ports_scanned": [22, 23, 3389]}'
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Analyze with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Analysis Results</h2>

          {analysis ? (
            <div className="space-y-4">
              {/* Severity Badge */}
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Severity Assessment</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex px-4 py-2 rounded-lg border font-bold text-lg uppercase ${getSeverityColor(
                      analysis.ai_analysis?.severity
                    )}`}
                  >
                    {analysis.ai_analysis?.severity || 'Unknown'}
                  </span>
                  {['medium', 'high', 'critical'].includes(analysis.ai_analysis?.severity?.toLowerCase() || '') && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500 rounded-lg text-sm font-medium animate-pulse">
                      <span className="text-lg">📱</span>
                      Alert Sent to Telegram
                    </span>
                  )}
                </div>
              </div>

              {/* Threat Type */}
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Threat Classification</p>
                <p className="text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  {analysis.ai_analysis?.threat_type || 'N/A'}
                </p>
              </div>

              {/* Confidence */}
              {analysis.ai_analysis?.confidence && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Confidence Level</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                        style={{
                          width: `${(analysis.ai_analysis.confidence * 100).toFixed(0)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {(analysis.ai_analysis.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Threat Explanation</p>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {analysis.ai_analysis?.explanation || 'No explanation available'}
                  </p>
                </div>
              </div>

              {/* Immediate Actions */}
              {analysis.ai_analysis?.immediate_actions?.length > 0 && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Recommended Actions</p>
                  <div className="space-y-2">
                    {analysis.ai_analysis.immediate_actions.map((action: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
                      >
                        <span className="text-blue-400 font-bold">{idx + 1}.</span>
                        <p className="text-blue-300 flex-1">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mitigation Strategy */}
              {analysis.ai_analysis?.mitigation && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Mitigation Strategy</p>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-300 leading-relaxed">
                      {analysis.ai_analysis.mitigation}
                    </p>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 text-xs">
                  Analyzed at: {new Date(analysis.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Brain className="h-16 w-16 text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Submit an incident for AI-powered analysis
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Example Incidents */}
      <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            {
              name: 'Port Scan',
              type: 'port_scan',
              source: '192.168.1.100',
              details: '{"ports_scanned": [22, 23, 3389]}',
            },
            {
              name: 'DDoS Attack',
              type: 'ddos',
              source: '10.0.0.50',
              details: '{"packet_count": 10000, "duration": 60}',
            },
            {
              name: 'Brute Force',
              type: 'brute_force',
              source: '172.16.0.25',
              details: '{"failed_attempts": 150, "service": "SSH"}',
            },
            {
              name: 'SQL Injection',
              type: 'sql_injection',
              source: '203.0.113.42',
              details: '{"payload": "SELECT * FROM users WHERE id=1; DROP TABLE users;", "target_table": "users"}',
            },
            {
              name: 'XSS Attack',
              type: 'xss_attack',
              source: '198.51.100.15',
              details: '{"payload": "<script>alert(document.cookie)</script>", "injection_point": "search_field"}',
            },
            {
              name: 'Phishing',
              type: 'phishing',
              source: '185.220.101.30',
              details: '{"spoofed_domain": "paypa1.com", "target_users": 25}',
            },
            {
              name: 'Ransomware',
              type: 'ransomware',
              source: '45.33.32.156',
              details: '{"encrypted_files": 1250, "ransom_amount": "0.5 BTC"}',
            },
            {
              name: 'MITM Attack',
              type: 'mitm_attack',
              source: '192.168.1.77',
              details: '{"intercepted_sessions": 5, "protocol": "HTTP"}',
            },
          ].map((example, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIncidentType(example.type);
                setSourceIp(example.source);
                setDetails(example.details);
              }}
              className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-left transition-colors hover:border-[#ff6b6b]"
            >
              <p className="text-gray-900 dark:text-white font-medium mb-1">{example.name}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Click to load</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatAnalysis;
