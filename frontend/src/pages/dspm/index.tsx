import React from 'react';
export const DspmPage: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight">Data Security Posture (DSPM)</h2>
    <p className="text-muted-foreground mt-1">Discover, classify and risk-score PII, PHI, PCI and secrets across your environment.</p>
    <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">DSPM Engine Active — 2 Critical Exposures Detected</div>
  </div>
);
