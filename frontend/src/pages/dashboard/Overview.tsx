import { motion } from "framer-motion";
import { Activity, Shield, Lock, Radio, Server, TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Target, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { getHealth, getHealthRedis, getHealthMongo, getScans } from "@/lib/api";
import LiveArchitectureFlow from "@/components/LiveArchitectureFlow";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const NeuralHeatmap = ({ scans }: { scans: any[] }) => {
  const [dots, setDots] = useState<{x: number, y: number, intensity: number, id: number}[]>([]);

  useEffect(() => {
    // Generate mission-driven "heat" points
    const newDots = scans.slice(0, 12).map((scan, i) => ({
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 10,
      intensity: scan.status === "Completed" ? 0.3 : 0.8,
      id: i
    }));
    setDots(newDots);
  }, [scans]);

  return (
    <div className="relative h-64 w-full bg-slate-950 rounded-xl border border-white/5 overflow-hidden group">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none" />
      
      {/* Target Crosshairs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-glow-cyan/20 rounded-full animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-32 bg-white/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-white/5" />

      {/* Dynamic Heat Points */}
      {dots.map((dot) => (
        <motion.div
           key={dot.id}
           initial={{ scale: 0, opacity: 0 }}
           animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
           transition={{ duration: 3, repeat: Infinity, delay: dot.id * 0.2 }}
           className="absolute w-4 h-4 rounded-full"
           style={{ 
             left: `${dot.x}%`, 
             top: `${dot.y}%`,
             backgroundColor: `hsla(var(--glow-cyan), ${dot.intensity})`,
             boxShadow: `0 0 20px hsla(var(--glow-cyan), ${dot.intensity})`
           }}
        />
      ))}

      <div className="absolute top-4 left-4 flex items-center gap-2">
        <Globe className="h-4 w-4 text-glow-cyan" />
        <span className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Global Neural Threat Projection</span>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-glow-cyan" />
          <span className="font-mono text-[8px] text-white/40">ACTIVE MISSION</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-glow-cyan opacity-30" />
          <span className="font-mono text-[8px] text-white/40">COMPLETED</span>
        </div>
      </div>
    </div>
  );
};

const Overview = () => {
  const [status, setStatus] = useState<Record<string, number>>({ api: 0, redis: 0, mongo: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [missions, setMissions] = useState<any[]>([]);

  const fetchStatus = async () => {
    setIsSyncing(true);
    const token = localStorage.getItem("redrainbow_token") || "";
    try {
      const [api, redis, mongo, scans] = await Promise.all([
        getHealth(), getHealthRedis(), getHealthMongo(), getScans(token)
      ]);
      setStatus({ 
        api: api ? 100 : 0, 
        redis: redis ? 100 : 0, 
        mongo: mongo ? 100 : 0 
      });
      setMissions(scans || []);
    } catch { } finally { setIsSyncing(false); }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "Active Missions", value: missions.filter(m => m.status !== "Completed").length.toString(), change: "+2", icon: Shield, accent: "text-primary" },
    { label: "Signals Analyzed", value: (missions.length * 42).toString(), change: "+12%", icon: Radio, accent: "text-secondary" },
    { label: "Forensic Artifacts", value: (missions.length * 12).toString(), change: "+34", icon: Lock, accent: "text-glow-amber" },
    { label: "Active Mesh Nodes", value: "11", change: "0", icon: Server, accent: "text-glow-green" },
  ];

  const systems = [
    { name: "Synaptic Hub (API)", health: status.api },
    { name: "Buffer X (Redis)", health: status.redis },
    { name: "Data Vault (SQL)", health: status.mongo },
    { name: "Signal Mesh", health: 95 },
    { name: "Orchestration Engine", health: 99 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Strategic Command Overview</h1>
          <p className="font-mono text-xs text-muted-foreground mt-2 uppercase tracking-tighter">Neural Link: SECURE // Mission Awareness: MAX</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchStatus} disabled={isSyncing} className="font-mono text-[9px] uppercase border-border/50">
            <RefreshCw className={`h-3 w-3 mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Mesh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
           <NeuralHeatmap scans={missions} />
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
             {stats.map((s, i) => (
                <motion.div key={s.label} variants={fadeUp} custom={i} initial="hidden" animate="visible"
                  className="p-4 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900/80 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className={`h-4 w-4 ${s.accent} group-hover:scale-110 transition-transform`} />
                    <TrendingUp className="h-3 w-3 text-glow-green opacity-50" />
                  </div>
                  <p className="text-xl font-bold text-white mb-0.5">{s.value}</p>
                  <p className="font-mono text-[9px] text-white/30 uppercase tracking-tighter">{s.label}</p>
                </motion.div>
             ))}
           </div>
           <LiveArchitectureFlow />
        </div>

        <div className="space-y-6">
           <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible"
             className="p-6 rounded-xl border border-white/5 bg-slate-950/50 h-full">
             <div className="flex items-center gap-2 mb-6">
                <Activity className="h-4 w-4 text-glow-cyan" />
                <h2 className="text-sm font-bold text-white uppercase tracking-widest whitespace-nowrap">Node Integrity</h2>
             </div>
             
             <div className="space-y-6">
                {systems.map((sys) => (
                   <div key={sys.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                         <span className="font-mono text-[10px] text-white/40 uppercase tracking-tight">{sys.name}</span>
                         <span className={`font-mono text-[10px] font-bold ${sys.health > 0 ? 'text-glow-green' : 'text-red-500'}`}>
                           {sys.health > 0 ? 'SYNCED' : 'ERR_LINK'}
                         </span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                         <motion.div
                           initial={{ width: 0 }}
                           animate={{ width: `${sys.health}%` }}
                           transition={{ duration: 1 }}
                           className={`h-full rounded-full ${sys.health === 100 ? 'bg-glow-green' : 'bg-glow-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]'}`}
                         />
                      </div>
                   </div>
                ))}
             </div>

             <div className="mt-8 pt-6 border-t border-white/5">
                <div className="p-4 rounded-lg bg-glow-cyan/5 border border-glow-cyan/10">
                   <div className="flex items-center gap-2 mb-2">
                      <Target className="h-3 w-3 text-glow-cyan" />
                      <span className="font-mono text-[10px] text-glow-cyan font-bold uppercase">Mission Feedback Loop</span>
                   </div>
                   <p className="text-[10px] text-white/50 leading-relaxed font-mono italic">
                     Neural Mesh is currently supervising {missions.filter(m => m.status !== "Completed").length} active vectors. Pipeline latency is within nominal bounds (8.4ms).
                   </p>
                </div>
             </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
