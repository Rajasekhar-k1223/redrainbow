import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Terminal as TerminalIcon, Layout, ClipboardCheck, 
  Lock, Database, Activity, RefreshCw, LogOut, FileCode,
  Zap, Globe, Cpu, Server
} from "lucide-react";

import { health, healthMongo, healthRedis, login, me, getEvidence, createEvidence, uploadEvidence } from "./api.js";
import ScenarioOrchestrator from "./components/ScenarioOrchestrator";
import NeuralBackground from "./components/NeuralBackground";
import LandingPage from "./components/LandingPage";

const OS_ROLES = [
  { name: "Kali Linux", role: "General pentesting and recon", tag: "Red Team" },
  { name: "Parrot OS", role: "Lightweight pentest and privacy checks", tag: "Privacy" },
  { name: "BlackArch", role: "Advanced tooling and edge-case testing", tag: "Advanced" },
  { name: "BackBox", role: "Standard pentest workflow", tag: "Baseline" },
  { name: "Pentoo", role: "Wireless and live tests", tag: "Wireless" },
  { name: "SECHub", role: "Web app security testing", tag: "Web App" },
  { name: "CAINE", role: "Forensics and evidence handling", tag: "Forensics" },
  { name: "Tails", role: "Privacy and anonymity tasks", tag: "Anonymity" },
  { name: "Qubes OS", role: "Isolated high-risk testing", tag: "Isolation" },
  { name: "Security Onion", role: "Monitoring, SIEM, detection", tag: "Blue Team" },
  { name: "REMnux", role: "Malware analysis", tag: "Malware" },
];

const CHECKLIST = [
  "Written authorization for all tests",
  "Isolated lab network for high-risk activities",
  "Snapshot lab systems before tests",
  "Log all actions and findings",
  "Triage and rank vulnerabilities",
  "Fix critical and high first",
  "Retest and document closure",
  "Update threat model and controls",
];

const METRICS = [
  { label: "Systems", value: "11", note: "Specialized OS" },
  { label: "Pipelines", value: "4", note: "Red/Blue/Purple/Forensics" },
  { label: "Controls", value: "38", note: "Mapped safeguards" },
  { label: "Uptime", value: "99.95%", note: "Target SLO" },
];

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Layout },
  { id: "scenarios", label: "Lab Scenarios", icon: Zap },
  { id: "os", label: "OS Roles", icon: Cpu },
  { id: "checklist", label: "Checklist", icon: ClipboardCheck },
  { id: "vault", label: "Evidence Vault", icon: Lock },
  { id: "terminal", label: "Terminal", icon: TerminalIcon },
  { id: "internal", label: "Internal View", icon: Database },
];

function StatusDot({ ok }) {
  return (
    <span
      className={`inline-flex h-2.5 w-2.5 rounded-full ${
        ok === true ? "bg-emerald-400" : ok === false ? "bg-rose-400" : "bg-slate-500"
      } shadow-[0_0_12px_rgba(52,211,153,0.8)]`}
    />
  );
}

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("redrainbow_token") || "");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState({ api: null, redis: null, mongo: null });
  const [evidences, setEvidences] = useState([]);
  const [selectedOs, setSelectedOs] = useState("Kali Linux");
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [newEvidence, setNewEvidence] = useState({ title: "", description: "", evidence_type: "log" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const termRef = useRef(null);
  const terminal = useMemo(
    () =>
      new Terminal({
        convertEol: true,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 12,
        theme: { background: "#0b0d14", foreground: "#e2e8f0" },
      }),
    []
  );

  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        await health();
        if (mounted) setStatus((s) => ({ ...s, api: true }));
      } catch {
        if (mounted) setStatus((s) => ({ ...s, api: false }));
      }
      try {
        await healthRedis();
        if (mounted) setStatus((s) => ({ ...s, redis: true }));
      } catch {
        if (mounted) setStatus((s) => ({ ...s, redis: false }));
      }
      try {
        await healthMongo();
        if (mounted) setStatus((s) => ({ ...s, mongo: true }));
      } catch {
        if (mounted) setStatus((s) => ({ ...s, mongo: false }));
      }
    }

    poll();
    const timer = setInterval(poll, 8000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!termRef.current) return;

    terminal.open(termRef.current);
    terminal.writeln("RedRainbow Security Terminal");
    terminal.writeln("--------------------------------");

    const timer = setInterval(() => {
      const now = new Date();
      terminal.writeln(`[${now.toLocaleTimeString()}] heartbeat ok`);
    }, 3000);

    return () => {
      clearInterval(timer);
      terminal.dispose();
    };
  }, [terminal]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await login(username, password);
      setToken(data.access_token);
      localStorage.setItem("redrainbow_token", data.access_token);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  async function loadProfile() {
    setError("");
    try {
      const data = await me(token);
      setProfile(data);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    }
  }

  async function loadEvidence() {
    setError("");
    try {
      const data = await getEvidence(token);
      setEvidences(data);
    } catch (err) {
      setError(err.message || "Failed to load evidence");
    }
  }

  function handleSignOut() {
    setToken("");
    setProfile(null);
    setEvidences([]);
    localStorage.removeItem("redrainbow_token");
  }

  async function handleSubmitEvidence(e) {
    e.preventDefault();
    setError("");
    try {
      const created = await createEvidence(token, newEvidence);
      if (selectedFile) {
        await uploadEvidence(token, created.id, selectedFile);
      }
      setShowEvidenceForm(false);
      setNewEvidence({ title: "", description: "", evidence_type: "log" });
      setSelectedFile(null);
      loadEvidence();
    } catch (err) {
      setError(err.message || "Failed to save evidence");
    }
  }

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen">
      <NeuralBackground />
      
      <Routes>
        <Route path="/" element={
          <AnimatePresence mode="wait">
        {!token ? (
          <motion.div
            key="landing-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            {!showLogin ? (
              <LandingPage onEnter={() => setShowLogin(true)} />
            ) : (
              <motion.section 
                id="login"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6"
              >
                <div className="absolute inset-0 bg-[#05060f]/95 backdrop-blur-3xl" />
                <div className="glass max-w-lg w-full rounded-[3rem] p-12 relative overflow-hidden scanline shadow-2xl">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Shield className="w-60 h-60 text-emerald-400" />
                  </div>
                  
                  <div className="relative text-center mb-10">
                    <motion.button 
                      onClick={() => setShowLogin(false)}
                      className="absolute top-0 left-0 text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-bold transition-colors"
                    >
                      ← Back to Home
                    </motion.button>
                    <div className="p-4 rounded-[2rem] bg-emerald-500/10 w-fit mx-auto mb-6 mt-4">
                      <Lock className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tighter">Secure Access Portal</h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">Identify yourself to access the command suite.</p>
                  </div>

                  <form onSubmit={handleLogin} className="relative space-y-6">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold text-center"
                      >
                        CRITICAL: {error}
                      </motion.div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold ml-1">Credential Alpha</label>
                      <input
                        required
                        type="text"
                        className="w-full rounded-2.5xl border border-white/5 bg-white/[0.03] px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                        placeholder="Agency Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold ml-1">Credential Beta</label>
                      <input
                        required
                        type="password"
                        className="w-full rounded-2.5xl border border-white/5 bg-white/[0.03] px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                        placeholder="Security Token"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "#10b981" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-5 rounded-3xl bg-emerald-500 text-white font-bold shadow-[0_12px_40px_rgba(16,185,129,0.3)] transition-all uppercase tracking-[0.3em] text-xs"
                    >
                      Authenticate Session
                    </motion.button>
                  </form>
                  
                  <p className="relative mt-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                    Uncontrolled access is strictly prohibited.
                  </p>
                </div>
              </motion.section>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
          >
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05060f]/60 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-medium">Command Suite V2.0</p>
                    <h1 className="text-lg font-bold text-white tracking-tight">RedRainbow <span className="text-emerald-400">Security</span></h1>
                  </div>
                </motion.div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex items-center gap-4 text-[11px] font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-2 text-slate-400"><StatusDot ok={status.api} /> API</div>
                    <div className="flex items-center gap-2 text-slate-400"><StatusDot ok={status.redis} /> Redis</div>
                    <div className="flex items-center gap-2 text-slate-400"><StatusDot ok={status.mongo} /> Mongo</div>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition text-xs font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </motion.button>
                </div>
              </div>
            </header>

      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-8 sticky top-28 h-fit">
          <div className="glass rounded-[2rem] p-6 scanline">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-6">Operations</h2>
            <nav className="space-y-1.5">
              {SECTIONS.map((s) => (
                <motion.button
                  key={s.id}
                  whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.06)" }}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors"
                  onClick={() => scrollTo(s.id)}
                >
                  <s.icon className="w-4 h-4 text-emerald-400/70" />
                  {s.label}
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="glass rounded-[2rem] p-6 border-emerald-500/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Globe className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Node: Secure</p>
                <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Product Mode Active</p>
              </div>
            </div>
          </div>
        </aside>        <main className="space-y-16">
          <motion.section 
            id="overview"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-emerald-500/5 blur-3xl rounded-full opacity-50" />
            
            <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-6 items-stretch">
              {/* Module Alpha: Tactical Command (Primary) */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-4 md:row-span-2 glass rounded-[3.5rem] p-12 relative overflow-hidden group grain hover-tactical"
              >
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <Shield className="w-64 h-64 text-emerald-500" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <Shield className="w-7 h-7 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Tactical Command</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tighter mb-6 leading-[0.9]">Mission <br /> <span className="text-emerald-500/80">Dashboard</span></h2>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                      Real-time orchestration of offensive and defensive security operations across 11 synchronized local and remote nodes.
                    </p>
                  </div>
                  
                  <div className="mt-16 grid grid-cols-2 gap-6 border-t border-white/5 pt-10">
                    {METRICS.slice(0, 2).map((m) => (
                      <div key={m.label} className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">{m.label}</p>
                        <p className="text-3xl font-bold text-white tracking-tight">{m.value} <span className="text-xs text-slate-600 font-medium tracking-normal ml-1">{m.note.split(' ')[0]}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Module Beta: Technical Signals (Secondary) */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-2 glass rounded-[3rem] p-10 relative overflow-hidden group grain hover-tactical"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                      <Activity className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">System Signals</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Live Telemetry</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                   {[
                     { label: "API_ROOT", status: status.api },
                     { label: "DATA_CORE", status: status.mongo },
                     { label: "AUTH_GATE", status: true }
                   ].map(signal => (
                     <div key={signal.label} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04]">
                        <span className="text-[10px] font-mono text-slate-400 tracking-tighter">{signal.label}</span>
                        <div className="flex items-center gap-2">
                           <StatusDot ok={signal.status} />
                           <span className={`text-[9px] font-black tracking-widest ${signal.status ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {signal.status ? 'SECURE' : 'OFFLINE'}
                           </span>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>

              {/* Module Gamma: Mission Pulse (Utility) */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-1 glass rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover-tactical"
              >
                <RefreshCw className="w-10 h-10 text-slate-600 mb-4 animate-spin-slow group-hover:text-emerald-400 transition-colors" />
                <p className="text-2xl font-bold text-white tracking-tighter">99.9%</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">SLA</p>
              </motion.div>

              {/* Module Delta: Launch Focus (Utility) */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-1 glass rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover-tactical"
              >
                <Zap className="w-10 h-10 text-amber-400/30 mb-4 group-hover:text-amber-400 transition-all" />
                <p className="text-xl font-bold text-white tracking-tighter">PHASE 2</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Mission Stage</p>
              </motion.div>
            </div>
          </motion.section>

          <motion.section 
            id="scenarios"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-[2.5rem] p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-32 h-32 text-emerald-500" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-emerald-500/10">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Lab Scenarios</h2>
                <p className="text-slate-400 text-sm mt-1">Select a core mission profile to begin orchestration.</p>
              </div>
            </div>
            <ScenarioOrchestrator onSelectOS={setSelectedOs} />
          </motion.section>

          <motion.section 
            id="os"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-[3rem] p-10 bg-white/[0.01]"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10">
                  <Cpu className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">System Map</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">11 tactical nodes mapped to mission objectives.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-stretch">
              {OS_ROLES.map((os, idx) => (
                <motion.div 
                  key={os.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className={`glass rounded-[2.5rem] p-8 group hover-tactical grain overflow-hidden ${
                    idx === 0 ? 'md:col-span-4' : 
                    idx === 1 ? 'md:col-span-2' : 
                    'md:col-span-2'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border ${
                      os.tag === 'Red Team' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      os.tag === 'Blue Team' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {os.tag}
                    </span>
                    <div className="flex gap-1">
                       <div className={`w-1 h-1 rounded-full ${idx % 3 === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                       <div className="w-1 h-1 rounded-full bg-slate-800" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tighter group-hover:text-emerald-400 transition-colors uppercase">{os.name}</h3>
                  <p className="text-slate-500 text-[11px] mt-3 leading-relaxed font-semibold uppercase tracking-wide">{os.role}</p>
                  
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[8px] font-mono text-slate-700 uppercase">Node_ID: 0x{idx + 10}</span>
                     <div className="h-1 flex-1 mx-4 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           whileInView={{ width: idx % 2 === 0 ? '70%' : '40%' }}
                           className={`h-full ${os.tag === 'Red Team' ? 'bg-rose-500/50' : 'bg-emerald-500/50'}`} 
                        />
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section 
            id="checklist"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-[3rem] p-12 grain"
          >
            <div className="flex items-center gap-6 mb-12">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <ClipboardCheck className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tighter uppercase italic">Security Checklist</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Pre-flight requirements: Verified</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {CHECKLIST.map((item, idx) => (
                <motion.div 
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-4 p-5 rounded-3xl border border-white/5 hover-tactical relative overflow-hidden ${
                    idx === 0 ? 'md:col-span-2 bg-emerald-500/5' : 'bg-white/[0.02]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-500/30 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section 
            id="vault"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-[3.5rem] p-12 relative overflow-hidden grain"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-14">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                   <Lock className="w-7 h-7 text-violet-400" />
                </div>
                <div>
                   <h2 className="text-3xl font-bold text-white tracking-tighter uppercase italic">Evidence Vault</h2>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Tactical Disclosure: Encrypted_L3</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                  disabled={!token}
                  className={`text-[10px] px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest transition-all ${
                    showEvidenceForm ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500 text-slate-900 shadow-2xl shadow-emerald-500/20"
                  } disabled:opacity-50`}
                >
                   {showEvidenceForm ? "Close Portal" : "New Finding"}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={loadEvidence}
                  disabled={!token}
                  className="text-[10px] px-8 py-3.5 rounded-2xl bg-white/5 text-slate-400 border border-white/10 hover:border-emerald-500/30 transition-all disabled:opacity-50 flex items-center gap-3 font-bold uppercase tracking-widest"
                >
                   <RefreshCw className="w-4 h-4" />
                   Sync Local
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {showEvidenceForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmitEvidence} 
                  className="mb-12 p-8 rounded-[2rem] border border-white/10 bg-white/[0.02] space-y-6 shadow-2xl overflow-hidden"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Finding Title</label>
                      <input
                        required
                        className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-5 py-3 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                        placeholder="e.g., Kernel Exploit POC"
                        value={newEvidence.title}
                        onChange={(e) => setNewEvidence({...newEvidence, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Evidence Type</label>
                      <select
                        className="w-full rounded-xl border border-white/5 bg-[#0b0d14] px-5 py-3 text-white focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                        value={newEvidence.evidence_type}
                        onChange={(e) => setNewEvidence({...newEvidence, evidence_type: e.target.value})}
                      >
                        <option value="log">Strategic Log</option>
                        <option value="screenshot">Visual Confirmation</option>
                        <option value="binary">Payload Binary</option>
                        <option value="report">Final Disclosure</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Description & Metadata</label>
                    <textarea
                      className="w-full h-32 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-3 text-white focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-slate-700"
                      placeholder="Provide deep analysis and reproduction steps..."
                      value={newEvidence.description}
                      onChange={(e) => setNewEvidence({...newEvidence, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Binary Payload / Screenshot</label>
                    <input
                      type="file"
                      className="w-full text-xs text-slate-400 file:mr-6 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-emerald-500 file:text-white hover:file:bg-emerald-400 transition-all cursor-pointer"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all shadow-[0_8px_30px_rgb(16,185,129,0.3)] uppercase tracking-widest text-xs"
                  >
                    Authorize & Store in Vault
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
                       <div className="space-y-4">
              {evidences.length === 0 ? (
                <div className="py-24 text-center border border-dashed border-white/5 rounded-[4rem] bg-white/[0.01] grain">
                   <Shield className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                   <p className="text-slate-600 text-xs font-black uppercase tracking-[0.4em] animate-pulse">Vault_Empty // Sync Required</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="px-10 py-4 grid grid-cols-[1fr_140px_120px] text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] border-b border-white/5 mb-6">
                    <span>Tactical Finding</span>
                    <span className="text-center">Classification</span>
                    <span className="text-right">Commit Date</span>
                  </div>
                  {evidences.map((ev, idx) => (
                    <motion.div 
                      key={ev.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="px-10 py-6 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group grid grid-cols-[1fr_140px_120px] items-center gap-8 hover-tactical grain"
                    >
                      <div className="flex items-center gap-6 min-w-0">
                        <div className="p-3.5 rounded-2xl bg-violet-500/10 group-hover:bg-emerald-500/10 border border-transparent group-hover:border-emerald-500/20 transition-all">
                          <FileCode className="w-5 h-5 text-violet-400 group-hover:text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-base tracking-tighter group-hover:text-emerald-400 transition-colors truncate uppercase">{ev.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-1.5 font-bold truncate uppercase tracking-widest">{ev.description}</p>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${
                          ev.evidence_type === 'binary' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                          ev.evidence_type === 'screenshot' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                          'text-slate-400 bg-slate-500/10 border-slate-500/20'
                        }`}>
                          {ev.evidence_type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono font-bold text-right tracking-tighter">
                        {new Date(ev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          <motion.section 
            id="terminal"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-[3.5rem] p-12 relative overflow-hidden group/term grain"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group-hover/term:scale-110 transition-transform">
                  <TerminalIcon className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                   <h2 className="text-3xl font-bold text-white tracking-tighter uppercase italic">Command Terminal</h2>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Live Interrogation: Ready</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-black text-emerald-400 tracking-widest uppercase bg-emerald-500/5 px-6 py-2.5 rounded-full border border-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                Node_Active
              </div>
            </div>
            <div className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-[#030408] shadow-2xl relative scanline-active">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400/30 to-emerald-500/0" />
              <div ref={termRef} className="h-96 w-full p-8 font-mono text-sm" />
            </div>
          </motion.section>

          <section id="internal" className="grid gap-8 lg:grid-cols-[1.8fr_1fr] items-stretch">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="glass rounded-[3rem] p-12 relative overflow-hidden grain hover-tactical"
            >
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <Server className="w-48 h-48 text-slate-400" />
               </div>
               <div className="flex items-center gap-6 mb-12">
                 <div className="p-4 rounded-2xl bg-slate-500/10 border border-slate-500/20">
                   <Server className="w-7 h-7 text-slate-400" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold text-white tracking-tighter uppercase italic">Infrastructure</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Interrogation: Active</p>
                 </div>
               </div>
               <div className="grid gap-6 sm:grid-cols-3">
                 {[
                   { label: "API_CORE", path: "/health", icon: Activity, color: "emerald" },
                   { label: "BUFFER_X", path: "/health/redis", icon: Zap, color: "blue" },
                   { label: "DATA_VAULT", path: "/health/mongo", icon: Database, color: "violet" },
                 ].map((s) => (
                   <div key={s.label} className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                     <s.icon className={`w-5 h-5 text-slate-500 mb-6 group-hover:text-${s.color}-400 transition-colors`} />
                     <p className="text-[10px] font-black text-white mb-2 uppercase tracking-[0.2em]">{s.label}</p>
                     <code className="text-[10px] text-slate-600 font-mono tracking-tighter">{s.path}</code>
                   </div>
                 ))}
               </div>
               <div className="mt-10 grid grid-cols-2 gap-6">
                 <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-6 hover:border-emerald-500/20 transition-colors">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Ingress Gate</p>
                   <p className="text-sm text-white font-bold flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                     PORT: 8080 // SECURE
                   </p>
                 </div>
                 <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-6 hover:border-blue-500/20 transition-colors">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">UI_Portal</p>
                   <p className="text-sm text-white font-bold flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                     PORT: 5174 // ACTIVE
                   </p>
                 </div>
               </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="glass rounded-[3rem] p-12 flex flex-col justify-center grain hover-tactical"
            >
               <h2 className="text-3xl font-bold text-white tracking-tighter uppercase italic flex items-center gap-5">
                 <RefreshCw className="w-7 h-7 text-emerald-500 animate-spin-slow" />
                 State Sync
               </h2>
               <p className="text-slate-500 text-xs font-bold mt-6 leading-relaxed uppercase tracking-widest">
                 Automated background synchronization protocol for tactical evidence commitment.
               </p>
               <ul className="mt-12 space-y-5">
                 {[
                   "Audit log synchronization",
                   "Buffer cache verification",
                   "Node state snapshotting",
                   "Authorization handshake"
                 ].map(item => (
                   <li key={item} className="flex items-center gap-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group/li">
                     <div className="w-6 h-[2px] bg-slate-800 group-hover/li:bg-emerald-500/50 transition-colors" />
                     {item}
                   </li>
                 ))}
               </ul>
            </motion.div>
          </section>
        </main>
      </div>
    </motion.div>
  )}
</AnimatePresence>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <footer className="mt-20 border-t border-white/5 bg-[#05060f]/60 backdrop-blur-xl py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Shield className="w-5 h-5 text-slate-600" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
              RedRainbow © 2026 | Cryptographically Secured
            </p>
          </div>
          <div className="flex gap-8">
            {["System Logs", "API Console", "Network Vitals"].map(item => (
              <button key={item} className="text-[10px] text-slate-600 font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors">
                {item}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

