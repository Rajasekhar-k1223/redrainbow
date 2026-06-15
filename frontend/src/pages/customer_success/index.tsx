import React from 'react';
export const CustomerSuccessPage: React.FC = () => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold tracking-tight">Customer Success Platform</h2>
    <p className="text-muted-foreground mt-1">Health score, adoption tracking, security maturity assessment and guided onboarding.</p>
    <div className="bg-[hsl(var(--surface-glass))] border border-border/50 rounded-xl p-6 h-64 flex items-center justify-center text-muted-foreground">Health Score: 82 | Adoption Score: 71 | Maturity: Managed</div>
  </div>
);
