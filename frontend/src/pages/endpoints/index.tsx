import React, { useEffect, useState } from 'react';
import { fetchFleetStatus } from '../../services/api';

interface MonitorixAgent {
  id: string;
  hostname: string;
  os_version: string;
  ip_address: string;
  status: string;
  last_heartbeat: string;
}

export const EndpointsPage: React.FC = () => {
  const [agents, setAgents] = useState<MonitorixAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await fetchFleetStatus();
        setAgents(data.agents || []);
      } catch (err) {
        console.error("Failed to load fleet status", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadAgents();
    
    // Poll every 10 seconds to simulate real-time fleet management
    const intervalId = setInterval(loadAgents, 10000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Monitorix Fleet Management</h2>
          <p className="text-muted-foreground mt-1">Real-time telemetry and status of deployed C++ endpoint agents.</p>
        </div>
        <button className="bg-[hsl(var(--surface-elevated))] hover:bg-[hsl(var(--glow-cyan)/0.2)] hover:border-glow-cyan transition-colors px-4 py-2 rounded-md border border-border/50 text-sm font-medium">
          Generate Installer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Total Agents</h3>
          <p className="text-4xl font-light font-mono text-white">{agents.length}</p>
        </div>
        <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Online</h3>
          <p className="text-4xl font-light font-mono text-glow-green">{agents.filter(a => a.status === 'Online').length}</p>
        </div>
        <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Offline / Tampered</h3>
          <p className="text-4xl font-light font-mono text-glow-red">{agents.filter(a => a.status !== 'Online').length}</p>
        </div>
      </div>

      <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl overflow-hidden">
        {loading && agents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">
            Connecting to fleet control plane...
          </div>
        ) : agents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No active Monitorix agents found. Deploy an agent to see telemetry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-black/40 uppercase font-mono">
                <tr>
                  <th className="px-6 py-4 font-semibold">Hostname</th>
                  <th className="px-6 py-4 font-semibold">IP Address</th>
                  <th className="px-6 py-4 font-semibold">OS Version</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Last Heartbeat (UTC)</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-black/20 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-white group-hover:text-glow-cyan transition-colors">{agent.hostname}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{agent.ip_address}</td>
                    <td className="px-6 py-4">{agent.os_version}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${agent.status === 'Online' ? 'bg-[hsl(var(--glow-green))] shadow-[0_0_8px_hsl(var(--glow-green))]' : 'bg-[hsl(var(--glow-red))] shadow-[0_0_8px_hsl(var(--glow-red))]'}`}></div>
                        <span className={agent.status === 'Online' ? 'text-glow-green' : 'text-glow-red'}>{agent.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {new Date(agent.last_heartbeat).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="bg-black/40 hover:bg-black/60 border border-border/50 hover:border-glow-cyan transition-colors px-3 py-1 rounded text-xs">
                        View Telemetry
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
