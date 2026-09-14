import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import PingPage from './components/PingPage';
import TraceroutePage from './components/TraceroutePage';
import DnsPage from './components/DnsPage';
import ConnectionsPage from './components/ConnectionsPage';
import { Toaster } from 'react-hot-toast';

const pages = {
  dashboard: DashboardPage,
  ping: PingPage,
  traceroute: TraceroutePage,
  dns: DnsPage,
  connections: ConnectionsPage,
};

export default function App() {
  const [active, setActive] = useState('dashboard');
  const Page = pages[active] || DashboardPage;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050811' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#080d1a',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
        }}
      />

      <Sidebar active={active} setActive={setActive} />

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: 230,
        padding: '36px 40px',
        minHeight: '100vh',
        maxWidth: 'calc(100vw - 230px)',
        overflowX: 'hidden',
      }}>
        <Page setActiveTab={setActive} />
      </main>
    </div>
  );
}
