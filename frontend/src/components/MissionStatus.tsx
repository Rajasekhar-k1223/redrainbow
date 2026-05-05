import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, Cpu, Zap, Search, Eye, Server, Database, CheckCircle, Clock, AlertTriangle, Globe, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface MissionStatusProps {
  status: string;
  logs: string[];
  scanId: string | null;
}

const MissionStatus = ({ status, logs, scanId }: MissionStatusProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    let interval: any;
    if (scanId && status !== "Completed" && status !== "Failed") {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [scanId, status]);

  // Map status strings to node indices for the animation
  useEffect(() => {
    if (status.includes("Phase 1")) setActiveNode(1);
    else if (status.includes("Phase 2")) setActiveNode(2);
    else if (status.includes("Phase 3")) setActiveNode(3);
    else if (status.includes("Phase 4")) setActiveNode(4);
    else if (status.includes("Phase 5")) setActiveNode(5);
    else if (status.includes("Phase 6")) setActiveNode(6);
    else if (status.includes("Phase 7")) setActiveNode(7);
    else if (status.includes("Phase 8")) setActiveNode(8);
    else if (status.includes("Phase 9")) setActiveNode(9);
    else if (status.includes("Phase 10")) setActiveNode(10);
    else if (status.includes("Phase 11")) setActiveNode(11);
    else if (status === "Completed") setActiveNode(12);
  }, [status]);

  const nodes = [
    { id: 1, name: "R", icon: Cpu, label: "REMnux: Harvesting" },
    { id: 2, name: "E", icon: Search, label: "Exif: Metadata" },
    { id: 3, name: "D", icon: Database, label: "DNS: Exhaustive" },
    { id: 4, name: "R", icon: Activity, label: "Radare2: Assembly" },
    { id: 5, name: "A", icon: Shield, label: "ArchStrike: Exploit" },
    { id: 6, name: "I", icon: Zap, label: "I2P: Sealing" },
    { id: 7, name: "N", icon: Server, label: "Nmap: Aggressive" },
    { id: 8, name: "B", icon: Eye, label: "Binwalk: Extraction" },
    { id: 9, name: "O", icon: Globe, label: "OWASP: Active" },
    { id: 10, name: "W", icon: Activity, label: "Wireshark: Packet" },
    { id: 11, name: "S", icon: Cpu, label: "SentinelX: Synthesis" },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Timer & Core Pulse */}
      <div className="flex items-center justify-between bg-black/40 border border-white/10 p-4 rounded-lg overflow-hidden relative">
        <div className="relative z-10">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Mission Chronometer</p>
          <p className="font-mono text-2xl text-glow-cyan font-bold tabular-nums">
            {Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:
            {(elapsedTime % 60).toString().padStart(2, '0')}
          </p>
        </div>
        
        {/* Pulsing Neural Core */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-20 w-20 rounded-full bg-glow-cyan/20 blur-xl"
          />
          <Activity className="h-8 w-8 text-glow-cyan animate-pulse" />
        </div>

        <div className="text-right relative z-10">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Topology Status</p>
          <p className={`font-mono text-xs uppercase font-bold ${status === 'Failed' ? 'text-destructive' : 'text-glow-green animate-pulse'}`}>
            {status || "Synchronizing..."}
          </p>
        </div>
      </div>

      {/* 11-Node Alphabetical Mesh Visualization */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2 h-auto">
        {nodes.map((node) => {
          const isNodeActive = activeNode === node.id;
          const isNodeComplete = activeNode > node.id;
          const NodeIcon = node.icon;

          return (
            <div key={node.id} className="relative flex flex-col items-center justify-center space-y-2 mb-4 lg:mb-0">
              <motion.div
                animate={isNodeActive ? { scale: [1, 1.1, 1], borderColor: ["rgba(6,182,212,0.3)", "rgba(6,182,212,1)", "rgba(6,182,212,0.3)"] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`h-10 w-10 lg:h-12 lg:w-12 rounded-lg border flex items-center justify-center transition-all duration-500 ${
                  isNodeActive ? 'bg-glow-cyan/10 border-glow-cyan shadow-[0_0_15px_rgba(6,182,212,0.5)]' :
                  isNodeComplete ? 'bg-glow-green/10 border-glow-green/40' :
                  'bg-white/5 border-white/10 opacity-40'
                }`}
              >
                <NodeIcon className={`h-5 w-5 ${isNodeActive ? 'text-glow-cyan' : isNodeComplete ? 'text-glow-green' : 'text-muted-foreground'}`} />
              </motion.div>
              <div className="flex flex-col items-center">
                <span className={`font-mono text-[9px] font-bold transition-colors ${isNodeActive ? 'text-glow-cyan' : 'text-muted-foreground'}`}>
                  {node.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tactical Phase Checklist (User's requested 'List') */}
      <div className="bg-black/20 border border-white/5 p-4 rounded-lg">
        <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
           <Shield className="h-3 w-3" /> Gauntlet Sequence Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          {nodes.map((node) => {
            const isNodeActive = activeNode === node.id;
            const isNodeComplete = activeNode > node.id;
            
            return (
              <div key={node.id} className="flex items-center justify-between py-1 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[10px] w-4 ${isNodeActive ? 'text-glow-cyan' : isNodeComplete ? 'text-glow-green' : 'text-white/20'}`}>
                    {node.name}
                  </span>
                  <span className={`font-mono text-[10px] uppercase tracking-tighter ${isNodeActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {node.label.split(':')[1].trim()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isNodeActive ? (
                    <span className="flex items-center gap-1.5 font-mono text-[9px] text-glow-cyan animate-pulse">
                      <Loader2 className="h-2.5 w-2.5 animate-spin" /> SCANNING
                    </span>
                  ) : isNodeComplete ? (
                    <span className="flex items-center gap-1.5 font-mono text-[9px] text-glow-green">
                      <CheckCircle className="h-2.5 w-2.5" /> FINALIZED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 font-mono text-[9px] text-white/20">
                      <Clock className="h-2.5 w-2.5" /> PENDING
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streaming Terminal */}
      <div className="flex-1 bg-black/80 rounded-lg border border-white/10 p-5 font-mono text-[11px] overflow-hidden flex flex-col shadow-inner min-h-[200px]">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-glow-green animate-pulse" />
            <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Live Intelligence Stream</span>
          </div>
          <span className="text-[9px] text-muted-foreground tabular-nums">ID: {scanId?.substring(0, 12)}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
          <AnimatePresence>
            {logs.length === 0 && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground italic animate-pulse"
              >
                [SYSTEM] Awaiting initial node telemetry...
              </motion.p>
            )}
            {logs.map((log, i) => {
               const isHeader = log.includes("###");
               const isError = log.toLowerCase().includes("error") || log.toLowerCase().includes("failed");
               const isAudit = log.includes("ZAP_AUDIT");
               const isAgent = log.includes("KALI") || log.includes("ZAP") || log.includes("QUBES") || log.includes("CAINE") || log.includes("REMNUX") || log.includes("SENTINEL-X");

               return (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, x: -10 }} 
                   animate={{ opacity: 1, x: 0 }}
                   className={`${isHeader ? 'text-primary font-bold mt-4 mb-2' : isError ? 'text-destructive' : isAudit ? 'text-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]' : isAgent ? 'text-glow-cyan' : 'text-foreground/70'}`}
                 >
                   <span className="text-white/20 mr-2">{(i+1).toString().padStart(3, '0')}</span>
                   {log}
                 </motion.div>
               );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MissionStatus;
