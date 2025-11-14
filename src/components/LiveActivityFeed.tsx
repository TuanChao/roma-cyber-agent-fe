import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Shield,
  Wifi,
  Server,
  Zap,
  Clock,
  Filter,
} from 'lucide-react';
import { websocketService } from '../services/websocket';

interface ActivityEvent {
  id: string;
  type: 'alert' | 'update' | 'system' | 'network';
  timestamp: string;
  message: string;
  severity?: string;
  data?: any;
}

interface LiveActivityFeedProps {
  maxItems?: number;
  showFilters?: boolean;
}

const LiveActivityFeed = ({ maxItems = 50, showFilters = true }: LiveActivityFeedProps) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Add initial system event
    addEvent({
      id: `system-${Date.now()}`,
      type: 'system',
      timestamp: new Date().toISOString(),
      message: '✅ Live activity feed connected',
    });

    // Listen for alerts
    const handleAlert = (alertData: any) => {
      addEvent({
        id: alertData.alert_id || `alert-${Date.now()}`,
        type: 'alert',
        timestamp: alertData.timestamp || new Date().toISOString(),
        message: `🚨 ${alertData.type?.replace('_', ' ').toUpperCase()} detected from ${alertData.source_ip}`,
        severity: alertData.severity,
        data: alertData,
      });
    };

    // Listen for updates
    const handleUpdate = (updateData: any) => {
      if (updateData.agents) {
        // System update
        const activeAgents = Object.values(updateData.agents).filter(
          (agent: any) => agent.is_running
        ).length;
        addEvent({
          id: `update-${Date.now()}`,
          type: 'update',
          timestamp: updateData.timestamp || new Date().toISOString(),
          message: `📊 System update: ${activeAgents} agents active`,
          data: updateData,
        });
      }
    };

    // Listen for connection events
    const handleConnect = () => {
      addEvent({
        id: `connect-${Date.now()}`,
        type: 'system',
        timestamp: new Date().toISOString(),
        message: '🔌 WebSocket connected',
      });
    };

    const handleDisconnect = () => {
      addEvent({
        id: `disconnect-${Date.now()}`,
        type: 'system',
        timestamp: new Date().toISOString(),
        message: '⚠️ WebSocket disconnected',
      });
    };

    websocketService.on('alert', handleAlert);
    websocketService.on('message', handleUpdate);
    websocketService.on('connect', handleConnect);
    websocketService.on('disconnect', handleDisconnect);

    return () => {
      websocketService.off('alert', handleAlert);
      websocketService.off('message', handleUpdate);
      websocketService.off('connect', handleConnect);
      websocketService.off('disconnect', handleDisconnect);
    };
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when new events arrive
    if (isAutoScroll && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events, isAutoScroll]);

  const addEvent = (event: ActivityEvent) => {
    setEvents(prev => {
      const newEvents = [event, ...prev].slice(0, maxItems);
      return newEvents;
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'update':
        return <Activity className="h-4 w-4" />;
      case 'network':
        return <Wifi className="h-4 w-4" />;
      case 'system':
        return <Server className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getEventStyles = (event: ActivityEvent) => {
    if (event.type === 'alert') {
      switch (event.severity?.toLowerCase()) {
        case 'critical':
          return 'bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400';
        case 'high':
          return 'bg-orange-500/10 border-orange-500/50 text-orange-600 dark:text-orange-400';
        case 'medium':
          return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600 dark:text-yellow-400';
        default:
          return 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400';
      }
    }
    return 'bg-gray-500/10 border-gray-500/30 text-gray-700 dark:text-gray-300';
  };

  const filteredEvents =
    filter === 'all' ? events : events.filter(event => event.type === filter);

  return (
    <div className="bg-white/80 dark:bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#ff6b6b] animate-pulse" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Live Activity Feed</h2>
            <span className="px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded text-xs font-medium">
              LIVE
            </span>
          </div>

          {showFilters && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]"
              >
                <option value="all">All Events</option>
                <option value="alert">Alerts</option>
                <option value="update">Updates</option>
                <option value="network">Network</option>
                <option value="system">System</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="h-96 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
        onScroll={e => {
          const target = e.target as HTMLDivElement;
          const isAtBottom =
            target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
          setIsAutoScroll(isAtBottom);
        }}
      >
        <AnimatePresence initial={false}>
          {filteredEvents.map(event => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-3 rounded-lg border ${getEventStyles(event)} hover:scale-[1.02] transition-transform cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed break-words">{event.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 opacity-60" />
                    <span className="text-xs opacity-75">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Shield className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">No events yet. Waiting for activity...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{filteredEvents.length} events</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAutoScroll}
              onChange={e => setIsAutoScroll(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-[#ff6b6b] focus:ring-[#ff6b6b]"
            />
            <span>Auto-scroll</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default LiveActivityFeed;
