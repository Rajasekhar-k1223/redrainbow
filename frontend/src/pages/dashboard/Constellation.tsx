import { motion } from "framer-motion";
import { Server, Wifi, WifiOff, Cpu, MemoryStick, RefreshCw, Loader2, Activity, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getNodeStats } from "@/lib/api";

const NeuralMesh = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: 0.1
          }}
          animate={{ 
            x: [null, Math.random() * window.innerWidth, Math.random() * window.innerWidth],
            y: [null, Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ 
            duration: 20 + Math.random() * 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute h-1 w-1 bg-glow-cyan rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
        />
      ))}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(6,182,212,0.1)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#meshGradient)" />
      </svg>
    </div>
  );
};

const Constellation = () => {
  const token = localStorage.getItem("redrainbow_token") || "";
  
  const { data: nodes, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["node_stats"],
    queryFn: () => getNodeStats(token),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6 relative min-h-screen">
      <NeuralMesh />
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Zap className="h-8 w-8 text-glow-cyan animate-pulse" />
            Parallel Mesh Constellation
          </h1>
          <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.5em] italic">Forensic agents synchronized across 11 high-fidelity nodes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-6 mr-6 font-mono text-[10px] text-white/20 uppercase tracking-widest">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-glow-green" /> Mesh Healthy</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-glow-cyan animate-pulse" /> AI Sync Active</div>
          </div>
          <button 
            onClick={() => refetch()}
            className="p-3 rounded-xl border border-white/10 bg-black/40 hover:bg-glow-cyan/10 hover:border-glow-cyan/50 transition-all duration-500 shadow-xl group"
            title="Force Telemetry Sync"
          >
            <RefreshCw className={`h-4 w-4 text-white/40 group-hover:text-glow-cyan ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {[...Array(11)].map((_, i) => (
            <div key={i} className="h-56 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {nodes?.map((node, i) => (
          <motion.div 
            key={node.name} 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
            className={`p-6 rounded-2xl border backdrop-blur-xl transition-all duration-500 group relative overflow-hidden ${
              node.status === "Online" 
                ? "bg-slate-950/60 border-white/10 hover:border-glow-cyan/40 shadow-[0_0_30px_rgba(6,182,212,0.05)]" 
                : "bg-amber-950/5 border-glow-amber/10 shadow-none grayscale opacity-60"
            }`}
          >
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 blur-3xl rounded-full transition-opacity duration-500 ${
              node.status === "Online" ? "bg-glow-cyan/5 group-hover:opacity-100 opacity-50" : "bg-transparent"
            }`} />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all duration-500 ${
                  node.status === "Online" 
                    ? "bg-glow-cyan/10 text-glow-cyan group-hover:scale-110 shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                    : "bg-white/5 text-white/20"
                }`}>
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-glow-cyan transition-colors">{node.name}</h3>
                  <p className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] mt-1">{node.role}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-mono font-bold uppercase tracking-widest ${
                node.status === "Online" 
                  ? "border-glow-green/20 bg-glow-green/5 text-glow-green shadow-[0_0_10px_rgba(34,197,94,0.1)]" 
                  : "border-glow-amber/20 bg-glow-amber/5 text-glow-amber"
              }`}>
                {node.status === "Online" ? <><Activity className="h-3 w-3 animate-pulse" /> Live</> : "Null"}
              </div>
            </div>

            <div className="space-y-5 relative">
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] text-white/30 flex items-center gap-2 uppercase tracking-widest"><Cpu className="h-3 w-3" /> Core Load</span>
                  <span className={`font-mono text-xs font-bold ${node.cpu > 80 ? 'text-glow-red' : 'text-glow-cyan'}`}>{node.cpu}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${node.cpu}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${node.cpu > 80 ? 'bg-glow-red' : 'bg-gradient-to-r from-glow-cyan/50 to-glow-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`} 
                  />
                </div>
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] text-white/30 flex items-center gap-2 uppercase tracking-widest"><MemoryStick className="h-3 w-3" /> Resource Pool</span>
                  <span className={`font-mono text-xs font-bold ${node.mem > 80 ? 'text-glow-amber' : 'text-white'}`}>{node.mem}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${node.mem}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full rounded-full ${node.mem > 80 ? 'bg-glow-amber' : 'bg-white/20'}`} 
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[9px] text-white/20 uppercase tracking-widest">
              <span className="bg-white/5 px-2 py-1 rounded-md text-white/40">{node.ip}</span>
              <span className="flex items-center gap-2"><Wifi className="h-3 w-3" /> {node.uptime}</span>
            </div>
          </motion.div>
        ))}
        </div>
      )}
    </div>
  );
};

export default Constellation;
