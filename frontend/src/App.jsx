import { useState, useEffect, useRef } from "react";

// Animated number counter
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

// Glitch text effect
function GlitchText({ text, className }) {
  return (
    <span className={`glitch-wrap ${className}`} data-text={text}>
      {text}
    </span>
  );
}

// Scan line animation component
function ScanLine() {
  return <div className="scan-line" />;
}

// Hex grid background
function HexBackground() {
  return (
    <div className="hex-bg">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="hex-dot" style={{
          left: `${(i % 8) * 13 + (Math.floor(i / 8) % 2) * 6.5}%`,
          top: `${Math.floor(i / 8) * 14}%`,
          animationDelay: `${(i * 0.3) % 4}s`
        }} />
      ))}
    </div>
  );
}

const SEVERITY_CONFIG = {
  Critical: { bar: "#ff2d55", glow: "rgba(255,45,85,0.4)", label: "CRITICAL", dot: "#ff2d55" },
  High:     { bar: "#ff6b00", glow: "rgba(255,107,0,0.4)",  label: "HIGH",     dot: "#ff6b00" },
  Medium:   { bar: "#ffd60a", glow: "rgba(255,214,10,0.35)", label: "MEDIUM",  dot: "#ffd60a" },
  Low:      { bar: "#30d158", glow: "rgba(48,209,88,0.35)",  label: "LOW",     dot: "#30d158" },
};

function RiskArc({ score }) {
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ * 0.75;
  const color = score >= 75 ? "#ff2d55" : score >= 50 ? "#ff6b00" : score >= 25 ? "#ffd60a" : "#30d158";
  return (
    <svg width="140" height="100" viewBox="0 0 140 100">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <path d={`M ${cx - r * Math.cos(Math.PI * 0.75)} ${cy - r * Math.sin(Math.PI * 0.75)} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(Math.PI * 0.75)} ${cy - r * Math.sin(Math.PI * 0.75)}`}
        fill="none" stroke="#1a2035" strokeWidth="10" strokeLinecap="round"/>
      <path d={`M ${cx - r * Math.cos(Math.PI * 0.75)} ${cy - r * Math.sin(Math.PI * 0.75)} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(Math.PI * 0.75)} ${cy - r * Math.sin(Math.PI * 0.75)}`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} filter="url(#glow)"
        style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)" }}/>
      <text x={cx} y={cy + 8} textAnchor="middle" fill={color} fontSize="22" fontWeight="700" fontFamily="'Share Tech Mono', monospace">{score}%</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill="#4a5568" fontSize="9" fontFamily="'Share Tech Mono', monospace" letterSpacing="2">RISK SCORE</text>
    </svg>
  );
}

export default function App() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef();

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const checkEmail = async () => {
    if (!email) return;
    setLoading(true);
    setData(null);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      setData(result);
    } catch {
      alert("Backend connection failed");
    }
    setLoading(false);
  };

  const cfg = data ? (SEVERITY_CONFIG[data.risk_level] || SEVERITY_CONFIG.Low) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@300;400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #020b18; }
        :root {
          --cyan: #00d4ff;
          --cyan-dim: rgba(0,212,255,0.15);
          --red: #ff2d55;
          --panel: rgba(6,18,38,0.85);
          --border: rgba(0,212,255,0.12);
          --border-bright: rgba(0,212,255,0.45);
          --text-dim: #4a6080;
          --text-mid: #7a90b0;
          --text-bright: #c8ddf0;
        }
        .app { min-height: 100vh; background: #020b18; font-family: 'Exo 2', sans-serif; color: #c8ddf0; overflow-x: hidden; position: relative; }

        /* Hex background */
        .hex-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .hex-dot { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: rgba(0,212,255,0.12); animation: pulse-dot 4s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:0.1;transform:scale(1);} 50%{opacity:0.5;transform:scale(1.8);} }

        /* Grid lines */
        .grid-lines { position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px);
          background-size: 60px 60px;
        }

        /* Scan line */
        .scan-line { position: fixed; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,rgba(0,212,255,0.25),transparent);
          animation: scan 8s linear infinite; pointer-events:none; z-index:1; }
        @keyframes scan { 0%{top:-2px} 100%{top:100vh} }

        /* Top glow */
        .top-glow { position:fixed; top:0; left:50%; transform:translateX(-50%); width:700px; height:1px; background:linear-gradient(90deg,transparent,rgba(0,212,255,0.6),transparent); z-index:2; }
        .top-glow::after { content:''; position:absolute; top:0; left:50%; transform:translateX(-50%); width:300px; height:80px; background:radial-gradient(ellipse,rgba(0,212,255,0.08) 0%,transparent 70%); }

        /* Main */
        .main { position:relative; z-index:3; max-width:900px; margin:0 auto; padding:40px 20px 80px; }

        /* Header */
        .header { text-align:center; margin-bottom:56px; opacity:0; transform:translateY(-20px); transition:all 0.8s cubic-bezier(.4,0,.2,1); }
        .header.show { opacity:1; transform:translateY(0); }
        .header-eyebrow { font-family:'Share Tech Mono',monospace; font-size:11px; letter-spacing:6px; color:var(--cyan); text-transform:uppercase; margin-bottom:14px; display:flex; align-items:center; justify-content:center; gap:12px; }
        .header-eyebrow::before, .header-eyebrow::after { content:''; flex:1; max-width:80px; height:1px; background:linear-gradient(90deg,transparent,var(--cyan)); }
        .header-eyebrow::after { background:linear-gradient(90deg,var(--cyan),transparent); }
        .header-title { font-size:clamp(28px,5vw,48px); font-weight:800; letter-spacing:-0.5px; line-height:1; color:#fff; text-shadow: 0 0 40px rgba(0,212,255,0.3); }
        .header-title span { color:var(--cyan); }
        .header-sub { font-size:13px; color:var(--text-dim); margin-top:12px; font-family:'Share Tech Mono',monospace; letter-spacing:1px; }

        /* Search */
        .search-wrap { display:flex; justify-content:center; margin-bottom:48px; opacity:0; transform:translateY(16px); transition:all 0.8s 0.2s cubic-bezier(.4,0,.2,1); }
        .search-wrap.show { opacity:1; transform:translateY(0); }
        .search-inner { display:flex; width:100%; max-width:560px; position:relative; }
        .search-inner::before { content:''; position:absolute; inset:-1px; border-radius:4px; background:linear-gradient(135deg, var(--cyan-dim), transparent); pointer-events:none; transition:opacity 0.3s; opacity:0.6; }
        .search-inner.focused::before { opacity:1; background:linear-gradient(135deg,rgba(0,212,255,0.4),rgba(0,212,255,0.1)); }
        .search-input { flex:1; background:rgba(0,16,36,0.9); border:1px solid var(--border); border-right:none; padding:14px 20px; font-family:'Share Tech Mono',monospace; font-size:14px; color:#fff; outline:none; border-radius:4px 0 0 4px; letter-spacing:0.5px; transition:border-color 0.2s; }
        .search-input::placeholder { color:var(--text-dim); }
        .search-input:focus { border-color:rgba(0,212,255,0.4); }
        .search-btn { background:var(--cyan); border:none; padding:14px 28px; font-family:'Rajdhani',sans-serif; font-size:15px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#020b18; cursor:pointer; border-radius:0 4px 4px 0; transition:all 0.2s; white-space:nowrap; position:relative; overflow:hidden; }
        .search-btn::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,0.15); opacity:0; transition:opacity 0.2s; }
        .search-btn:hover::after { opacity:1; }
        .search-btn:hover { box-shadow:0 0 24px rgba(0,212,255,0.5); }
        .search-btn:disabled { opacity:0.6; cursor:not-allowed; }

        /* Loading bar */
        .loading-bar { height:2px; background:linear-gradient(90deg,transparent,var(--cyan),transparent); animation:loading-sweep 1.2s linear infinite; border-radius:2px; margin-bottom:40px; }
        @keyframes loading-sweep { 0%{background-position:-200px} 100%{background-position:calc(100% + 200px)} }

        /* Panel */
        .panel { background:var(--panel); border:1px solid var(--border); border-radius:6px; position:relative; overflow:hidden; backdrop-filter:blur(12px); animation:fadeUp 0.6s ease both; }
        .panel::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--cyan-dim),var(--cyan),var(--cyan-dim),transparent); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .panel-header { padding:20px 28px 0; display:flex; align-items:center; gap:12px; }
        .panel-label { font-family:'Share Tech Mono',monospace; font-size:10px; letter-spacing:4px; color:var(--cyan); text-transform:uppercase; }
        .panel-line { flex:1; height:1px; background:var(--border); }
        .panel-body { padding:24px 28px 28px; }

        /* Risk overview */
        .risk-grid { display:grid; grid-template-columns:auto 1fr; gap:32px; align-items:center; }
        @media(max-width:560px){.risk-grid{grid-template-columns:1fr;}}
        .risk-stats { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .stat-block { background:rgba(0,0,0,0.3); border:1px solid var(--border); border-radius:4px; padding:16px; }
        .stat-label { font-family:'Share Tech Mono',monospace; font-size:9px; letter-spacing:3px; color:var(--text-dim); text-transform:uppercase; margin-bottom:8px; }
        .stat-value { font-size:32px; font-weight:800; line-height:1; color:#fff; }
        .level-badge { display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:3px; font-family:'Rajdhani',sans-serif; font-size:16px; font-weight:700; letter-spacing:3px; text-transform:uppercase; }

        /* Categories */
        .cat-list { display:flex; flex-wrap:wrap; gap:8px; }
        .cat-chip { font-family:'Share Tech Mono',monospace; font-size:11px; padding:5px 12px; border-radius:2px; border:1px solid rgba(255,45,85,0.3); background:rgba(255,45,85,0.08); color:#ff6b80; letter-spacing:1px; }

        /* Recommendations */
        .rec-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:12px; margin-top:4px; }
        .rec-card { background:rgba(0,0,0,0.3); border:1px solid var(--border); border-radius:4px; padding:16px; display:flex; gap:12px; transition:border-color 0.2s,transform 0.2s; }
        .rec-card:hover { border-color:rgba(0,212,255,0.35); transform:translateY(-2px); }
        .rec-icon { font-size:18px; flex-shrink:0; margin-top:2px; }
        .rec-text { font-size:13px; color:var(--text-mid); line-height:1.6; }

        /* Timeline */
        .timeline { display:flex; flex-direction:column; gap:2px; }
        .breach-card { background:var(--panel); border:1px solid var(--border); border-radius:6px; overflow:hidden; transition:border-color 0.25s; cursor:default; }
        .breach-card:hover { border-color:var(--border-bright); }
        .breach-card-inner { padding:22px 26px; display:flex; align-items:center; gap:20px; }
        .breach-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; box-shadow:0 0 8px currentColor; }
        .breach-info { flex:1; min-width:0; }
        .breach-name { font-family:'Rajdhani',sans-serif; font-size:18px; font-weight:700; letter-spacing:1px; color:#fff; }
        .breach-domain { font-family:'Share Tech Mono',monospace; font-size:11px; color:var(--text-dim); margin-top:2px; }
        .breach-meta { display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; }
        .breach-date { font-family:'Share Tech Mono',monospace; font-size:11px; color:var(--text-dim); }
        .sev-badge { font-family:'Rajdhani',sans-serif; font-size:12px; font-weight:700; letter-spacing:2px; padding:3px 10px; border-radius:2px; text-transform:uppercase; }
        .breach-tags { padding:0 26px 18px; display:flex; flex-wrap:wrap; gap:6px; border-top:1px solid var(--border); padding-top:14px; margin:0 26px 18px; }
        .breach-tag { font-family:'Share Tech Mono',monospace; font-size:10px; padding:4px 10px; border-radius:2px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:var(--text-mid); letter-spacing:0.5px; }

        /* Section title */
        .section-title { font-family:'Rajdhani',sans-serif; font-size:22px; font-weight:700; letter-spacing:2px; color:#fff; display:flex; align-items:center; gap:12px; margin-bottom:20px; }
        .section-title::after { content:''; flex:1; height:1px; background:var(--border); }

        /* Glitch */
        .glitch-wrap { position:relative; display:inline-block; }

        /* Divider */
        .divider { height:1px; background:var(--border); margin:40px 0; }
      `}</style>

      <div className="app">
        <div className="grid-lines" />
        <HexBackground />
        <ScanLine />
        <div className="top-glow" />

        <div className="main">

          {/* Header */}
          <header className={`header ${visible ? "show" : ""}`}>
            <div className="header-eyebrow">THREAT INTELLIGENCE SYSTEM</div>
            <h1 className="header-title">
              DARK WEB <span>MONITOR</span>
            </h1>
            <p className="header-sub">// CYBER EXPOSURE & BREACH ANALYSIS PLATFORM v2.4.1</p>
          </header>

          {/* Search */}
          <div className={`search-wrap ${visible ? "show" : ""}`}>
            <div className={`search-inner ${inputFocused ? "focused" : ""}`}>
              <input
                ref={inputRef}
                type="email"
                className="search-input"
                placeholder="target@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyDown={e => e.key === "Enter" && checkEmail()}
              />
              <button className="search-btn" onClick={checkEmail} disabled={loading}>
                {loading ? "SCANNING" : "SCAN"}
              </button>
            </div>
          </div>

          {loading && <div className="loading-bar" />}

          {data && cfg && (
            <div style={{ animation: "fadeUp 0.5s ease both" }}>

              {/* Risk Overview Panel */}
              <div className="panel" style={{ marginBottom: 16 }}>
                <div className="panel-header">
                  <span className="panel-label">Risk Assessment</span>
                  <div className="panel-line" />
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: 2 }}>
                    {new Date().toISOString().split("T")[0]}
                  </span>
                </div>
                <div className="panel-body">
                  <div className="risk-grid">
                    {/* Arc gauge */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <RiskArc score={data.risk_score} />
                      <div className="level-badge" style={{
                        background: `${cfg.glow}`,
                        border: `1px solid ${cfg.bar}`,
                        color: cfg.bar,
                        textShadow: `0 0 12px ${cfg.bar}`
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.bar, display: "inline-block", boxShadow: `0 0 6px ${cfg.bar}` }} />
                        {cfg.label}
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div className="risk-stats">
                        <div className="stat-block">
                          <div className="stat-label">Breaches Found</div>
                          <div className="stat-value" style={{ color: cfg.bar, textShadow: `0 0 20px ${cfg.bar}` }}>
                            <AnimatedNumber value={data.breach_count} />
                          </div>
                        </div>
                        <div className="stat-block">
                          <div className="stat-label">Data Points</div>
                          <div className="stat-value" style={{ color: "var(--cyan)", textShadow: "0 0 20px rgba(0,212,255,0.5)" }}>
                            <AnimatedNumber value={data.breaches?.reduce((a, b) => a + (b.exposed_data?.length || 0), 0) || 0} />
                          </div>
                        </div>
                      </div>

                      {/* Categories */}
                      <div>
                        <div className="stat-label" style={{ marginBottom: 10 }}>Exposed Data Categories</div>
                        <div className="cat-list">
                          {data.exposed_categories?.map((cat, i) => (
                            <span key={i} className="cat-chip">{cat}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations Panel */}
              <div className="panel" style={{ marginBottom: 40 }}>
                <div className="panel-header">
                  <span className="panel-label">AI Security Recommendations</span>
                  <div className="panel-line" />
                  <span style={{
                    fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 3,
                    background: "var(--cyan)", color: "#020b18", padding: "3px 8px", borderRadius: 2, fontWeight: 700
                  }}>AI</span>
                </div>
                <div className="panel-body" style={{ paddingTop: 16 }}>
                  <div className="rec-grid">
                    {data.recommendations?.filter(r => r?.trim()).map((rec, i) => (
                      <div key={i} className="rec-card" style={{ animationDelay: `${i * 0.07}s` }}>
                        <span className="rec-icon">⚠️</span>
                        <p className="rec-text">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Breach Timeline */}
              <div className="section-title">Breach Timeline</div>
              <div className="timeline">
                {data.breaches?.map((breach, i) => {
                  const bc = SEVERITY_CONFIG[breach.severity] || SEVERITY_CONFIG.Low;
                  return (
                    <div key={i} className="breach-card" style={{ animationDelay: `${i * 0.08}s` }}>
                      <div className="breach-card-inner">
                        <span className="breach-dot" style={{ color: bc.dot, background: bc.dot }} />
                        <div className="breach-info">
                          <div className="breach-name">{breach.name}</div>
                          <div className="breach-domain">{breach.domain}</div>
                        </div>
                        <div className="breach-meta">
                          <span className="breach-date">{breach.breach_date}</span>
                          <span className="sev-badge" style={{
                            background: bc.glow, border: `1px solid ${bc.bar}`, color: bc.bar
                          }}>{bc.label}</span>
                        </div>
                      </div>
                      {breach.exposed_data?.length > 0 && (
                        <div className="breach-tags">
                          {breach.exposed_data.map((d, j) => (
                            <span key={j} className="breach-tag">{d}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}