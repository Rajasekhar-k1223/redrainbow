import React, { useEffect, useState } from 'react';
import { fetchComplianceReport } from '../../services/api';

interface Framework {
  id: string;
  name: string;
  score: number;
  status: string;
}

interface Violation {
  id: string;
  framework: string;
  control: string;
  asset: string;
  issue: string;
  severity: string;
}

export const CompliancePage: React.FC = () => {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchComplianceReport();
        setFrameworks(data.frameworks || []);
        setViolations(data.violations || []);
      } catch (err) {
        console.error("Failed to fetch compliance report", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-glow-green border-green-500/50 bg-green-500/10';
    if (score >= 75) return 'text-glow-cyan border-[hsl(var(--glow-cyan)/0.5)] bg-[hsl(var(--glow-cyan)/0.1)]';
    if (score >= 60) return 'text-yellow-500 text-glow-amber border-yellow-500/50 bg-yellow-500/10';
    return 'text-glow-red border-[hsl(var(--glow-red)/0.5)] bg-[hsl(var(--glow-red)/0.1)]';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-glow-red border-[hsl(var(--glow-red)/0.4)]';
      case 'high': return 'text-orange-500 border-orange-500/40 text-glow-amber';
      case 'medium': return 'text-yellow-500 border-yellow-500/40 text-glow-amber';
      default: return 'text-glow-green border-[hsl(var(--glow-green)/0.4)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance Architecture</h2>
          <p className="text-muted-foreground mt-1">Continuous framework monitoring and audit readiness.</p>
        </div>
        <button className="bg-[hsl(var(--surface-elevated))] hover:bg-[hsl(var(--glow-cyan)/0.2)] hover:border-glow-cyan transition-colors px-4 py-2 rounded-md border border-border/50 text-sm font-medium flex items-center gap-2">
          <span>📄</span> Export Audit Report
        </button>
      </div>

      {/* Framework Readiness Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-8 text-center text-muted-foreground animate-pulse">Calculating real-time compliance posture...</div>
        ) : frameworks.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-muted-foreground">No framework data available.</div>
        ) : (
          frameworks.map(fw => (
            <div key={fw.id} className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{fw.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-mono border ${getScoreColor(fw.score)}`}>
                  {fw.status}
                </span>
              </div>
              
              <div className="flex items-end gap-4 mt-4">
                <div className="text-5xl font-bold font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  {fw.score}%
                </div>
                <div className="flex-grow pb-2">
                  <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-border/50">
                    <div 
                      className={`h-full ${fw.score >= 90 ? 'bg-green-500' : fw.score >= 75 ? 'bg-[hsl(var(--glow-cyan))]' : fw.score >= 60 ? 'bg-yellow-500' : 'bg-[hsl(var(--glow-red))]'}`}
                      style={{ width: `${fw.score}%`, boxShadow: `0 0 10px ${fw.score >= 90 ? 'green' : fw.score >= 75 ? 'hsl(var(--glow-cyan))' : fw.score >= 60 ? 'yellow' : 'red'}` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Control Violations Mapping */}
      <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl overflow-hidden mt-8">
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-black/20">
          <h3 className="font-semibold text-lg">Active Control Violations</h3>
          <span className="text-sm text-muted-foreground bg-black/40 px-3 py-1 rounded border border-border/50">Mapped from Incident Data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-black/10">
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Framework</th>
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Control</th>
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Affected Asset</th>
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Violation Details</th>
                <th className="py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {violations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No active violations detected. Perfect compliance!</td>
                </tr>
              ) : (
                violations.map(violation => (
                  <tr key={violation.id} className="hover:bg-black/20 transition-colors group">
                    <td className="py-4 px-4 font-bold text-sm">{violation.framework}</td>
                    <td className="py-4 px-4 text-sm font-mono text-muted-foreground group-hover:text-foreground transition-colors">{violation.control}</td>
                    <td className="py-4 px-4 text-sm">{violation.asset}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{violation.issue}</td>
                    <td className="py-4 px-4">
                      <span className={`border px-2 py-0.5 rounded text-xs font-medium bg-black/40 ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
