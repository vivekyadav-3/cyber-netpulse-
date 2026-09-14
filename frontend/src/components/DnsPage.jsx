import { useState } from 'react';
import { dns } from '../services/api';
import { Globe, Loader2, CheckCircle2, XCircle, Clock, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DnsPage() {
  const [host, setHost] = useState('google.com');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedIp, setCopiedIp] = useState(null);

  const handleLookup = async () => {
    if (!host.trim()) return toast.error('Enter a domain name');
    setLoading(true);
    setResult(null);
    try {
      const data = await dns(host.trim());
      setResult(data);
      if (data.successful) toast.success(`Resolved ${data.resolvedIps?.length ?? 0} IP(s)!`);
      else toast.error('DNS resolution failed');
    } catch (e) {
      toast.error('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(text);
    setTimeout(() => setCopiedIp(null), 1800);
    toast.success(`Copied ${text}`);
  };

  const isIpv6 = (ip) => ip.includes(':');

  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          DNS <span className="gradient-text">Analyzer</span>
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
          Resolve domain names to IPv4 (A) and IPv6 (AAAA) records with execution benchmarks
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 24px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Target Domain Name
            </label>
            <input
              value={host}
              onChange={e => setHost(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              placeholder="e.g. google.com, github.com, cloudflare.com"
              style={{
                width: '100%', height: 44, padding: '0 16px',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: '#f1f5f9', fontSize: 14, fontFamily: 'JetBrains Mono',
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={loading}
            style={{
              minWidth: 150, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              border: '1px solid rgba(6,182,212,0.5)',
              borderRadius: 10, color: '#ffffff', fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(6,182,212,0.45)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(6,182,212,0.3)'; }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin-slow" />
                <span>Resolving…</span>
              </>
            ) : (
              <>
                <Globe size={15} />
                <span>Resolve Domain</span>
              </>
            )}
          </button>
        </div>

        {/* Quick presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Presets:</span>
          {['google.com', 'github.com', 'cloudflare.com', 'amazon.com', 'netflix.com', 'wikipedia.org'].map(d => (
            <button
              key={d}
              onClick={() => setHost(d)}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, color: host === d ? '#22d3ee' : '#64748b', cursor: 'pointer',
                fontSize: 11, padding: '4px 12px', fontFamily: 'JetBrains Mono', fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.color = '#a5f3fc'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = host === d ? '#06b6d4' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = host === d ? '#22d3ee' : '#64748b'; }}
            >
              {d}
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
              <span>📖</span> DNS Record Architecture
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { tag: 'A', desc: 'IPv4 32-bit Host Address mapping', color: '#22d3ee' },
                { tag: 'AAAA', desc: 'IPv6 128-bit Next-Gen Address', color: '#a78bfa' },
                { tag: 'CNAME', desc: 'Canonical Name alias redirection', color: '#34d399' },
                { tag: 'PTR', desc: 'Reverse pointer lookup for IP → Name', color: '#fbbf24' },
              ].map(({ tag, desc, color }) => (
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono', fontWeight: 800, color,
                    background: `${color}15`, padding: '2px 8px', borderRadius: 6, minWidth: 54, textAlign: 'center',
                  }}>
                    {tag}
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
              <span>🌐</span> Common DNS Lookups
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { name: 'Google Search', domain: 'google.com' },
                { name: 'Cloudflare Edge', domain: 'cloudflare.com' },
                { name: 'GitHub Code', domain: 'github.com' },
                { name: 'Amazon Web', domain: 'amazon.com' },
              ].map(({ name, domain }) => (
                <div
                  key={domain}
                  onClick={() => { setHost(domain); }}
                  style={{
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>{name}</div>
                  <div style={{ fontSize: 10, color: '#22d3ee', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{domain}</div>
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
            padding: '16px 20px', borderRadius: 14, marginBottom: 20,
            background: result.successful ? 'rgba(6,182,212,0.06)' : 'rgba(248,113,113,0.06)',
            border: `1px solid ${result.successful ? 'rgba(6,182,212,0.25)' : 'rgba(248,113,113,0.25)'}`,
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {result.successful
                ? <CheckCircle2 size={24} color="#22d3ee" />
                : <XCircle size={24} color="#f87171" />}
              <div>
                <div style={{ fontWeight: 800, color: result.successful ? '#22d3ee' : '#f87171', fontSize: 16 }}>
                  {result.successful ? 'DNS Query Resolved' : 'DNS Resolution Error'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', fontFamily: 'JetBrains Mono', marginTop: 3 }}>
                  {result.errorMessage || `Resolved ${result.resolvedIps?.length ?? 0} address records`}
                </div>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
              color: '#22d3ee', fontSize: 12, fontWeight: 800, fontFamily: 'JetBrains Mono',
            }}>
              <Clock size={13} />
              <span>{result.resolutionTimeMs} ms</span>
            </div>
          </div>

          {/* Canonical Hostname */}
          {result.canonicalHostName && (
            <div style={{
              background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
              padding: '16px 20px', marginBottom: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Canonical Hostname (CNAME Target)
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', color: '#38bdf8', fontSize: 14, fontWeight: 700 }}>
                  {result.canonicalHostName}
                </div>
              </div>
              <button
                onClick={() => copy(result.canonicalHostName)}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, color: '#94a3b8', padding: '6px 12px', fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {copiedIp === result.canonicalHostName ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                {copiedIp === result.canonicalHostName ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}

          {/* IP Records Card */}
          {result.resolvedIps?.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px',
            }}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0' }}>
                    Resolved Addresses ({result.resolvedIps.length})
                  </h3>
                  <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Click copy button to copy individual IP records</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)',
                  }}>
                    {result.resolvedIps.filter(ip => !isIpv6(ip)).length} IPv4
                  </span>
                  <span style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)',
                  }}>
                    {result.resolvedIps.filter(ip => isIpv6(ip)).length} IPv6
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.resolvedIps.map((ip, i) => {
                  const ipv6 = isIpv6(ip);
                  return (
                    <div
                      key={i}
                      className="animate-slide-in"
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.05)', animationDelay: `${i * 40}ms`,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = ipv6 ? 'rgba(167,139,250,0.3)' : 'rgba(34,211,238,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: ipv6 ? 'rgba(167,139,250,0.12)' : 'rgba(34,211,238,0.12)',
                          border: `1px solid ${ipv6 ? '#a78bfa' : '#22d3ee'}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800, color: ipv6 ? '#c084fc' : '#22d3ee',
                          fontFamily: 'JetBrains Mono',
                        }}>
                          {ipv6 ? 'v6' : 'v4'}
                        </div>
                        <div>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>{ip}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, fontFamily: 'JetBrains Mono',
                          color: ipv6 ? '#c084fc' : '#22d3ee', background: `${ipv6 ? '#a78bfa' : '#22d3ee'}15`,
                          padding: '3px 8px', borderRadius: 6,
                        }}>
                          {ipv6 ? 'AAAA' : 'A'}
                        </span>
                        <button
                          onClick={() => copy(ip)}
                          style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 6, color: copiedIp === ip ? '#34d399' : '#64748b', cursor: 'pointer',
                            padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#22d3ee'; e.currentTarget.style.color = '#22d3ee'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = copiedIp === ip ? '#34d399' : '#64748b'; }}
                        >
                          {copiedIp === ip ? <Check size={12} /> : <Copy size={12} />}
                          {copiedIp === ip ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
