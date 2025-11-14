import { useEffect, useState } from 'react';
import { AlertTriangle, X, Shield, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThreatAlert {
  alert_id: string;
  timestamp: string;
  type: string;
  severity: string;
  source_ip: string;
  dest_ip?: string;
  protocol?: string;
  details?: any;
  agent: string;
  status: string;
}

interface ThreatAlertPopupProps {
  alert: ThreatAlert;
  onDismiss: () => void;
  onViewDetails: (alert: ThreatAlert) => void;
}

const ThreatAlertPopup = ({ alert, onDismiss, onViewDetails }: ThreatAlertPopupProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Auto dismiss after 10 seconds
    const duration = 10000;
    const interval = 50;
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onDismiss]);

  const getSeverityStyles = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-red-500/20 dark:bg-red-500/10',
          border: 'border-red-500',
          text: 'text-red-600 dark:text-red-400',
          icon: 'text-red-500',
        };
      case 'high':
        return {
          bg: 'bg-orange-500/20 dark:bg-orange-500/10',
          border: 'border-orange-500',
          text: 'text-orange-600 dark:text-orange-400',
          icon: 'text-orange-500',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500/20 dark:bg-yellow-500/10',
          border: 'border-yellow-500',
          text: 'text-yellow-600 dark:text-yellow-400',
          icon: 'text-yellow-500',
        };
      default:
        return {
          bg: 'bg-blue-500/20 dark:bg-blue-500/10',
          border: 'border-blue-500',
          text: 'text-blue-600 dark:text-blue-400',
          icon: 'text-blue-500',
        };
    }
  };

  const styles = getSeverityStyles(alert.severity);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`relative w-96 ${styles.bg} backdrop-blur-xl border-2 ${styles.border} rounded-xl shadow-2xl overflow-hidden`}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
        <motion.div
          className={`h-full ${styles.border.replace('border-', 'bg-')}`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>

      <div className="p-4 pt-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${styles.bg}`}>
              <AlertTriangle className={`h-5 w-5 ${styles.icon} animate-pulse`} />
            </div>
            <div>
              <h3 className={`font-bold ${styles.text} text-lg`}>
                {alert.severity.toUpperCase()} THREAT DETECTED
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {alert.type.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">Source:</span>
            <span className={`font-mono font-medium ${styles.text}`}>{alert.source_ip}</span>
          </div>

          {alert.dest_ip && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">Target:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{alert.dest_ip}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">Time:</span>
            <span className="text-gray-900 dark:text-gray-100">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>

          {alert.protocol && (
            <div className="flex items-center gap-2 text-sm">
              <div className="h-4 w-4 flex items-center justify-center">
                <div className="h-2 w-2 bg-gray-500 rounded-full" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Protocol:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles.bg} ${styles.text}`}>
                {alert.protocol}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(alert)}
            className={`flex-1 px-4 py-2 ${styles.border.replace('border-', 'bg-')} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
          >
            View Details
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreatAlertPopup;
