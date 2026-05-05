import { motion, AnimatePresence } from "framer-motion";
import { Upload, Link2, Play, Activity, Server, Shield, Loader2, Target, CheckCircle, Volume2, VolumeX, RefreshCw, Eye, Terminal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitTarget, getScanStatus, getActiveScan, getScans, stopScan } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import MissionStatus from "@/components/MissionStatus";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Power } from "lucide-react";

const Missions = () => {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [scans, setScans] = useState<any[]>([]);
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [scanState, setScanState] = useState<{status: string, logs: string[]}>({ status: "", logs: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isStopping, setIsStopping] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStop = async (scanId: string) => {
    setIsStopping(scanId);
    try {
      const token = localStorage.getItem("redrainbow_token") || "";
      await stopScan(token, scanId);
      toast.success("Termination Signal Broadcasted");
      fetchScans();
    } catch (e: any) {
      toast.error(e.message || "Failed to broadcast termination");
    } finally {
      setIsStopping(null);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !file) {
      toast.error("Provide a Target URL or Upload a Payload");
      return;
    }

    setIsDeploying(true);
    try {
      const token = localStorage.getItem("redrainbow_token") || "";
      const res = await submitTarget(token, url, file || undefined);
      
      // Auto-open modal for new mission
      setActiveScanId(res.scan_id);
      setIsModalOpen(true);
      
      if (isSoundEnabled && audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(e => console.warn("Browser prevented audio autoplay", e));
      }
      
      toast.success("Orchestrator Pipeline Initiated");
      fetchScans(); // Refresh registry immediately
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize pipeline");
    } finally {
      setIsDeploying(false);
    }
  };

  const fetchScans = async () => {
    const token = localStorage.getItem("redrainbow_token") || "";
    try {
      const data = await getScans(token);
      setScans(data);
    } catch (e) {
      console.error("Registry sync failed", e);
    }
  };

  // Periodic Registry Sync
  useEffect(() => {
    fetchScans();
    const interval = setInterval(fetchScans, 10000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket for Modal view
  useEffect(() => {
    if (!activeScanId || !isModalOpen) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const ws = new WebSocket(`${protocol}//${host}:8080/orchestrator/ws/${activeScanId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setScanState(data);
    };

    return () => ws.close();
  }, [activeScanId, isModalOpen]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mission Control</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1">Multi-Pipeline Orchestration Node</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setIsSoundEnabled(!isSoundEnabled);
              if (isSoundEnabled && audioRef.current) audioRef.current.pause();
            }}
          >
            {isSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <audio ref={audioRef} src="/cyber.wav" preload="auto" />

      <div className="grid grid-cols-1 gap-6">
        {/* New Mission Entry Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-lg border border-border/50 bg-card/50 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Target className="h-32 w-32" />
          </div>
          
          <div className="flex items-center gap-3 mb-8">
            <Play className="h-5 w-5 text-glow-cyan" />
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">Initialize New Audit Payload</h2>
          </div>

          <form onSubmit={handleDeploy} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-3">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Target Vector (URL)</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://monitorix.co.in" 
                  className="pl-10 bg-background/50 border-border/50 font-mono text-sm h-12 transition-all focus:border-glow-cyan/50"
                  disabled={isDeploying}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Upload Binary Component</label>
              <div className="relative h-12 border border-dashed border-border/50 rounded-md flex items-center px-4 bg-background/30 hover:border-glow-cyan/50 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isDeploying}
                />
                <Upload className="h-4 w-4 text-muted-foreground mr-3" />
                <span className="font-mono text-[11px] text-muted-foreground truncate">{file ? file.name : "Select Forensic Payload..."}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isDeploying || (!url && !file)}
              className="h-12 font-mono text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 glow-red border-0"
            >
              {isDeploying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Deploy Pipeline
            </Button>
          </form>
        </motion.div>

        {/* Audit Registry - Unified Registry Table */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-glow-cyan" />
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">Mission Registry Ledger</h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1 border border-white/5 rounded-full bg-black/20">
                 <div className="h-2 w-2 rounded-full bg-glow-green animate-pulse" />
                 <span className="font-mono text-[9px] text-muted-foreground uppercase">Neural Link Active</span>
               </div>
               <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchScans}
                className="font-mono text-[9px] tracking-wider uppercase border-border/50 bg-transparent"
              >
                <RefreshCw className="h-3 w-3 mr-2" /> Refresh
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase text-muted-foreground py-4">Status</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-muted-foreground py-4">Mission ID</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-muted-foreground py-4">Target Vector</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-muted-foreground py-4">Phase Progress</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-muted-foreground py-4">Deployment Time</TableHead>
                  <TableHead className="text-right font-mono text-[10px] uppercase text-muted-foreground py-4">Tactical View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 font-mono text-xs text-muted-foreground italic opacity-50">
                      No missions synchronized with secondary storage.
                    </TableCell>
                  </TableRow>
                ) : (
                  scans.map((scan) => (
                    <TableRow key={scan.scan_id} className="border-border/50 hover:bg-white/5 transition-all group">
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`font-mono text-[9px] px-2 py-0 h-5 uppercase tracking-tighter ${
                            scan.status === 'Completed' ? 'border-glow-green text-glow-green bg-glow-green/10' :
                            scan.status === 'Failed' ? 'border-destructive text-destructive bg-destructive/10' :
                            scan.status === 'Interrupted' ? 'border-amber-500 text-amber-500 bg-amber-500/10' :
                            'border-glow-cyan text-glow-cyan bg-glow-cyan/10 animate-pulse'
                          }`}
                        >
                          {scan.status.includes("Phase") ? "Running" : scan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-glow-cyan font-bold py-4">{scan.scan_id}</TableCell>
                      <TableCell className="font-mono text-[10px] text-foreground/80 max-w-[180px] truncate">{scan.target}</TableCell>
                      <TableCell className="font-mono text-[9px] text-muted-foreground italic">
                        {scan.status.includes("Phase") ? scan.status : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground/60">
                        {new Date(scan.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActiveScanId(scan.scan_id);
                            setIsModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-glow-cyan/10 hover:text-glow-cyan transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {['Running', 'Mesh Active'].some(s => scan.status.includes(s)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isStopping === scan.scan_id}
                            onClick={(e) => { e.stopPropagation(); handleStop(scan.scan_id); }}
                            className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            title="Force Terminate"
                          >
                            {isStopping === scan.scan_id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>

      {/* Tactical Intelligence Modal (The "Popup" Requested) */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }
      }}>
        <DialogContent className="max-w-[90vw] w-[1200px] h-[85vh] bg-black/95 border-white/10 p-0 overflow-hidden flex flex-col backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,1)]">
          <DialogHeader className="p-6 border-b border-white/5 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-glow-cyan/10 rounded border border-glow-cyan/20">
                  <Terminal className="h-5 w-5 text-glow-cyan" />
                </div>
                <div>
                  <DialogTitle className="font-mono text-sm uppercase tracking-[0.3em] text-foreground">Mission Intelligence Stream</DialogTitle>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5 tracking-tighter">
                    Secure Node Link: {activeScanId} // Status: {scanState.status}
                  </p>
                </div>
              <div className="flex items-center gap-3">
                {['Running', 'Mesh Active'].some(s => scanState.status.includes(s)) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={isStopping === activeScanId}
                    onClick={() => activeScanId && handleStop(activeScanId)}
                    className="h-9 px-4 border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/20 font-mono text-[10px] uppercase tracking-widest"
                  >
                    {isStopping === activeScanId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                    Abort Mission
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden p-6 bg-black/40">
            <MissionStatus 
              status={scanState.status} 
              logs={scanState.logs} 
              scanId={activeScanId || ""} 
            />
          </div>

          <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-glow-green" />
                 <span className="text-[8px] font-mono uppercase text-muted-foreground mr-4">Live Satellite Link</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-1.5 w-1.5 rounded-full bg-glow-cyan animate-pulse" />
                 <span className="text-[8px] font-mono uppercase text-muted-foreground">Neural Sync Active</span>
               </div>
             </div>
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setIsModalOpen(false)}
               className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-white"
             >
               Dismiss Focused View [ESC]
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Missions;
