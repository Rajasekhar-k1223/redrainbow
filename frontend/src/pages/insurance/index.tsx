import React from 'react';
export const InsurancePage: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight">Cyber Insurance Readiness</h2>
    <p className="text-muted-foreground mt-1">Insurance readiness scoring based on controls, resilience and compliance maturity.</p>
    <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">Insurance Readiness Score: 78/100 (Grade B+)</div>
  </div>
);
