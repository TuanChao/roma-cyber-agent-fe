import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ThreatAlertPopup from './ThreatAlertPopup';
import { websocketService } from '../services/websocket';

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

const ThreatAlertsContainer = () => {
  const [alerts, setAlerts] = useState<ThreatAlert[]>([]);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Listen for alerts
    const handleAlert = (alertData: ThreatAlert) => {
      console.log('🚨 New threat alert received:', alertData);

      // Add alert to state
      setAlerts(prev => {
        // Limit to 5 alerts at a time
        const newAlerts = [alertData, ...prev].slice(0, 5);
        return newAlerts;
      });

      // Play sound notification (optional)
      playNotificationSound();
    };

    websocketService.on('alert', handleAlert);

    return () => {
      websocketService.off('alert', handleAlert);
    };
  }, []);

  const playNotificationSound = () => {
    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.alert_id !== alertId));
  };

  const handleViewDetails = (alert: ThreatAlert) => {
    console.log('View details for alert:', alert);
    // Navigate to threat analysis page or show modal
    // You can implement this based on your needs
    dismissAlert(alert.alert_id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      <AnimatePresence>
        {alerts.map(alert => (
          <ThreatAlertPopup
            key={alert.alert_id}
            alert={alert}
            onDismiss={() => dismissAlert(alert.alert_id)}
            onViewDetails={handleViewDetails}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ThreatAlertsContainer;
