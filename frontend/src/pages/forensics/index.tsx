import React, { useEffect, useState } from 'react';
import { API_BASE_URL, TENANT_ID } from '../../services/api';
import { getAuthHeaders } from '../../services/auth';

interface ForensicEvent {
  time: string;
  event: string;
}

interface ForensicCase {
  id: string;
  title: string;
  status: string;
  assigned_to: string;
  artifacts_collected: number;
  timeline: ForensicEvent[];
}

export const ForensicsPage: React.FC = () => {
  const [cases, setCases] = useState<ForensicCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/forensics/cases`, {
          headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() }
        });
        const data = await response.json();
        setCases(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Digital Forensics Center</h2>
          <p className="text-muted-foreground mt-1">Chain of custody, artifact extraction, and timeline analysis.</p>
        </div>
        <button className="bg-[hsl(var(--surface-elevated))] border border-border/50 text-glow-cyan font-bold px-4 py-2 rounded-md hover:bg-black/40 transition-colors">
          + New Investigation
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-10 text-center animate-pulse text-muted-foreground">Loading forensic timelines...</div>
        ) : (
          cases.map((c) => (
            <div key={c.id} className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6">
              <div className="flex justify-between items-start mb-6 border-b border-border/50 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{c.title}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs font-mono text-muted-foreground">Case ID: <span className="text-glow-cyan">{c.id}</span></span>
                    <span className="text-xs font-mono text-muted-foreground">Assigned: {c.assigned_to}</span>
                    <span className="text-xs font-mono text-muted-foreground">Artifacts: {c.artifacts_collected} items in Vault</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-bold border ${c.status === 'Active Investigation' ? 'text-glow-amber border-yellow-500/50 bg-yellow-500/10' : 'text-glow-green border-green-500/50 bg-green-500/10'}`}>
                  {c.status}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Event Timeline Analysis</h4>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
                  {c.timeline.map((event, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border/50 bg-black/80 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:border-[hsl(var(--glow-cyan))] transition-colors">
                        <div className="w-2 h-2 rounded-full bg-[hsl(var(--glow-cyan))] shadow-[0_0_8px_hsl(var(--glow-cyan))]"></div>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-black/30 border border-border/30 p-4 rounded-xl shadow group-hover:border-border/60 transition-colors">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-sm text-foreground">{new Date(event.time).toLocaleString()}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{event.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
