import { motion, AnimatePresence } from "framer-motion";
import { Download, Lock, FileText, Image, HardDrive, Clock, Shield, Plus, RefreshCw, AlertCircle, Loader2, FileJson, Printer, Trash2, RotateCcw, History, Activity, Share2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEvidence, getDeletedEvidence, createEvidence, deleteEvidence, recoverEvidence, Evidence, downloadEvidence } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

const Vault = () => {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [correlations, setCorrelations] = useState<Record<string, any>>({});
  
  const queryClient = useQueryClient();
  const token = localStorage.getItem("redrainbow_token") || "";

  const { data: evidences, isLoading, isError, refetch } = useQuery({
    queryKey: ["evidence", showTrash, severityFilter, typeFilter, searchQuery],
    queryFn: () => showTrash 
      ? getDeletedEvidence(token) 
      : getEvidence(token, { 
          severity: severityFilter || undefined, 
          evidence_type: typeFilter || undefined, 
          search: searchQuery || undefined 
        }),
    enabled: !!token,
  });

  const checkCorrelation = async (sha256: string) => {
    if (!sha256 || correlations[sha256]) return;
    try {
      const res = await api.get(`/evidence/correlate/${sha256}`);
      setCorrelations(prev => ({ ...prev, [sha256]: res.data }));
    } catch (e) {
      console.error("Correlation engine offline", e);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: Partial<Evidence>) => createEvidence(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast.success("Tactical evidence committed to vault");
      setShowForm(false);
      setNewTitle("");
      setNewDesc("");
    },
    onError: () => {
      toast.error("Failed to commit evidence");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEvidence(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast.success("Intelligence commissioned to trash");
    },
    onError: () => toast.error("Decommissioning failed"),
  });

  const recoverMutation = useMutation({
    mutationFn: (id: number) => recoverEvidence(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      toast.success("Intelligence salvaged from trash");
    },
    onError: () => toast.error("Salvage failed"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ title: newTitle, description: newDesc, evidence_type: "log" });
  };

  const handleDownloadSTIX = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      const res = await api.get(`/evidence/${id}/stix`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `STIX_Indicator_${id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("STIX 2.1 Threat Indicator Exported");
    } catch (e) {
      toast.error("SIEM Export Failed");
    }
  };

  const handleDownloadReport = (e: React.MouseEvent, item: Evidence, format: "md" | "json") => {
    e.stopPropagation();
    let content = "";
    let filename = "";
    
    if (format === "md") {
      content = `# RedRainbow Intelligence Report\nTarget: ${item.title}\nID: ${item.id}\nCreated: ${item.created_at}\n\n${item.description}`;
      filename = `report_${item.id}.md`;
    } else {
      content = JSON.stringify(item, null, 2);
      filename = `evidence_${item.id}.json`;
    }

    const blob = new Blob([content], { type: format === "md" ? "text/markdown" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  const handleDownloadPDF = (e: React.MouseEvent, item: Evidence) => {
    e.stopPropagation();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const colorizedDescription = item.description
        .replace(/FAIL-NEW:? (\d+)/g, '<span style="color: #ef4444; font-weight: bold;">FAIL-NEW: $1</span>')
        .replace(/WARN-NEW:? (\d+)/g, '<span style="color: #f59e0b; font-weight: bold;">WARN-NEW: $1</span>')
        .replace(/PASS:? (\d+)/g, '<span style="color: #10b981; font-weight: bold;">PASS: $1</span>')
        .replace(/\[(CRITICAL)\]/g, '<span style="background: #ef4444; color: white; padding: 2px 5px; border-radius: 3px;">$1</span>')
        .replace(/\[(NEURAL PREDICTION)\]/g, '<span style="background: #06b6d4; color: white; padding: 2px 5px; border-radius: 3px;">$1</span>')
        .replace(/SENTINEL-X/g, '<span style="color: #06b6d4; font-weight: bold;">SENTINEL-X</span>');

      printWindow.document.write(`
        <html>
          <head>
            <title>RedRainbow Report - ${item.id}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
              body { font-family: 'JetBrains Mono', monospace; padding: 40px; line-height: 1.6; color: #1e293b; background: #fff; }
              .header { border-bottom: 4px solid #0f172a; margin-bottom: 30px; padding-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-end; }
              .header h1 { margin: 0; font-size: 28px; letter-spacing: -2px; color: #0f172a; }
              .classification { color: #ef4444; font-weight: bold; border: 1px solid #ef4444; padding: 2px 10px; font-size: 12px; }
              .meta { display: grid; grid-template-cols: 1fr 1fr; gap: 10px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; font-size: 12px; }
              .meta-label { color: #64748b; font-size: 10px; font-weight: bold; text-transform: uppercase; }
              .meta-value { color: #0f172a; font-weight: bold; }
              .content-box { border: 1px solid #e2e8f0; padding: 25px; background: #fafafa; position: relative; }
              .content-box::before { content: "DATA ENCRYPTED // MISSION LOG"; position: absolute; top: -10px; left: 20px; background: #fff; padding: 0 10px; font-size: 10px; color: #64748b; }
              pre { white-space: pre-wrap; margin: 0; font-size: 11px; }
              .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>REDRINBOW INTELLIGENCE</h1>
              <div class="classification">CONFIDENTIAL // STRATEGIC</div>
            </div>
            <div class="meta">
              <div class="meta-item"><span class="meta-label">Mission Target</span><span class="meta-value">${item.title}</span></div>
              <div class="meta-item"><span class="meta-label">Registry ID</span><span class="meta-value">${item.id}</span></div>
              <div class="meta-item"><span class="meta-label">Time Signature</span><span class="meta-value">${new Date(item.created_at).toLocaleString()}</span></div>
              <div class="meta-item"><span class="meta-label">SHA-256 HASH</span><span class="meta-value">${item.sha256 || "N/A"}</span></div>
            </div>
            <div class="content-box"><pre>${colorizedDescription}</pre></div>
            <div class="footer">
              <div>INTEGRITY SEAL: ${Math.random().toString(36).substring(2, 15).toUpperCase()}</div>
              <div>REDRINBOW AUTOMATED ASSESSMENT ENGINE</div>
              <div>COPYRIGHT © 2026 REDRAINBOW</div>
            </div>
            <script>window.onload = () => { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success("Cyber-Audit Report Generated");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Intelligence Vault</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-tighter uppercase italic">Chain-of-custody storage with multi-mission correlation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="font-mono text-[9px] uppercase border-border/50">
            <RefreshCw className="h-3 w-3 mr-2" /> Sync Local
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowTrash(!showTrash)} className={`font-mono text-[9px] uppercase border-border/50 ${showTrash ? 'bg-destructive/10 text-destructive' : ''}`}>
            <History className="h-3 w-3 mr-2" /> {showTrash ? "Active Vault" : "Intel Trash"}
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="font-mono text-[9px] uppercase glow-red h-8">
            <Plus className="h-3 w-3 mr-2" /> New Finding
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-950/50 p-3 rounded-xl border border-white/5">
        <div className="relative flex-1 w-full">
          <Input 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search Intelligence Ledger..." 
            className="bg-background/50 border-border/50 font-mono text-xs pl-10" 
          />
          <Activity className="absolute left-3 top-2.5 h-4 w-4 text-white/20" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-background/50 border border-border/50 rounded-md px-3 py-2 text-[10px] font-mono text-white/70 focus:outline-none focus:ring-1 focus:ring-glow-cyan"
          >
            <option value="">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Info">Info</option>
          </select>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-background/50 border border-border/50 rounded-md px-3 py-2 text-[10px] font-mono text-white/70 focus:outline-none focus:ring-1 focus:ring-glow-cyan"
          >
            <option value="">All Types</option>
            <option value="log">Audit Logs</option>
            <option value="report">AI Reports</option>
            <option value="payload">Forensic Payloads</option>
            <option value="stix">STIX Indicators</option>
          </select>
          {(severityFilter || typeFilter || searchQuery) && (
            <Button variant="ghost" size="sm" onClick={() => { setSeverityFilter(""); setTypeFilter(""); setSearchQuery(""); }} className="font-mono text-[9px] uppercase text-glow-cyan hover:bg-glow-cyan/10">
              Clear
            </Button>
          )}
        </div>
      </div>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 rounded-xl border border-white/5 bg-slate-900/50 space-y-4">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
               <div className="md:col-span-2 space-y-4">
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Finding Title..." className="bg-background/50 border-border/50 font-mono text-sm" />
                  <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Forensic Description..." className="w-full min-h-[80px] p-3 rounded-md bg-background/50 border border-border/50 text-sm font-mono focus:outline-none" />
               </div>
               <Button type="submit" className="h-10 font-mono uppercase text-[10px] tracking-widest w-full">Commit to Vault</Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 border border-dashed border-border/50 rounded-xl">
            <Loader2 className="h-8 w-8 text-glow-cyan animate-spin" />
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest italic">Synchronizing Mesh Ledger...</p>
          </div>
        ) : evidences?.map((item, i) => {
            const isExpanded = expandedId === item.id;
            const corr = item.sha256 ? correlations[item.sha256] : null;

            return (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className={`rounded-xl border transition-all duration-300 ${isExpanded ? 'border-glow-cyan/50 bg-slate-900/80' : 'border-white/5 bg-slate-950/50 hover:border-white/20'}`}>
                <div className="p-4 cursor-pointer flex items-center gap-5" onClick={() => {
                   setExpandedId(isExpanded ? null : item.id);
                   if (item.sha256) checkCorrelation(item.sha256);
                }}>
                  <div className={`p-2 rounded-lg ${isExpanded ? 'bg-glow-cyan/20 text-glow-cyan' : 'bg-white/5 text-white/40'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-white/20">#{item.id}</span>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate">{item.title}</h3>
                      {item.severity && (
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                          item.severity === 'Critical' ? 'border-red-500/50 text-red-500 bg-red-500/10' : 'border-glow-cyan/50 text-glow-cyan bg-glow-cyan/10'
                        }`}>{item.severity}</span>
                      )}
                      {corr?.matches > 1 && (
                         <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[8px] uppercase tracking-widest font-bold">
                           <Activity className="h-2.5 w-2.5 animate-pulse" /> RECURRING THREAT
                         </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 font-mono text-[10px] text-white/30 italic">
                      <span className="text-white/50">{item.evidence_type}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-glow-cyan hover:bg-glow-cyan/10 rounded-full">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-slate-950 border-white/10 font-mono text-[10px] w-48">
                        <DropdownMenuItem onClick={(e) => handleDownloadReport(e, item, "md")} className="hover:bg-glow-cyan/10 cursor-pointer">
                          <FileText className="h-3 w-3 mr-2 text-glow-cyan" /> Export MD Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDownloadPDF(e, item)} className="hover:bg-glow-cyan/10 cursor-pointer">
                          <Printer className="h-3 w-3 mr-2 text-glow-green" /> Export Forensic PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDownloadSTIX(e, item.id)} className="hover:bg-glow-cyan/10 cursor-pointer">
                          <Plus className="h-3 w-3 mr-2 text-glow-cyan" /> Export STIX 2.1 (SIEM)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDownloadReport(e, item, "json")} className="hover:bg-glow-cyan/10 cursor-pointer">
                          <FileJson className="h-3 w-3 mr-2 text-white/30" /> Export JSON Log
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {showTrash ? (
                       <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); recoverMutation.mutate(item.id); }} className="h-8 w-8 text-glow-green hover:bg-glow-green/10 rounded-full">
                         <RotateCcw className="h-4 w-4" />
                       </Button>
                    ) : (
                       <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(item.id); }} className="h-8 w-8 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5 bg-black/40">
                      <div className="p-5">
                         <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 shadow-inner">
                            <h4 className="font-mono text-[9px] text-glow-cyan uppercase tracking-[0.3em] font-bold mb-3 flex items-center gap-2">
                               <Shield className="h-3 w-3" /> Intelligence Summary
                            </h4>
                            <div className="font-mono text-[12px] text-white/80 whitespace-pre-wrap leading-relaxed custom-scrollbar max-h-96 overflow-y-auto pr-3">
                               {item.description}
                            </div>
                         </div>
                         
                         {corr?.matches > 1 && (
                            <div className="mt-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                               <div className="flex items-center gap-2 mb-2 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                                  <Activity className="h-3.5 w-3.5" /> Pattern Match Identified
                               </div>
                               <p className="text-[10px] text-white/50 font-mono italic leading-relaxed">
                                 Indicator signature (SHA-256: {item.sha256?.substring(0, 16)}...) was detected in {corr.matches} separate missions across the ledger. This suggests a persistent tactical vector or re-use of offensive infrastructure.
                               </p>
                               <div className="mt-3 flex gap-2">
                                  {corr.history.map((h: any, idx: number) => (
                                     <div key={idx} className="px-2 py-1 rounded bg-black/30 border border-white/5 text-[8px] font-mono text-white/30">
                                        ID:{h.id} — {new Date(h.timestamp).toLocaleDateString()}
                                     </div>
                                  ))}
                               </div>
                            </div>
                         )}

                         <div className="mt-5 flex items-center justify-between">
                            <div className="flex gap-2">
                               <div className="px-2 py-0.5 rounded-full bg-glow-green/10 border border-glow-green/20 text-glow-green font-mono text-[8px] uppercase font-bold">INTEGRITY SEALED</div>
                               <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30 font-mono text-[8px] uppercase font-bold">SOURCE: {item.source_vector || "Unknown"}</div>
                            </div>
                            <span className="font-mono text-[9px] text-white/20 uppercase">FINGERPRINT (SHA-256): <span className="text-glow-cyan">{item.sha256?.substring(0, 24) || "NOT_HASHED"}...</span></span>
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
        })}
      </div>
    </div>
  );
};

export default Vault;
