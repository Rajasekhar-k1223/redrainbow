import React from 'react';
export const IdentityRiskPage: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight">Identity Security Platform</h2>
    <p className="text-muted-foreground mt-1">Privilege drift detection, excessive access monitoring, and identity risk scoring.</p>
    <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">Identity Risk Score: 68/100 — 7 Permission Drifts Detected</div>
  </div>
);
