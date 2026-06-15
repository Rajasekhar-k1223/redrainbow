import React, { useEffect, useState } from 'react';
import { fetchPlaybooks, executePlaybook } from '../../services/api';

interface Playbook {
  id: string;
  name: string;
  description: string;
  risk_level: string;
  requires_approval: boolean;
}

export const SoarPage: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPlaybooks();
        setPlaybooks(data.playbooks || []);
      } catch (err) {
        console.error("Failed to load playbooks", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleExecute = async (id: string) => {
    setExecuting(id);
    try {
      const result = await executePlaybook(id);
      alert(result.message); // Show the firewall response to the user
    } catch (err) {
      console.error("Failed to execute playbook", err);
      alert("Failed to execute playbook.");
    } finally {
      setExecuting(null);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'text-glow-red border-[hsl(var(--glow-red)/0.4)]';
      case 'medium': return 'text-yellow-500 border-yellow-500/40 text-glow-amber';
      case 'low': return 'text-glow-green border-[hsl(var(--glow-green)/0.4)]';
      default: return 'text-muted-foreground border-border/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SOAR</h2>
          <p className="text-muted-foreground mt-1">Security Orchestration, Automation, and Response playbooks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-muted-foreground animate-pulse">Loading playbooks...</p>
        ) : playbooks.length === 0 ? (
          <p className="text-muted-foreground">No playbooks available.</p>
        ) : (
          playbooks.map(pb => (
            <div key={pb.id} className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6 flex flex-col hover:border-[hsl(var(--glow-cyan)/0.5)] transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{pb.name}</h3>
                <span className={`border px-2 py-0.5 rounded text-xs font-medium bg-black/40 ${getRiskColor(pb.risk_level)}`}>
                  {pb.risk_level} Risk
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex-1 mb-6">{pb.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <span className="text-xs text-muted-foreground font-mono">
                  {pb.requires_approval ? '🔒 Approval Req.' : '⚡ Auto Execute'}
                </span>
                <button 
                  onClick={() => handleExecute(pb.id)}
                  disabled={executing === pb.id}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    executing === pb.id 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : pb.risk_level === 'High' 
                      ? 'bg-red-950/40 text-glow-red border border-[hsl(var(--glow-red)/0.4)] hover:bg-[hsl(var(--glow-red)/0.2)]'
                      : 'bg-black/40 border border-border/50 hover:border-glow-cyan hover:bg-[hsl(var(--glow-cyan)/0.1)] text-glow-cyan'
                  }`}
                >
                  {executing === pb.id ? 'Executing...' : 'Run Playbook'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
