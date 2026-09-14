import { useState, useEffect } from 'react';
import { connections } from '../services/api';
import { RefreshCw, Loader2, Search, Activity, ShieldCheck, Radio, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATE_META = {
  ESTABLISHED: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
  LISTENING:   { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
  TIME_WAIT:   { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },
  CLOSE_WAIT:  { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  'N/A':       { color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)' },
};

function StateBadge({ state }) {
  const s = state?.toUpperCase() || 'N/A';
  const meta = STATE_META[s] || STATE_META['N/A'];
  return (
    <span style={{
      background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
      borderRadius: 8, fontSize: 10, fontWeight: 800, padding: '3px 8px',
      textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
      fontFamily: 'JetBrains Mono',
    }}>
      {state || 'N/A'}
    </span>
  );
}

export default function ConnectionsPage() {
  const [data, setData]               = useState([]);
  const [filter, setFilter]           = useState('');
  const [protocolFilter, setProto]    = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [loading, setLoading]         = useState(false);
  const [limit, setLimit]             = useState(100);

  const load = async () => {
    setLoading(true);
    try {
      const list = await connections(protocolFilter, 500);
      setData(list || []);
    } catch (e) {
      toast.error('Failed to load socket table from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [protocolFilter]);

  const filtered = (data || []).filter(c => {
    const q = filter.toLowerCase();
    const matchesText = !filter || (
      c.localAddress?.toLowerCase().includes(q) ||
      c.remoteAddress?.toLowerCase().includes(q) ||
      c.state?.toLowerCase().includes(q) ||
      String(c.localPort).includes(q) ||
      String(c.remotePort).includes(q) ||
      String(c.pid).includes(q)
    );
    const matchesState = !stateFilter || c.state?.toUpperCase() === stateFilter;
    return matchesText && matchesState;
  }).slice(0, limit);

  const tcpCount  = data.filter(c => c.protocol === 'TCP').length;
  const udpCount  = data.filter(c => c.protocol === 'UDP').length;
  const estCount  = data.filter(c => c.state === 'ESTABLISHED').length;
  const lisCount  = data.filter(c => c.state === 'LISTENING').length;
  const twCount   = data.filter(c => c.state === 'TIME_WAIT').length;

  const stateChartData = [
    { name: 'Established', count: estCount, fill: '#34d399' },
    { name: 'Listening',   count: lisCount, fill: '#6366f1' },
    { name: 'Time Wait',   count: twCount,  fill: '#fbbf24' },
    { name: 'Other',       count: Math.max(0, data.length - estCount - lisCount - twCount), fill: '#334155' },
  ];

  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Active <span className="gradient-text">Connections</span>
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
            Live Windows socket table parsed directly from host operating system kernel (<code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono', fontSize: 11 }}>netstat -ano</code>)
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
            color: '#94a3b8', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '9px 16px',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#818cf8'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin-slow' : ''} />
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Top Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) 1.5fr', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'TCP Sockets', val: tcpCount, color: '#6366f1', filterVal: '' },
          { label: 'UDP Sockets', val: udpCount, color: '#22d3ee', filterVal: '' },
          { label: 'Established', val: estCount, color: '#34d399', filterVal: 'ESTABLISHED' },
          { label: 'Listening',   val: lisCount, color: '#fbbf24', filterVal: 'LISTENING' },
        ].map(({ label, val, color, filterVal }) => (
          <div
            key={label}
            onClick={() => filterVal && setStateFilter(stateFilter === filterVal ? '' : filterVal)}
            style={{
              background: stateFilter === filterVal && filterVal ? `${color}15` : 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${stateFilter === filterVal && filterVal ? color : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 14, padding: '16px 18px', textAlign: 'center',
              cursor: filterVal ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = stateFilter === filterVal && filterVal ? color : 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = ''; }}
          >
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color, fontFamily: 'JetBrains Mono' }}>{val}</div>
          </div>
        ))}

        {/* State mini bar distribution */}
        <div style={{
          background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 18px',
        }}>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
            Socket Distribution
          </div>
          <ResponsiveContainer width="100%" height={52}>
            <BarChart data={stateChartData} margin={{ top: 0, right: 0, bottom: 0, left: -32 }} barSize={14}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} />
              <YAxis tick={false} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#080d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                itemStyle={{ color: '#e2e8f0' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stateChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
        padding: '12px 16px', marginBottom: 16,
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search IP, port, PID, or state…"
            style={{
              width: '100%', height: 38, paddingLeft: 36, paddingRight: 14,
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, color: '#f1f5f9', fontSize: 13, outline: 'none',
              fontFamily: 'JetBrains Mono',
            }}
          />
        </div>

        {/* Protocol Selector */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
          {['All', 'TCP', 'UDP'].map(p => {
            const val = p === 'All' ? '' : p;
            const active = protocolFilter === val;
            return (
              <button
                key={p}
                onClick={() => setProto(val)}
                style={{
                  border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700,
                  background: active ? '#6366f1' : 'transparent',
                  color: active ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* State Filter */}
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          style={{
            height: 38, padding: '0 12px', background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
            color: '#94a3b8', fontSize: 12, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="" style={{ background: '#080d1a' }}>All States</option>
          <option value="ESTABLISHED" style={{ background: '#080d1a' }}>Established</option>
          <option value="LISTENING" style={{ background: '#080d1a' }}>Listening</option>
          <option value="TIME_WAIT" style={{ background: '#080d1a' }}>Time Wait</option>
          <option value="CLOSE_WAIT" style={{ background: '#080d1a' }}>Close Wait</option>
        </select>

        {/* Limit Selector */}
        <select
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          style={{
            height: 38, padding: '0 10px', background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
            color: '#94a3b8', fontSize: 12, cursor: 'pointer', outline: 'none',
          }}
        >
          {[25, 50, 100, 200, 500].map(n => (
            <option key={n} value={n} style={{ background: '#080d1a' }}>Show {n}</option>
          ))}
        </select>
      </div>

      {/* Socket Table */}
      <div style={{
        background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ padding: '12px 16px', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: 80 }}>Proto</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Local Address</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: 90 }}>Port</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Remote Address</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: 90 }}>Port</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: 140 }}>State</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: 80 }}>PID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#475569', padding: '48px' }}>
                    {loading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <Loader2 size={18} className="animate-spin-slow" color="#6366f1" />
                        <span style={{ fontSize: 13, color: '#94a3b8' }}>Reading system socket tables…</span>
                      </div>
                    ) : 'No matching connections found'}
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.005)' : 'transparent',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.035)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.005)' : 'transparent'}
                  >
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{
                        background: c.protocol === 'TCP' ? 'rgba(99,102,241,0.12)' : 'rgba(34,211,238,0.12)',
                        color: c.protocol === 'TCP' ? '#818cf8' : '#22d3ee',
                        border: `1px solid ${c.protocol === 'TCP' ? 'rgba(99,102,241,0.3)' : 'rgba(34,211,238,0.3)'}`,
                        borderRadius: 6, fontSize: 10, fontWeight: 800, padding: '3px 7px',
                        letterSpacing: '0.05em', fontFamily: 'JetBrains Mono',
                      }}>
                        {c.protocol}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', fontFamily: 'JetBrains Mono', fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>
                      {c.localAddress || '—'}
                    </td>
                    <td style={{ padding: '11px 16px', fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>
                      {c.localPort || '—'}
                    </td>
                    <td style={{ padding: '11px 16px', fontFamily: 'JetBrains Mono', fontSize: 13, color: c.remoteAddress && c.remoteAddress !== '*' ? '#94a3b8' : '#334155' }}>
                      {c.remoteAddress || '*'}
                    </td>
                    <td style={{ padding: '11px 16px', fontFamily: 'JetBrains Mono', fontSize: 12, color: '#64748b' }}>
                      {c.remotePort || '*'}
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <StateBadge state={c.state} />
                    </td>
                    <td style={{ padding: '11px 16px', fontFamily: 'JetBrains Mono', fontSize: 11, color: '#475569' }}>
                      {c.pid || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div style={{
            padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <span style={{ fontSize: 12, color: '#475569' }}>
              Displaying <strong style={{ color: '#e2e8f0' }}>{filtered.length}</strong> of{' '}
              <strong style={{ color: '#e2e8f0' }}>{data.length}</strong> live sockets
              {filter && <span style={{ color: '#818cf8' }}> · match "{filter}"</span>}
            </span>
            <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'JetBrains Mono' }}>
              {tcpCount} TCP · {udpCount} UDP
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
