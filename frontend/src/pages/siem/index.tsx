import React, { useEffect, useState } from 'react';
import { fetchSiemLogs } from '../../services/api';

interface SiemLog {
  id: string;
  timestamp: string;
  source_ip: string;
  event_type: string;
  severity: string;
  message: string;
  raw_payload: any;
}

export const SiemPage: React.FC = () => {
  const [logs, setLogs] = useState<SiemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchSiemLogs(filter !== 'ALL' ? filter : undefined);
        setLogs(data.logs || []);
      } catch (err) {
        console.error("Failed to load SIEM logs", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadLogs();
    
    // Poll every 5 seconds for real-time log ingestion feel
    const intervalId = setInterval(loadLogs, 5000);
    return () => clearInterval(intervalId);
  }, [filter]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': return 'text-glow-red font-bold';
      case 'HIGH': return 'text-orange-500';
      case 'MEDIUM': return 'text-yellow-500';
      case 'LOW': return 'text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SIEM Dashboard</h2>
          <p className="text-muted-foreground mt-1">Real-time centralized log ingestion and threat hunting.</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map(sev => (
            <button 
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors border ${filter === sev ? 'bg-black/80 border-glow-cyan text-glow-cyan' : 'bg-black/40 border-border/50 text-muted-foreground hover:text-white'}`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-black/60 border border-border/50 rounded-xl overflow-hidden font-mono text-sm h-[75vh] flex flex-col">
        <div className="p-3 border-b border-border/50 bg-black/40 text-xs text-muted-foreground grid grid-cols-12 gap-4">
          <div className="col-span-2">TIMESTAMP</div>
          <div className="col-span-1">SEVERITY</div>
          <div className="col-span-2">SOURCE IP</div>
          <div className="col-span-2">EVENT TYPE</div>
          <div className="col-span-5">MESSAGE</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading && logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">
              Connecting to log stream...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No logs matched the current filter.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="grid grid-cols-12 gap-4 px-2 py-1.5 hover:bg-white/5 rounded transition-colors group cursor-pointer">
                <div className="col-span-2 text-muted-foreground text-xs my-auto">
                  {new Date(log.timestamp).toISOString()}
                </div>
                <div className={`col-span-1 my-auto ${getSeverityColor(log.severity)}`}>
                  {log.severity}
                </div>
                <div className="col-span-2 text-gray-300 my-auto">
                  {log.source_ip || '-'}
                </div>
                <div className="col-span-2 font-bold text-gray-200 my-auto truncate">
                  {log.event_type}
                </div>
                <div className="col-span-5 text-gray-400 my-auto truncate group-hover:text-white transition-colors">
                  {log.message || '-'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
