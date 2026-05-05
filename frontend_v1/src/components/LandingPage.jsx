import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Lock,
  Globe,
  Terminal,
  Activity,
  Cpu,
  Database,
  Radar,
  Satellite,
  Sparkles,
} from "lucide-react";

const SIGNALS = [
  { label: "Threat Intel", value: "2.4M", note: "signals/day" },
  { label: "Ops Latency", value: "42ms", note: "edge sync" },
  { label: "Vault Integrity", value: "99.999%", note: "verified" },
];

const MODULES = [
  {
    title: "Mission Orchestration",
    desc: "Design, launch, and monitor Red/Blue/Purple drills with synchronized state and audit trails.",
    icon: Radar,
    tone: "emerald",
  },
  {
    title: "Evidence Vault",
    desc: "Chain-of-custody storage for logs, screenshots, and binaries with immutable time seals.",
    icon: Lock,
    tone: "amber",
  },
  {
    title: "Signal Mesh",
    desc: "Real-time telemetry fused from endpoints, services, and lab isolates.",
    icon: Satellite,
    tone: "blue",
  },
];

const OS_SHORT = [
  { name: "Kali", tag: "Red Team" },
  { name: "Security Onion", tag: "Blue Team" },
  { name: "Qubes", tag: "Isolation" },
  { name: "REMnux", tag: "Malware" },
  { name: "SECHub", tag: "Web App" },
  { name: "CAINE", tag: "Forensics" },
];

const LandingPage = ({ onEnter }) => {
  return (
    <div className="min-h-screen pt-10 pb-24 px-6 relative overflow-hidden">
      <div className="landing-atmo" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 text-slate-200 text-[10px] font-semibold uppercase tracking-[0.35em]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Secure orchestration suite
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="landing-title text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.85]"
            >
              RedRainbow
              <span className="block text-slate-200">Command Layer</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-300/80 text-lg sm:text-xl max-w-xl leading-relaxed"
            >
              A cinematic security cockpit for multi-OS labs. Orchestrate missions, seal evidence,
              and stream telemetry with zero ambiguity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEnter}
                className="landing-cta w-full sm:w-auto px-10 py-5 rounded-[2rem] text-sm uppercase tracking-[0.3em] font-bold"
              >
                Enter Operations
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                className="landing-ghost w-full sm:w-auto px-10 py-5 rounded-[2rem] text-sm uppercase tracking-[0.3em] font-semibold"
              >
                View Signal Map
              </motion.button>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SIGNALS.map((s) => (
                <div key={s.label} className="glass rounded-2xl p-4 border-white/10">
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">{s.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{s.note}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="landing-orb" />
            <div className="glass rounded-[3rem] p-8 border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.55)]">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Control Node</p>
                      <h3 className="text-lg font-bold text-white">Synaptic Hub</h3>
                    </div>
                  </div>
                  <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 uppercase tracking-widest">
                    Live
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Activity, label: "Telemetry", value: "Stable" },
                    { icon: Database, label: "Vault", value: "Sealed" },
                    { icon: Cpu, label: "Orchestration", value: "Ready" },
                    { icon: Globe, label: "Network", value: "Isolated" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <item.icon className="w-4 h-4 text-slate-400 mb-3" />
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.label}</p>
                      <p className="text-sm font-semibold text-white mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0b0f1b] p-5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest">
                    <span>Pipeline Sync</span>
                    <span className="text-emerald-400">+2.4%</span>
                  </div>
                  <div className="mt-4 h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 1.6 }}
                      className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-3">
          {MODULES.map((mod, idx) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="glass rounded-[2.5rem] p-8 border-white/10 relative overflow-hidden group"
            >
              <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full blur-[80px] ${
                mod.tone === "emerald"
                  ? "bg-emerald-500/20"
                  : mod.tone === "amber"
                    ? "bg-amber-500/20"
                    : "bg-blue-500/20"
              }`} />
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <mod.icon className="w-5 h-5 text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-white">{mod.title}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{mod.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 glass rounded-[2.75rem] p-10 border-white/10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">
                Multi-OS Constellation
              </p>
              <h2 className="text-3xl font-bold text-white">Specialized nodes, one cockpit.</h2>
              <p className="text-slate-400 text-sm max-w-xl">
                Execute precise test flows across curated OS roles while maintaining isolated, auditable state.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {OS_SHORT.map((os) => (
                <div key={os.name} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs font-semibold text-white">{os.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{os.tag}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          <div className="glass rounded-[2.5rem] p-8 border-white/10">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-emerald-300" />
              <h3 className="text-lg font-bold text-white">Live Command Terminal</h3>
            </div>
            <p className="text-slate-400 text-sm mt-4">
              Execute curated playbooks, capture logs, and publish findings directly to the vault.
            </p>
          </div>
          <div className="glass rounded-[2.5rem] p-8 border-white/10">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-300" />
              <h3 className="text-lg font-bold text-white">Signal Cohesion</h3>
            </div>
            <p className="text-slate-400 text-sm mt-4">
              Harmonize red and blue telemetry into a single, actionable narrative.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
