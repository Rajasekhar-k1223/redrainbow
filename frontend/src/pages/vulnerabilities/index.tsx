import React from 'react';

export const VulnerabilitiesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Vulnerability Management</h2>
      <p className="text-muted-foreground mt-1">CVE mapping, CVSS scoring, and risk prioritization.</p>
      <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
        Correlating active CVEs...
      </div>
    </div>
  );
};
