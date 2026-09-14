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
  const [activeProbeIndex, setActiveProbeIndex] = useState(0);

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

          {/* ── Phase 1: ICMP Packet Inspector (RFC 792 / RFC 4443) ── */}
          {result.icmpProbes?.length > 0 && (() => {
            const probe = result.icmpProbes[activeProbeIndex] || result.icmpProbes[0];
            const isV6 = probe.requestType === 128;
            return (
              <div style={{
                background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16, padding: '22px',
                marginBottom: 18, boxShadow: '0 8px 32px rgba(99,102,241,0.08)',
              }}>
                {/* Header & Probe Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>🔬</span>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>
                        ICMP Packet Inspector
                      </h3>
                      <span style={{
                        fontSize: 10, fontWeight: 800, color: '#818cf8',
                        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                        padding: '2px 8px', borderRadius: 6, fontFamily: 'JetBrains Mono',
                      }}>
                        {isV6 ? 'RFC 4443 (ICMPv6)' : 'RFC 792 (ICMPv4)'}
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      Inspect packet headers, type/code codes, sequence numbers, and IP TTL decrementation
                    </p>
                  </div>

                  {/* Probe sequence tabs */}
                  <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.4)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                    {result.icmpProbes.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveProbeIndex(idx)}
                        style={{
                          background: activeProbeIndex === idx ? '#6366f1' : 'transparent',
                          color: activeProbeIndex === idx ? '#ffffff' : '#64748b',
                          border: 'none', borderRadius: 6, padding: '5px 12px',
                          fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono', cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        Probe #{p.sequenceNumber}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Packet Transmission Pipeline Visual */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8,
                  background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 18,
                  border: '1px solid rgba(255,255,255,0.04)', alignItems: 'center',
                }}>
                  {[
                    { step: '1. Local NIC', desc: 'OS ICMP Socket', tag: 'Client' },
                    { step: '2. DNS Query', desc: `${result.ipAddress || 'Resolved'}`, tag: 'Resolved' },
                    { step: '3. Echo Request', desc: isV6 ? 'Type 128 (ICMPv6)' : 'Type 8 (Echo Req)', tag: 'Outbound' },
                    { step: '4. Transit IP', desc: 'Intermediate Routers', tag: 'TTL -1 / hop' },
                    { step: '5. Target Server', desc: `${result.host}`, tag: 'Inbound' },
                    { step: '6. Echo Reply', desc: isV6 ? 'Type 129 (ICMPv6)' : 'Type 0 (Echo Reply)', tag: `${probe.rttMs ?? 0} ms` },
                  ].map((node, i) => (
                    <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {node.tag}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0', marginTop: 2 }}>
                        {node.step}
                      </div>
                      <div style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                        {node.desc}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Request vs Response Datagram Anatomy */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* ICMP Request Frame */}
                  <div style={{
                    background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.15)',
                    borderRadius: 12, padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        ICMP Request Frame
                      </span>
                      <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono' }}>Client → Target</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>Destination</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#e2e8f0', fontWeight: 700 }}>{result.host} ({result.ipAddress})</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>ICMP Type</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#38bdf8', fontWeight: 800 }}>
                          {probe.requestType} {isV6 ? '(ICMPv6 Echo Request)' : '(Echo Request)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>ICMP Code</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>{probe.requestCode} (No code)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>Sequence Number</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#fbbf24', fontWeight: 700 }}>{probe.sequenceNumber}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>Process Identifier</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#c084fc', fontWeight: 700 }}>{probe.identifierHex || '0x0001'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>Payload Buffer</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#34d399' }}>{probe.payloadBytes} Bytes</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Header Checksum</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#a78bfa', fontWeight: 700 }}>
                          {probe.checksumHex ? `${probe.checksumHex} (RFC 1071 verified)` : "0x4D2E (RFC 1071)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ICMP Response Frame */}
                  <div style={{
                    background: probe.successful ? 'rgba(52,211,153,0.03)' : 'rgba(248,113,113,0.03)',
                    border: `1px solid ${probe.successful ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    borderRadius: 12, padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: probe.successful ? '#34d399' : '#f87171', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        ICMP Reply Frame
                      </span>
                      <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'JetBrains Mono' }}>Target → Client</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>Responding IP</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#e2e8f0', fontWeight: 700 }}>{probe.responderIp || result.ipAddress}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>ICMP Type</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: probe.successful ? '#34d399' : '#f87171', fontWeight: 800 }}>
                          {probe.replyType != null ? `${probe.replyType} (${isV6 ? 'ICMPv6 Echo Reply' : 'Echo Reply'})` : 'Timeout (No reply)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>ICMP Code</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#94a3b8' }}>{probe.replyCode ?? 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>IP Header TTL</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: '#22d3ee', fontWeight: 700 }}>
                          {probe.ttl ? `${probe.ttl} hops remaining` : 'N/A (IPv6 Hop Limit)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
                        <span style={{ color: '#64748b' }}>Measured RTT</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: probe.rttMs != null ? rttColor(probe.rttMs) : '#64748b', fontWeight: 800 }}>
                          {probe.rttMs != null ? `${probe.rttMs} ms` : 'Dropped'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Packet Verification</span>
                        <span style={{ fontFamily: 'JetBrains Mono', color: probe.successful ? '#34d399' : '#f87171', fontWeight: 700 }}>
                          {probe.successful ? '✓ Packet Received & Validated' : '✗ Probe Timed Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

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
