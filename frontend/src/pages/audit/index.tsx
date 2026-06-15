import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../../services/api';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  details: string | null;
  timestamp: string;
}

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchAuditLogs();
        setLogs(data.data || []);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground mt-1">Immutable ledger of all critical platform actions.</p>
        </div>
      </div>

      <div className="bg-[hsl(var(--surface-glass))] backdrop-blur-md border border-border/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">
            Loading audit ledger...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No audit logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-black/40 uppercase font-mono">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp (UTC)</th>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Resource</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs whitespace-nowrap text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{log.user}</td>
                    <td className="px-6 py-4">
                      <span className="bg-black/40 border border-border/50 px-2 py-0.5 rounded text-xs font-mono text-glow-cyan">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{log.resource}</td>
                    <td className="px-6 py-4 text-muted-foreground truncate max-w-xs" title={log.details || ''}>
                      {log.details || '-'}
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
