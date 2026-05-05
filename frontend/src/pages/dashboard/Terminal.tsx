import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon, Send, ChevronRight, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

const TerminalPage = () => {
  const [logs, setLogs] = useState<{ type: string; text: string; node?: string }[]>([
    { type: "system", text: "RedRainbow Forensic Console [Version 1.0.4]" },
    { type: "system", text: "Multi-Agent Mesh Bridge: ACTIVE // Tunneling via Docker Proxy" },
    { type: "system", text: "Use: node@command (e.g. kali@nmap localhost)" },
  ]);
  const [input, setInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isExecuting) return;

    let targetNode = "kali";
    let targetCmd = input;

    if (input.includes("@")) {
      [targetNode, targetCmd] = input.split("@");
    }

    setLogs(prev => [...prev, { type: "input", text: `${targetNode}@rrc: ${targetCmd}`, node: targetNode }]);
    setIsExecuting(true);

    try {
      const response = await api.post("/orchestrator/terminal/exec", {
        node: targetNode,
        command: targetCmd
      });

      const { output, status, exit_code } = response.data;
      
      setLogs(prev => [...prev, { 
        type: status === "success" ? "output" : "error", 
        text: output || (status === "blocked" ? "POLICY VIOLATION: Execution Restricted." : "Empty buffer returned.")
      }]);

      if (status !== "success") {
        toast.error(`Node ${targetNode} returned exit code ${exit_code}`);
      }
    } catch (error: any) {
      setLogs(prev => [...prev, { type: "system", text: `CORE_LINK_ERROR: ${error.response?.data?.detail || "Mesh Unreachable"}` }]);
      toast.error("Bridge Connection Lost");
    } finally {
      setIsExecuting(false);
      setInput("");
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mission Command Terminal</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 italic">Direct bypass into forensic agent kernels</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded bg-glow-green/10 border border-glow-green/20 flex items-center gap-2">
            <Zap className="h-3 w-3 text-glow-green" />
            <span className="font-mono text-[10px] text-glow-green font-bold">BYPASS ENABLED</span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 rounded-xl border border-border/50 bg-slate-950/90 shadow-2xl overflow-hidden flex flex-col min-h-[500px] relative"
      >
        <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-glow-cyan" />
          <span className="font-mono text-[11px] text-glow-cyan font-bold tracking-tight">root@redrainbow — /mesh/triage</span>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-glow-green/40" />
            </div>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-auto p-5 font-mono text-[13px] space-y-1.5 selection:bg-glow-cyan/30"
        >
          {logs.map((log, i) => (
            <div key={i} className={`flex gap-3 leading-relaxed ${
              log.type === "system" ? "text-slate-500 italic" :
              log.type === "input" ? "text-glow-cyan" :
              log.type === "error" ? "text-red-400" :
              "text-slate-300"
            }`}>
              {log.type === "input" && <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5" />}
              <span className="whitespace-pre-wrap">{log.text}</span>
            </div>
          ))}
          {isExecuting && (
            <div className="flex items-center gap-2 text-slate-500 italic">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Awaiting agent response...</span>
            </div>
          )}
        </div>

        <form onSubmit={handleCommand} className="p-4 border-t border-white/5 bg-slate-900/50 flex items-center gap-3">
          <div className="flex items-center gap-2 text-glow-cyan font-bold text-sm">
            <span>kali@rrc</span>
            <span className="text-white/30">:</span>
            <span className="text-glow-green">~</span>
            <span className="text-white/30">$</span>
          </div>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isExecuting}
            placeholder="Type command (e.g. remnux@curl http://target)..."
            className="flex-1 bg-transparent border-none font-mono text-sm text-foreground focus-visible:ring-0 h-8 p-0 placeholder:text-white/10"
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={isExecuting}
            className="bg-glow-cyan/10 hover:bg-glow-cyan/20 text-glow-cyan border border-glow-cyan/20 h-8 font-mono text-[10px] uppercase font-bold"
          >
            {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-2" />}
            {isExecuting ? "BUSY" : "EXEC"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default TerminalPage;
