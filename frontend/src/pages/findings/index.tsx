import React from 'react';

export const FindingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Raw Findings</h2>
      <p className="text-muted-foreground mt-1">Unprocessed alerts from Nmap, ZAP, and Trivy scanners.</p>
      <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">
        Ingesting raw scanner feeds...
      </div>
    </div>
  );
};
