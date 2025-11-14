import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NetworkMonitor from './pages/NetworkMonitor'
import AttackSimulator from './pages/AttackSimulator'
import ThreatAnalysis from './pages/ThreatAnalysis'
import Reports from './pages/Reports'
import AIChat from './pages/AIChat'
import ThreatAlertsContainer from './components/ThreatAlertsContainer'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
        {/* Real-time Threat Alert Popups */}
        <ThreatAlertsContainer />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="network" element={<NetworkMonitor />} />
            <Route path="simulator" element={<AttackSimulator />} />
            <Route path="threats" element={<ThreatAnalysis />} />
            <Route path="reports" element={<Reports />} />
            <Route path="chat" element={<AIChat />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
