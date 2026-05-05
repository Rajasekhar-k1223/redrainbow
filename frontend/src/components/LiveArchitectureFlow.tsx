import { motion } from "framer-motion";
import { Shield, Server, Activity, Database, Zap, Cpu } from "lucide-react";

const LiveArchitectureFlow = () => {
  const layers = [
    { id: "client", name: "Tactical Dashboard", icon: Shield, color: "text-glow-cyan" },
    { id: "orchestrator", name: "Neural Orchestrator", icon: Activity, color: "text-glow-cyan" },
    { id: "agents", name: "Agent Mesh (11 Nodes)", icon: Cpu, color: "text-glow-cyan" },
    { id: "ai", name: "SentinelX AI Engine", icon: Zap, color: "text-glow-green" },
    { id: "vault", name: "Evidence Vault", icon: Database, color: "text-glow-green" },
  ];

  const pulseCount = 8;

  return (
    <div className="relative w-full h-[600px] bg-black/40 rounded-xl border border-border/50 p-8 overflow-hidden backdrop-blur-xl flex flex-col items-center justify-between">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#00f2ff 1px, transparent 1px), linear-gradient(90deg, #00f2ff 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {layers.map((layer, idx) => (
        <div key={layer.id} className="relative z-10 w-full max-w-2xl flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-6 group"
          >
            <div className={`p-4 rounded-lg bg-card border border-border/50 group-hover:border-glow-cyan/50 transition-all shadow-2xl relative overflow-hidden`}>
              <layer.icon className={`h-6 w-6 ${layer.color}`} />
              <div className="absolute inset-0 bg-glow-cyan/5 group-hover:bg-glow-cyan/10 transition-colors" />
            </div>
            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">Layer 0{idx + 1}</p>
              <h3 className="font-bold text-sm text-foreground uppercase tracking-tight">{layer.name}</h3>
            </div>
          </motion.div>

          {/* Connection Lines & Pulses */}
          {idx < layers.length - 1 && (
            <div className="absolute left-[24px] top-[60px] bottom-[-20px] w-px bg-gradient-to-b from-glow-cyan/50 via-glow-cyan/10 to-transparent">
              {Array.from({ length: pulseCount }).map((_, pIdx) => (
                <motion.div
                  key={pIdx}
                  initial={{ top: "0%", opacity: 0 }}
                  animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: pIdx * (3 / pulseCount),
                    ease: "linear",
                  }}
                  className="absolute left-[-2px] h-4 w-[5px] bg-glow-cyan blur-[2px] rounded-full"
                />
              ))}
              {Array.from({ length: pulseCount }).map((_, pIdx) => (
                <motion.div
                  key={`glow-${pIdx}`}
                  initial={{ top: "0%", scale: 1 }}
                  animate={{ top: "100%", scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: pIdx * (3 / pulseCount),
                    ease: "linear",
                  }}
                  className="absolute left-[-4px] h-2 w-2 rounded-full bg-glow-cyan shadow-[0_0_10px_#00f2ff]"
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Side Status Indicators */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 space-y-4 hidden lg:block">
        <div className="p-4 rounded-lg border border-border/50 bg-black/40 backdrop-blur-md">
           <div className="flex items-center gap-2 mb-2">
             <div className="h-2 w-2 rounded-full bg-glow-cyan animate-pulse" />
             <span className="font-mono text-[9px] uppercase text-muted-foreground">Orchestration Active</span>
           </div>
           <p className="font-mono text-[8px] text-foreground opacity-70 leading-relaxed uppercase">
             Load Balancing: AGGRESSIVE<br/>
             Node Latency: ~14ms<br/>
             Data Velocity: 1.2GB/s
           </p>
        </div>
        <div className="p-4 rounded-lg border border-border/50 bg-black/40 backdrop-blur-md">
           <div className="flex items-center gap-2 mb-2">
             <div className="h-2 w-2 rounded-full bg-glow-green animate-pulse" />
             <span className="font-mono text-[9px] uppercase text-muted-foreground">Neural Sync Link</span>
           </div>
           <p className="font-mono text-[8px] text-foreground opacity-70 leading-relaxed uppercase">
             AI Integrity: 98%<br/>
             Synthesis: STABLE<br/>
             Sealing: ACTIVE
           </p>
        </div>
      </div>
    </div>
  );
};

export default LiveArchitectureFlow;
