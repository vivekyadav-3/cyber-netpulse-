import { useState } from 'react';
import { ping } from '../services/api';
import { Send, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp, Terminal, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PingPage() {
  const [host, setHost] = useState('google.com');
  const [count, setCount] = useState(4);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePing = async () => {
    if (!host.trim()) return toast.error('Enter a hostname or IP');
    setLoading(true);
    setResult(null);
    try {
      const data = await ping(host.trim(), count);
      setResult(data);
      if (data.reachable) toast.success(`Host ${host} is reachable!`);
      else toast.error(`Host ${host} is unreachable`);
    } catch (e) {
      toast.error('Failed to connect to backend. Is Spring Boot running?');
    } finally {
      setLoading(false);
    }
  };

  const copyTerminal = () => {
    if (!result?.rawOutput) return;
    navigator.clipboard.writeText(result.rawOutput.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied output to clipboard!');
  };

  const rttColor = (ms) => {
    if (ms == null) return '#64748b';
    if (ms < 45) return '#34d399';
    if (ms < 100) return '#22d3ee';
    if (ms < 180) return '#fbbf24';
    return '#f87171';
  };

  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Ping <span className="gradient-text">Monitor</span>
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
          Send ICMP echo requests — precision latency tracking & packet loss diagnostics
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 24px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 3, minWidth: 220 }}>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Target Host / IP Address
            </label>
            <input
              className="net-input"
              value={host}
              onChange={e => setHost(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePing()}
              placeholder="e.g. google.com or 8.8.8.8"
              style={{
                width: '100%', height: 44, padding: '0 16px',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#f1f5f9', fontSize: 14, fontFamily: 'JetBrains Mono',
                outline: 'none', transition: 'border-color 0.2s',
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Packets
            </label>
            <select
              className="net-input"
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              style={{
                width: '100%', height: 44, padding: '0 14px',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#f1f5f9', fontSize: 13, cursor: 'pointer', outline: 'none',
              }}
            >
              {[2, 4, 6, 8, 10].map(n => (
                <option key={n} value={n} style={{ background: '#080d1a' }}>{n} packets</option>
              ))}
            </select>
          </div>
          <button
            onClick={handlePing}
            disabled={loading}
            style={{
              minWidth: 140, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              border: '1px solid rgba(99,102,241,0.5)',
              borderRadius: 10, color: '#ffffff', fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(99,102,241,0.45)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.3)'; }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin-slow" />
                <span>Pinging…</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Execute Ping</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Hosts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presets:</span>
          {['8.8.8.8', '1.1.1.1', 'google.com', 'github.com', 'cloudflare.com'].map(h => (
            <button
              key={h}
              onClick={() => setHost(h)}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, color: host === h ? '#818cf8' : '#64748b', cursor: 'pointer',
                fontSize: 11, padding: '4px 12px', fontFamily: 'JetBrains Mono', fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#c7d2fe'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = host === h ? '#6366f1' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = host === h ? '#818cf8' : '#64748b'; }}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State Showcase */}
      {!result && !loading && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 10,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🎯</span> Latency Benchmarking Guide
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { range: '< 20ms', label: 'Local LAN / Fiber Gateway', color: '#34d399' },
                { range: '20ms – 60ms', label: 'Regional Edge / Tier 1 Datacenter', color: '#22d3ee' },
                { range: '60ms – 120ms', label: 'Cross-Continent / CDN Hop', color: '#fbbf24' },
                { range: '> 150ms', label: 'Trans-Oceanic or Congested Route', color: '#f87171' },
              ].map(({ range, label, color }) => (
                <div key={range} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color }}>{range}</span>
                  <span style={{ color: '#64748b' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚡</span> One-Click Probe Targets
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { name: 'Cloudflare DNS', ip: '1.1.1.1' },
                { name: 'Google DNS', ip: '8.8.8.8' },
                { name: 'Quad9 Security', ip: '9.9.9.9' },
                { name: 'OpenDNS Home', ip: '208.67.222.222' },
              ].map(({ name, ip }) => (
                <div
                  key={ip}
                  onClick={() => { setHost(ip); }}
                  style={{
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{name}</div>
                  <div style={{ fontSize: 10, color: '#6366f1', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{ip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-slide-in">
          {/* Status Banner */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderRadius: 14, marginBottom: 18,
            background: result.reachable ? 'rgba(52,211,153,0.06)' : 'rgba(248,113,113,0.06)',
            border: `1px solid ${result.reachable ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {result.reachable
                ? <CheckCircle2 size={24} color="#34d399" />
                : <XCircle size={24} color="#f87171" />}
              <div>
                <div style={{ fontWeight: 800, color: result.reachable ? '#34d399' : '#f87171', fontSize: 16 }}>
                  {result.reachable ? 'Host Reachable & Responding' : 'Host Unreachable / Packet Dropped'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono', marginTop: 3 }}>
                  Target: <span style={{ color: '#e2e8f0' }}>{result.host}</span> → Resolved IP: <span style={{ color: '#22d3ee' }}>{result.ipAddress || 'Unresolved'}</span>
                </div>
              </div>
            </div>
            {result.avgRttMs != null && (
              <div style={{
                padding: '6px 14px', borderRadius: 20,
                background: `${rttColor(result.avgRttMs)}15`,
                border: `1px solid ${rttColor(result.avgRttMs)}35`,
                color: rttColor(result.avgRttMs), fontSize: 12, fontWeight: 800,
                fontFamily: 'JetBrains Mono',
              }}>
                Avg {result.avgRttMs.toFixed(1)}ms
              </div>
            )}
          </div>

          {/* Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, marginBottom: 18 }}>
            {[
              { label: 'Min Latency', val: result.minRttMs, suffix: 'ms', color: '#34d399' },
              { label: 'Avg Latency', val: result.avgRttMs, suffix: 'ms', color: '#6366f1' },
              { label: 'Max Latency', val: result.maxRttMs, suffix: 'ms', color: '#fbbf24' },
              { label: 'Packet Loss', val: result.packetLossPercent, suffix: '%', color: result.packetLossPercent > 0 ? '#f87171' : '#34d399' },
              { label: 'Packets Sent', val: result.packetsSent, suffix: '', color: '#94a3b8' },
              { label: 'Packets Recv', val: result.packetsReceived, suffix: '', color: '#38bdf8' },
            ].map(({ label, val, suffix, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
                padding: '16px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 22, fontWeight: 800, fontFamily: 'JetBrains Mono', color: color,
                }}>
                  {val != null ? (suffix === 'ms' ? val.toFixed(1) : val) : '—'}{suffix}
                </div>
              </div>
            ))}
          </div>

          {/* RTT Visual Bar */}
          {result.avgRttMs != null && (
            <div style={{
              background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px',
              marginBottom: 18,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Latency Quality Rating</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: rttColor(result.avgRttMs), fontFamily: 'JetBrains Mono' }}>
                  {result.avgRttMs < 50 ? 'Ultra Low (Excellent)' : result.avgRttMs < 100 ? 'Good' : result.avgRttMs < 200 ? 'Moderate' : 'High Latency'}
                </span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((result.avgRttMs / 200) * 100, 100)}%`,
                  background: `linear-gradient(90deg, #34d399, ${rttColor(result.avgRttMs)})`,
                  borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#334155' }}>
                <span>0ms (LAN)</span>
                <span>100ms</span>
                <span>200ms+ (WAN)</span>
              </div>
            </div>
          )}

          {/* Raw Terminal Output */}
          {result.rawOutput?.length > 0 && (
            <div style={{
              background: '#040711', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#fbbf24' }} />
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e' }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginLeft: 6, fontFamily: 'JetBrains Mono' }}>
                    ping-output.log
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={copyTerminal}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 6, color: '#94a3b8', fontSize: 11, padding: '4px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 6, color: '#94a3b8', fontSize: 11, padding: '4px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    {showRaw ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {showRaw ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>
              {showRaw && (
                <div style={{
                  padding: '16px', fontFamily: 'JetBrains Mono', fontSize: 12, lineHeight: 1.6,
                  color: '#94a3b8', maxHeight: 320, overflowY: 'auto',
                }}>
                  {result.rawOutput.map((line, i) => (
                    <div key={i} style={{ color: line.includes('TTL=') || line.includes('bytes=') ? '#a78bfa' : '#64748b' }}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
