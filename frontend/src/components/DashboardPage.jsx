import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, AlertTriangle, Wifi, Activity, CheckCircle, RefreshCw, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { connectionSummary, ping } from '../services/api';

const clamp = (arr, max = 15) => arr.length > max ? arr.slice(-max) : arr;
const now = () => new Date().toLocaleTimeString('en-US', { hour12: false });

/* ─── Animated number ─────────────────────────────────────── */
function Num({ value, dec = 0, suffix = '', color }) {
  const [v, setV] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    const end = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (end === ref.current) return;
    const start = ref.current; ref.current = end;
    const t0 = performance.now();
    const dur = 700;
    const go = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const cur = start + (end - start) * e;
      setV(dec > 0 ? +cur.toFixed(dec) : Math.round(cur));
      if (p < 1) requestAnimationFrame(go); else setV(end);
    };
    requestAnimationFrame(go);
  }, [value]);
  return <span style={{ color, fontFamily: 'JetBrains Mono', fontWeight: 800 }}>{dec > 0 ? v.toFixed(dec) : v}{suffix}</span>;
}

/* ─── Stat card ───────────────────────────────────────────── */
function Card({ label, value, dec, suffix, sub, color, icon: Icon, trend, delay = 0 }) {
  return (
    <div className="animate-slide-in" style={{
      animationDelay: `${delay}ms`,
      flex: 1, minWidth: 130,
      background: 'rgba(255,255,255,0.025)',
      backdropFilter: 'blur(20px)',
      border: `1px solid rgba(255,255,255,0.07)`,
      borderRadius: 16, padding: '18px 20px',
      position: 'relative', overflow: 'hidden',
      transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `rgba(255,255,255,0.045)`;
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}18`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Ambient blob */}
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 90, height: 90,
        borderRadius: '50%', background: color, opacity: 0.07, filter: 'blur(25px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {label}
        </span>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: `${color}15`, border: `1px solid ${color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={13} color={color} strokeWidth={2.5} />
        </div>
      </div>

      <div style={{ fontSize: 30, lineHeight: 1, marginBottom: 8 }}>
        <Num value={value} dec={dec} suffix={suffix} color={color} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {trend === 'up'   && <TrendingUp size={11} color="#34d399" />}
        {trend === 'down' && <TrendingDown size={11} color="#f87171" />}
        {trend === 'flat' && <Minus size={11} color="#475569" />}
        <span style={{ fontSize: 11, color: '#475569' }}>{sub}</span>
      </div>
    </div>
  );
}

/* ─── Chart tooltip ───────────────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(5,8,17,0.95)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
      padding: '10px 14px', fontSize: 11, fontFamily: 'JetBrains Mono',
    }}>
      <div style={{ color: '#475569', marginBottom: 6, fontSize: 10 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 700, marginBottom: 2 }}>
          {p.name} · {p.value}ms
        </div>
      ))}
    </div>
  );
};

/* ─── Dashboard ───────────────────────────────────────────── */
export default function DashboardPage({ setActiveTab }) {
  const [summary, setSummary]               = useState(null);
  const [ping_, setPing]                    = useState(null);
  const [history, setHistory]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [lastUpdated, setLastUpdated]       = useState('');

  const refresh = async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const [sum, pg] = await Promise.all([connectionSummary(), ping('8.8.8.8', 2)]);
      setSummary(sum); setPing(pg); setLastUpdated(now());
      if (pg?.avgRttMs != null) {
        setHistory(prev => clamp([...prev, {
          t: now(), Min: +pg.minRttMs.toFixed(1), Avg: +pg.avgRttMs.toFixed(1), Max: +pg.maxRttMs.toFixed(1),
        }]));
      }
    } catch (e) { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { refresh(); const iv = setInterval(refresh, 15000); return () => clearInterval(iv); }, []);

  const lat = ping_?.avgRttMs;
  const loss = ping_?.packetLossPercent;
  const q = !lat ? { label: 'Unknown', color: '#475569' }
    : lat < 50  ? { label: 'Excellent', color: '#34d399' }
    : lat < 100 ? { label: 'Good',      color: '#22d3ee' }
    : lat < 200 ? { label: 'Fair',      color: '#fbbf24' }
    :             { label: 'Poor',      color: '#f87171' };

  const pie = summary ? [
    { n: 'TCP', v: summary.tcpCount || 0 },
    { n: 'UDP', v: summary.udpCount || 0 },
  ] : [];
  const PIE_C = ['#6366f1', '#22d3ee'];

  const donut = summary ? [
    { n: 'Established', v: summary.establishedCount || 0, c: '#34d399' },
    { n: 'Listening',   v: summary.listeningCount    || 0, c: '#6366f1' },
    { n: 'Other',       v: Math.max(0,(summary.totalConnections||0)-(summary.establishedCount||0)-(summary.listeningCount||0)), c: '#1e293b' },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
            Network <span className="gradient-text">Dashboard</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span className="animate-pulse-live" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
            <span style={{ fontSize: 12, color: '#475569' }}>
              Live · auto-refreshes every 15s
              {lastUpdated && <span style={{ color: '#334155', marginLeft: 10 }}>last at {lastUpdated}</span>}
            </span>
          </div>
        </div>
        <button onClick={() => refresh(true)} disabled={refreshing} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
          color: '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '9px 16px',
          transition: 'all 0.18s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#818cf8'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#64748b'; }}
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin-slow' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="stagger" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
        <Card label="Avg Latency"   value={lat}                  dec={1}  suffix="ms" sub={q.label}          color={q.color}   icon={Clock}         trend="flat" delay={0}   />
        <Card label="Packet Loss"   value={loss}                 dec={1}  suffix="%"  sub={loss===0?'Healthy ✓':'Drops!'}  color={loss===0?'#34d399':'#f87171'} icon={AlertTriangle} trend="flat" delay={60}  />
        <Card label="TCP Sockets"   value={summary?.tcpCount}    dec={0}              sub={`${summary?.establishedCount??0} established`} color="#6366f1"  icon={Wifi}          trend="flat" delay={120} />
        <Card label="UDP Sockets"   value={summary?.udpCount}    dec={0}              sub="Active UDP sockets"              color="#22d3ee"  icon={Activity}      trend="flat" delay={180} />
        <Card label="Total Sockets" value={summary?.totalConnections} dec={0}         sub={`${summary?.listeningCount??0} listening`}     color="#fbbf24"  icon={CheckCircle}   trend="flat" delay={240} />
      </div>

      {/* ── Row 2: Latency area chart + donut ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 16 }}>

        {/* Latency chart */}
        <div className="animate-slide-in" style={{
          animationDelay: '80ms',
          background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 22px 14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Latency History</h3>
              <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Ping RTT to 8.8.8.8 — auto updated</p>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {[['Min','#34d399'],['Avg','#6366f1'],['Max','#fbbf24']].map(([l,c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 3, borderRadius: 2, background: c }} />
                  <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          {history.length < 2 ? (
            <div style={{ height: 190, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div className="animate-spin-slow" style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.06)', borderTop: '3px solid #6366f1', borderRadius: '50%' }} />
              <span style={{ fontSize: 12, color: '#334155' }}>Collecting data ({history.length}/2)…</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={history} margin={{ top: 5, right: 4, bottom: 0, left: -22 }}>
                <defs>
                  {[['mn','#34d399'],['av','#6366f1'],['mx','#fbbf24']].map(([k,c])=>(
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={c} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" vertical={false}/>
                <XAxis dataKey="t" tick={{ fontSize:10, fill:'#334155' }} tickLine={false} axisLine={false}/>
                <YAxis tick={{ fontSize:10, fill:'#334155' }} tickLine={false} axisLine={false} unit="ms"/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="Max" name="Max" stroke="#fbbf24" strokeWidth={1.5} fill="url(#g-mx)" dot={false} strokeDasharray="4 2"/>
                <Area type="monotone" dataKey="Avg" name="Avg" stroke="#6366f1" strokeWidth={2.5}   fill="url(#g-av)" dot={{ r:3, fill:'#6366f1', strokeWidth:0 }}/>
                <Area type="monotone" dataKey="Min" name="Min" stroke="#34d399" strokeWidth={1.5} fill="url(#g-mn)" dot={false} strokeDasharray="4 2"/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut: Connection states */}
        <div className="animate-slide-in" style={{
          animationDelay: '100ms',
          background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Connection States</h3>
          <p style={{ fontSize: 11, color: '#475569', marginTop: 2, marginBottom: 8 }}>TCP socket breakdown</p>
          {summary ? (
            <>
              <ResponsiveContainer width="100%" height={155}>
                <PieChart>
                  <Pie data={donut.map(d=>({name:d.n,value:d.v}))} cx="50%" cy="50%"
                    innerRadius={44} outerRadius={66} paddingAngle={4} dataKey="value" strokeWidth={0}>
                    {donut.map((d,i)=><Cell key={i} fill={d.c}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'rgba(5,8,17,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:11 }} itemStyle={{color:'#e2e8f0'}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {donut.filter(d=>d.n!=='Other').map(d=>(
                  <div key={d.n} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:9, height:9, borderRadius:3, background:d.c }}/>
                      <span style={{ fontSize:12, color:'#94a3b8' }}>{d.n}</span>
                    </div>
                    <span style={{ fontSize:14, fontWeight:800, color:d.c, fontFamily:'JetBrains Mono' }}>{d.v}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'#334155', fontSize:12 }}>Loading…</div>
          )}
        </div>
      </div>

      {/* ── Row 3: Pie + Ping gauge + Quick actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* Protocol pie */}
        <div className="animate-slide-in" style={{
          animationDelay: '120ms',
          background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Protocol Split</h3>
          <p style={{ fontSize: 11, color: '#475569', marginTop: 2, marginBottom: 8 }}>TCP vs UDP distribution</p>
          {summary ? (
            <ResponsiveContainer width="100%" height={165}>
              <PieChart>
                <Pie data={pie.map(d=>({name:d.n,value:d.v}))} cx="50%" cy="50%" outerRadius={62}
                  paddingAngle={5} dataKey="value" strokeWidth={0}
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize:11, fontFamily:'JetBrains Mono', fontWeight:700 }}>
                  {pie.map((_,i)=><Cell key={i} fill={PIE_C[i]}/>)}
                </Pie>
                <Tooltip contentStyle={{ background:'rgba(5,8,17,0.95)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, fontSize:11 }} itemStyle={{color:'#e2e8f0'}}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:165, display:'flex', alignItems:'center', justifyContent:'center', color:'#334155', fontSize:12 }}>Loading…</div>
          )}
          {summary && (
            <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:4 }}>
              {[['TCP','#6366f1',summary.tcpCount],['UDP','#22d3ee',summary.udpCount]].map(([l,c,v])=>(
                <div key={l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#475569', marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:16, fontWeight:800, color:c, fontFamily:'JetBrains Mono' }}>{v??'—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ping gauge */}
        <div className="animate-slide-in" style={{
          animationDelay: '140ms',
          background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20,
          display: 'flex', flexDirection: 'column',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Ping Health</h3>
          <p style={{ fontSize: 11, color: '#475569', marginTop: 2, marginBottom: 18 }}>Round-trip time to 8.8.8.8</p>
          {ping_ ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              {/* Gauge ring */}
              <div style={{
                width: 110, height: 110, borderRadius: '50%', marginBottom: 14,
                border: `7px solid ${q.color}`,
                background: `radial-gradient(circle at center, ${q.color}10 0%, transparent 70%)`,
                boxShadow: `0 0 0 1px ${q.color}20, 0 0 30px ${q.color}35, inset 0 0 20px ${q.color}10`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.6s',
              }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: q.color, fontFamily:'JetBrains Mono', lineHeight:1 }}>
                  {lat?.toFixed(0) ?? '—'}
                </div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>ms avg</div>
              </div>
              {/* Quality badge */}
              <div style={{
                padding: '5px 16px', borderRadius: 20, marginBottom: 16,
                background: `${q.color}15`, border: `1px solid ${q.color}30`,
                fontSize: 12, fontWeight: 800, color: q.color, letterSpacing: '0.04em',
              }}>
                {q.label}
              </div>
              {/* Min/Avg/Max row */}
              <div style={{ display:'flex', width:'100%', gap:8 }}>
                {[['Min',ping_.minRttMs,'#34d399'],['Avg',ping_.avgRttMs,'#6366f1'],['Max',ping_.maxRttMs,'#fbbf24']].map(([l,v,c])=>(
                  <div key={l} style={{
                    flex:1, textAlign:'center', background:'rgba(0,0,0,0.3)',
                    borderRadius:8, padding:'8px 4px', border:'1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ fontSize:13, fontWeight:800, color:c, fontFamily:'JetBrains Mono' }}>{v?.toFixed(1)}</div>
                    <div style={{ fontSize:9, color:'#475569', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#334155', fontSize:12 }}>Loading…</div>
          )}
        </div>

        {/* Quick actions */}
        <div className="animate-slide-in" style={{
          animationDelay: '160ms',
          background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { key:'ping',        label:'Ping Monitor',  desc:'Test latency to any host',  color:'#34d399', emoji:'📡' },
              { key:'traceroute',  label:'Traceroute',    desc:'Trace route hop by hop',    color:'#a78bfa', emoji:'🗺️' },
              { key:'dns',         label:'DNS Lookup',    desc:'Resolve domain → IP',       color:'#22d3ee', emoji:'🌐' },
              { key:'connections', label:'Connections',   desc:'View live TCP/UDP table',   color:'#fbbf24', emoji:'🔌' },
            ].map(({ key, label, desc, color, emoji }) => (
              <div key={label} onClick={() => setActiveTab && setActiveTab(key)} role="button" tabIndex={0} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'11px 13px', borderRadius:10, cursor:'pointer',
                background:'rgba(0,0,0,0.25)', border:`1px solid rgba(255,255,255,0.05)`,
                borderLeft:`3px solid ${color}`,
                transition:'all 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background=`${color}0d`; e.currentTarget.style.borderColor=`${color}40`; e.currentTarget.style.transform='translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(0,0,0,0.25)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'; e.currentTarget.style.transform=''; e.currentTarget.style.borderLeftColor=color; }}
              >
                <span style={{ fontSize:20, lineHeight:1 }}>{emoji}</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#e2e8f0', marginBottom:1 }}>{label}</div>
                  <div style={{ fontSize:10, color:'#475569' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
