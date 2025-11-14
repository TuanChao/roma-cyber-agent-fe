import { useState } from 'react';
import { FileText, Download, Calendar, Loader } from 'lucide-react';
import { generateReport } from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string>('');
  const [timeframe, setTimeframe] = useState('24h');

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await generateReport({ timeframe });
      setReport(result.report);
      toast.success('Report generated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${timeframe}-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Security Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">AI-generated incident reports and summaries</p>
      </div>

      {/* Report Generator */}
      <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          Generate Report
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeframe
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end gap-4">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Generate Report
                </>
              )}
            </button>

            {report && (
              <button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-700 text-gray-900 dark:text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download
              </button>
            )}
          </div>
        </div>

        {/* Report Preview */}
        {report && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-300 dark:border-gray-600">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Report Preview</h3>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {report}
              </pre>
            </div>
          </div>
        )}

        {!report && !loading && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Select a timeframe and generate a report</p>
          </div>
        )}
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Executive Summary',
            description: 'High-level overview for stakeholders',
            icon: FileText,
          },
          {
            title: 'Technical Analysis',
            description: 'Detailed technical incident breakdown',
            icon: FileText,
          },
          {
            title: 'Compliance Report',
            description: 'Security compliance and audit trail',
            icon: FileText,
          },
        ].map((template, idx) => (
          <div
            key={idx}
            className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <template.icon className="h-10 w-10 text-blue-500 mb-3" />
            <h3 className="text-gray-900 dark:text-white font-bold mb-2">{template.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{template.description}</p>
            <button className="mt-4 text-blue-400 text-sm hover:text-blue-300">
              Coming Soon →
            </button>
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Report Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">This Month</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Avg. Incidents</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Critical Alerts</p>
            <p className="text-2xl font-bold text-red-500 mt-1">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
