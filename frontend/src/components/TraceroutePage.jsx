import { useState } from 'react';
import { traceroute } from '../services/api';
import { Send, Loader2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Copy, Check, Route } from 'lucide-react';
import toast from 'react-hot-toast';

function RttBadge({ ms }) {
  if (ms == null) return <span style={{ color: '#475569', fontFamily: 'JetBrains Mono' }}>*</span>;
  const color = ms < 30 ? '#34d399' : ms < 80 ? '#22d3ee' : ms < 150 ? '#fbbf24' : '#f87171';
  return (
    <span style={{
      color,
      fontFamily: 'JetBrains Mono',
      fontWeight: 700,
      fontSize: 12,
      background: `${color}12`,
      padding: '2px 8px',
      borderRadius: 6,
      border: `1px solid ${color}25`,
    }}>
      {ms.toFixed(1)} ms
    </span>
  );
}

export default function TraceroutePage() {
  const [host, setHost] = useState('google.com');
  const [maxHops, setMaxHops] = useState(15);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTrace = async () => {
    if (!host.trim()) return toast.error('Enter a hostname or IP');
    setLoading(true);
    setResult(null);
    toast.loading('Running traceroute… probing hops', { id: 'trace' });
    try {
      const data = await traceroute(host.trim(), maxHops);
      setResult(data);
      toast.dismiss('trace');
      if (data.reachedDestination) toast.success(`Traced to ${host} in ${data.totalHops} hops!`);
      else toast('Trace complete — destination reached or partially responded', { icon: 'ℹ️' });
    } catch (e) {
      toast.dismiss('trace');
      toast.error('Failed to run traceroute. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const copyTerminal = () => {
    if (!result?.rawOutput) return;
    navigator.clipboard.writeText(result.rawOutput.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied traceroute output!');
  };

  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Traceroute <span className="gradient-text-purple">Visualizer</span>
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
          Hop-by-hop packet path tracing with multi-probe RTT measurement & route topology
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
              Target Destination Host / IP
            </label>
            <input
              value={host}
              onChange={e => setHost(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTrace()}
              placeholder="e.g. google.com, 8.8.8.8, cloudflare.com"
              style={{
                width: '100%', height: 44, padding: '0 16px',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#f1f5f9', fontSize: 14, fontFamily: 'JetBrains Mono',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Max Hops
            </label>
            <select
              value={maxHops}
              onChange={e => setMaxHops(Number(e.target.value))}
              style={{
                width: '100%', height: 44, padding: '0 14px',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#f1f5f9', fontSize: 13, cursor: 'pointer', outline: 'none',
              }}
            >
              {[10, 15, 20, 25, 30].map(n => <option key={n} value={n} style={{ background: '#080d1a' }}>{n} hops</option>)}
            </select>
          </div>
          <button
            onClick={handleTrace}
            disabled={loading}
            style={{
              minWidth: 150, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
              border: '1px solid rgba(167,139,250,0.5)',
              borderRadius: 10, color: '#ffffff', fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(139,92,246,0.45)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.3)'; }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin-slow" />
                <span>Tracing Route…</span>
              </>
            ) : (
              <>
                <Route size={15} />
                <span>Start Traceroute</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Hosts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presets:</span>
          {['google.com', '8.8.8.8', 'github.com', 'cloudflare.com', 'amazon.com'].map(h => (
            <button
              key={h}
              onClick={() => setHost(h)}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, color: host === h ? '#c084fc' : '#64748b', cursor: 'pointer',
                fontSize: 11, padding: '4px 12px', fontFamily: 'JetBrains Mono', fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.color = '#e9d5ff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = host === h ? '#a78bfa' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = host === h ? '#c084fc' : '#64748b'; }}
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
              <span>🗺️</span> How Traceroute Works
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { step: 'TTL = 1', desc: 'First packet hits your default local gateway / Wi-Fi router' },
                { step: 'TTL = 2..N', desc: 'Subsequent ISP aggregation routers and IXP backbones' },
                { step: 'Autonomous Sys', desc: 'BGP peering links between global Internet providers' },
                { step: 'Final Hop', desc: 'Destination host server or CDN point of presence' },
              ].map(({ step, desc }) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#a78bfa',
                    background: 'rgba(167,139,250,0.12)', padding: '2px 8px', borderRadius: 6, minWidth: 100, textAlign: 'center',
                  }}>
                    {step}
                  </span>
                  <span style={{ color: '#64748b' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚡</span> Recommended Traces
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { name: 'Google Anycast', host: '8.8.8.8' },
                { name: 'Cloudflare Edge', host: '1.1.1.1' },
                { name: 'GitHub US East', host: 'github.com' },
                { name: 'AWS Global', host: 'amazon.com' },
              ].map(({ name, host: h }) => (
                <div
                  key={h}
                  onClick={() => { setHost(h); }}
                  style={{
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.background = 'rgba(167,139,250,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{name}</div>
                  <div style={{ fontSize: 10, color: '#c084fc', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{h}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="animate-slide-in">
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'Total Hops', val: result.totalHops, color: '#a78bfa' },
              { label: 'Execution Time', val: result.executionTimeMs ? `${(result.executionTimeMs / 1000).toFixed(1)}s` : '—', color: '#6366f1' },
              { label: 'Destination IP', val: result.destinationIp || '—', color: '#22d3ee' },
              {
                label: 'Route Status',
                val: result.reachedDestination ? 'Reached Target' : 'Partially Probed',
                color: result.reachedDestination ? '#34d399' : '#fbbf24',
              },
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
                padding: '16px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color, fontFamily: 'JetBrains Mono' }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Hop Table */}
          <div style={{
            background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px',
            marginBottom: 20,
          }}>
            <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0' }}>
                  Hops Path Diagram ({result.hops?.length ?? 0} Hops)
                </h3>
                <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Physical routers traversed across autonomous systems</p>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: result.reachedDestination ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                border: `1px solid ${result.reachedDestination ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                color: result.reachedDestination ? '#34d399' : '#fbbf24',
              }}>
                {result.reachedDestination ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                {result.reachedDestination ? 'Destination Reached' : 'Trace Complete'}
              </span>
            </div>

            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '50px 1.5fr 1fr 1fr 1fr', gap: 12,
              borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10, marginBottom: 8,
              color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <span>Hop</span>
              <span>Router / IP Address</span>
              <span style={{ textAlign: 'center' }}>Probe 1</span>
              <span style={{ textAlign: 'center' }}>Probe 2</span>
              <span style={{ textAlign: 'center' }}>Probe 3</span>
            </div>

            {/* Table Rows */}
            {result.hops?.length > 0 ? result.hops.map((hop, i) => (
              <div
                key={i}
                className="animate-slide-in"
                style={{
                  animationDelay: `${i * 30}ms`,
                  display: 'grid', gridTemplateColumns: '50px 1.5fr 1fr 1fr 1fr', gap: 12,
                  alignItems: 'center', padding: '10px 8px', borderRadius: 8,
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.035)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'}
              >
                {/* Hop Number Bubble */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: hop.timedOut ? 'rgba(248,113,113,0.1)' : 'rgba(167,139,250,0.12)',
                  border: `1px solid ${hop.timedOut ? '#f87171' : '#a78bfa'}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: hop.timedOut ? '#f87171' : '#c084fc',
                  fontFamily: 'JetBrains Mono',
                }}>
                  {hop.hopNumber}
                </div>

                {/* IP Address */}
                <div style={{
                  fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600,
                  color: hop.timedOut ? '#f87171' : '#e2e8f0',
                }}>
                  {hop.timedOut ? '★ Request timed out' : hop.ipAddress}
                </div>

                {/* Probes */}
                <div style={{ textAlign: 'center' }}><RttBadge ms={hop.rtt1Ms} /></div>
                <div style={{ textAlign: 'center' }}><RttBadge ms={hop.rtt2Ms} /></div>
                <div style={{ textAlign: 'center' }}><RttBadge ms={hop.rtt3Ms} /></div>
              </div>
            )) : (
              <div style={{ color: '#475569', textAlign: 'center', padding: '30px 0', fontSize: 13 }}>
                No hops parsed.
              </div>
            )}
          </div>

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
                    traceroute-output.log
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
                    <div key={i} style={{ color: line.includes('ms') ? '#c084fc' : '#64748b' }}>
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
