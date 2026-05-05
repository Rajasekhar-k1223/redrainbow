import { motion } from "framer-motion";
import { Radio, Wifi, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSignals } from "@/lib/api";

const severityColors: Record<string, string> = {
  Critical: "text-primary border-primary/30 bg-primary/10 shadow-[0_0_10px_rgba(255,0,0,0.2)]",
  High: "text-glow-amber border-glow-amber/30 bg-glow-amber/10 shadow-[0_0_10px_rgba(251,191,36,0.2)]",
  Medium: "text-secondary border-secondary/30 bg-secondary/10 shadow-[0_0_10px_rgba(6,182,212,0.2)]",
  Low: "text-glow-green border-glow-green/30 bg-glow-green/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]",
  Info: "text-muted-foreground border-border bg-muted/30",
};

const Signals = () => {
  const token = localStorage.getItem("redrainbow_token") || "";

  const { data: signals, isLoading, isFetching } = useQuery({
    queryKey: ["signals"],
    queryFn: () => getSignals(token),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Signal Mesh</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">Real-time telemetry from all endpoints</p>
        </div>
        {isFetching && <Loader2 className="h-4 w-4 text-glow-cyan animate-spin" />}
      </div>

      {/* Signal stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Signals", value: signals?.length || "0", icon: Radio },
          { label: "Active Sources", value: Array.from(new Set(signals?.map(s => s.source))).length.toString(), icon: Wifi },
          { label: "Critical Alerts", value: signals?.filter(s => s.severity === "High" || s.severity === "Critical").length.toString() || "0", icon: AlertTriangle },
          { label: "Mesh Status", value: "Optimal", icon: TrendingUp },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="p-4 rounded-lg border border-white/10 bg-black/40 backdrop-blur-md hover:border-glow-cyan/50 transition-all group">
            <s.icon className="h-4 w-4 text-secondary mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-xl font-bold text-foreground group-hover:text-glow-cyan transition-colors">{s.value}</p>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Signal feed */}
      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-glow-green animate-pulse" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">LIVE SIGNAL FEED</span>
          </div>
          <span className="font-mono text-[10px] text-white/20 uppercase">Mesh Encrypted (AES-256)</span>
        </div>
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 text-glow-cyan animate-spin" />
              <p className="font-mono text-xs text-muted-foreground">Synchronizing Signal Mesh...</p>
            </div>
          ) : signals?.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-mono text-xs text-muted-foreground italic">No active signals detected in the current mission window.</p>
            </div>
          ) : signals?.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 hover:bg-white/[0.03] transition-colors group cursor-default">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-secondary w-28 flex-shrink-0 font-bold group-hover:text-white transition-colors truncate" title={s.source}>{s.source}</span>
                <span className="text-sm text-foreground/80 flex-1 font-medium">{s.type}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border font-bold uppercase tracking-tighter ${severityColors[s.severity] || severityColors.Info}`}>
                  {s.severity}
                </span>
                <span className="font-mono text-[10px] text-white/30 w-16 text-right group-hover:text-white/60">{s.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Signals;
