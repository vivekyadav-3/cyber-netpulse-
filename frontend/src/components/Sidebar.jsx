import { Activity, Globe, Network, LayoutDashboard, ChevronRight, Wifi, Zap } from 'lucide-react';

const links = [
  { id: 'dashboard',   label: 'Dashboard',    icon: LayoutDashboard, color: '#6366f1' },
  { id: 'ping',        label: 'Ping Monitor', icon: Activity,        color: '#34d399' },
  { id: 'traceroute',  label: 'Traceroute',   icon: ChevronRight,    color: '#a78bfa' },
  { id: 'dns',         label: 'DNS Lookup',   icon: Globe,           color: '#22d3ee' },
  { id: 'connections', label: 'Connections',  icon: Network,         color: '#fbbf24' },
];

export default function Sidebar({ active, setActive }) {
  return (
    <aside style={{
      width: 230,
      minHeight: '100vh',
      background: 'rgba(5,8,17,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 14px',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{ marginBottom: 32, padding: '4px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Logo icon */}
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(79,70,229,0.5)',
            flexShrink: 0,
          }}>
            <Wifi size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontWeight: 900, fontSize: 17, letterSpacing: '-0.03em', lineHeight: 1,
              background: 'linear-gradient(135deg, #818cf8, #22d3ee)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              NetPulse
            </div>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
              Network Analyzer
            </div>
          </div>
        </div>
      </div>

      {/* Live pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px', marginBottom: 24,
        background: 'rgba(52,211,153,0.08)',
        border: '1px solid rgba(52,211,153,0.18)',
        borderRadius: 10,
      }}>
        <div className="animate-pulse-live" style={{
          width: 7, height: 7, borderRadius: '50%', background: '#34d399',
          boxShadow: '0 0 8px #34d399',
        }} />
        <span style={{ fontSize: 11, color: '#34d399', fontWeight: 700, letterSpacing: '0.08em' }}>LIVE MONITORING</span>
      </div>

      {/* Nav label */}
      <div style={{ fontSize: 9, color: '#334155', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 4px', marginBottom: 8 }}>
        Navigation
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
        {links.map(({ id, label, icon: Icon, color }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
              style={{ color: isActive ? color : undefined }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: isActive ? `${color}18` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? `${color}35` : 'rgba(255,255,255,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.18s',
              }}>
                <Icon size={14} color={isActive ? color : '#475569'} strokeWidth={2} />
              </div>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bottom system info */}
      <div style={{
        marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '10px 12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Zap size={12} color="#6366f1" />
            <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>System</span>
          </div>
          <div style={{ fontSize: 10, color: '#334155', lineHeight: 1.8, fontFamily: 'JetBrains Mono' }}>
            Spring Boot v3.2<br />
            React + Recharts<br />
            <span style={{ color: '#3d4f65' }}>Port 8080 ← 5173</span>
          </div>
        </div>
        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 10, color: '#1e293b' }}>
          NetPulse v1.0 · MIT
        </div>
      </div>
    </aside>
  );
}
