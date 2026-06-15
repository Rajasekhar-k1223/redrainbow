import React, { useEffect, useState } from 'react';
import { fetchThreatIntel } from '../../services/api';

interface Pulse {
  id: string;
  name: string;
  author: string;
  created: string;
  tags: string[];
  indicator_count: number;
  indicators: { type: string; indicator: string }[];
  risk_score: number;
}

// Mock data for APTs
const apts = [
  { id: 'apt29', name: 'APT29 (Cozy Bear)', origin: 'Russia', targets: 'Gov, Tech, Think Tanks', active: true },
  { id: 'lazarus', name: 'Lazarus Group', origin: 'North Korea', targets: 'Finance, Crypto', active: true },
  { id: 'volt-typhoon', name: 'Volt Typhoon', origin: 'China', targets: 'Critical Infrastructure', active: true },
];

export const ThreatIntelPage: React.FC = () => {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIntel = async () => {
      try {
        const data = await fetchThreatIntel();
        setPulses(data.pulses || []);
      } catch (err) {
        console.error("Failed to load intel", err);
      } finally {
        setLoading(false);
      }
    };
    loadIntel();
  }, []);

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'text-glow-red border-red-500/50 bg-red-500/10';
    if (score >= 70) return 'text-orange-500 border-orange-500/50 bg-orange-500/10 text-glow-amber';
    if (score >= 40) return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10 text-glow-amber';
    return 'text-glow-green border-green-500/50 bg-green-500/10';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Threat Intelligence</h2>
          <p className="text-muted-foreground mt-1">Global adversary tracking and vulnerability intel.</p>
        </div>
        <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md px-6 py-2 rounded-xl border border-red-500/50 flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--glow-red))] shadow-[0_0_10px_hsl(var(--glow-red))] animate-pulse"></div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Global Threat Level</div>
            <div className="text-xl font-bold text-glow-red tracking-widest">ELEVATED</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Pulse Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Live Threat Pulses <span className="text-xs bg-[hsl(var(--glow-cyan)/0.2)] text-[hsl(var(--glow-cyan))] px-2 py-1 rounded border border-[hsl(var(--glow-cyan)/0.5)]">OTX Connected</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Syncing with Global Threat Feeds...</div>
            ) : pulses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No active threat pulses available.</div>
            ) : (
              pulses.map(pulse => (
                <div key={pulse.id} className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-5 hover:border-[hsl(var(--glow-cyan)/0.5)] transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h4 className="font-bold text-lg text-glow-cyan group-hover:drop-shadow-[0_0_5px_hsl(var(--glow-cyan))] transition-all">{pulse.name}</h4>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">Author: <span className="text-foreground">{pulse.author}</span></span>
                        <span className="text-xs text-muted-foreground">Indicators: <span className="text-foreground">{pulse.indicator_count} IoCs</span></span>
                        <span className="text-xs text-muted-foreground">Discovered: <span className="text-foreground">{new Date(pulse.created).toLocaleString()}</span></span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pulse.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-black/40 border border-border/50 rounded text-xs text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-border/30">
                        <p className="text-xs text-muted-foreground mb-2">Sample Indicators (IoCs):</p>
                        <div className="flex flex-wrap gap-2">
                          {pulse.indicators.map((ioc, idx) => (
                            <span key={idx} className="font-mono text-xs bg-red-950/30 text-red-400 border border-red-900/50 px-2 py-1 rounded">
                              [{ioc.type}] {ioc.indicator}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border ${getRiskColor(pulse.risk_score)} shrink-0`}>
                      <span className="text-xs font-bold uppercase">RISK</span>
                      <span className="text-xl font-bold font-mono">{pulse.risk_score}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: APT Tracking */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Active Threat Actors</h3>
          <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl overflow-hidden">
            {apts.map((apt, idx) => (
              <div key={apt.id} className={`p-5 ${idx !== apts.length - 1 ? 'border-b border-border/50' : ''} hover:bg-black/20 transition-colors`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-glow-red">{apt.name}</h4>
                  {apt.active && (
                    <span className="flex items-center gap-1 text-xs text-glow-red border border-red-500/30 px-2 py-0.5 rounded bg-red-500/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Active
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm"><span className="text-muted-foreground">Origin:</span> {apt.origin}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Targets:</span> {apt.targets}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-5 mt-4">
            <h4 className="font-bold text-muted-foreground uppercase text-xs tracking-wider mb-3">Intel Data Sources</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-black/40 border border-border/50 rounded text-xs">CISA KEV</span>
              <span className="px-2 py-1 bg-black/40 border border-border/50 rounded text-xs">NVD</span>
              <span className="px-2 py-1 bg-black/40 border border-border/50 rounded text-xs">MITRE ATT&CK</span>
              <span className="px-2 py-1 bg-black/40 border border-[hsl(var(--glow-cyan)/0.3)] text-glow-cyan rounded text-xs shadow-[0_0_5px_hsl(var(--glow-cyan)/0.2)]">RedRainbow Cloud</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
